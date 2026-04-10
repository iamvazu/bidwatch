import axios from 'axios';
import crypto from 'crypto';
import pool from '../db/index.js';
import { Bid } from '../types/index.js';
import dotenv from 'dotenv';

dotenv.config();

function generateBidHash(agency: string, title: string, deadline: string | null): string {
  const content = `${agency}-${title}-${deadline || 'no-deadline'}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

export async function scrapeSamGov() {
  const apiKey = process.env.SAM_GOV_API_KEY || 'DEMO_KEY';
  const url = 'https://api.sam.gov/opportunities/v2/search';
  
  console.log('--- Starting SAM.gov Scrape ---');
  
  try {
    const response = await axios.get(url, {
      params: {
        api_key: apiKey,
        limit: 5,
        offset: 0,
        status: 'active',
        n: '561720',
        state: 'CA',
      }
    });

    const data = response.data;
    if (!data.opportunitiesData) {
      console.log('No opportunities found on SAM.gov');
      return;
    }

    let saved = 0;
    for (const opp of data.opportunitiesData) {
      const title = opp.title;
      const agency = opp.fullParentPathName || opp.organizationHierarchy?.[0]?.name || 'Unknown Federal Agency';
      const deadlineStr = opp.responseDeadLine || null;
      const hash = generateBidHash(agency, title, deadlineStr);

      await pool.query(
        `INSERT INTO bids (title, agency, region, portal, portal_url, est_value, deadline, posted_at, set_aside, naics, doc_urls, hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (hash) DO NOTHING`,
        [
          title, agency, 'Federal (CA)', 'SAM.gov', opp.uiLink || '', 'N/A',
          deadlineStr ? new Date(deadlineStr) : null, opp.publishDate ? new Date(opp.publishDate) : null,
          opp.typeOfSetAsideDescription || 'None', '561720', [], hash
        ]
      );
      saved++;
    }

    console.log(`SAM.gov Scrape Complete. Scanned: ${data.opportunitiesData.length}, Saved/Matched: ${saved}`);
  } catch (error: any) {
    console.error('Error scraping SAM.gov:', error.message);
  } finally {
    // await pool.end(); // Removed to allow runner to manage pool
  }
}

import { fileURLToPath } from 'url';
const isMain = process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].endsWith('sam_gov.ts'));

if (isMain) {
  scrapeSamGov().finally(() => pool.end());
}
