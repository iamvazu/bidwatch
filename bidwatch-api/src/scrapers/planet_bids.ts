import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
const stealth = stealthPlugin();
import crypto from 'crypto';
import pool from '../db/index.js';
import { PdfService } from '../services/pdf_service.js';
import { CaptchaService } from '../services/captcha_service.js';

// Use stealth plugin
chromium.use(stealth);

function generateBidHash(agency: string, title: string, id: string): string {
  const content = `${agency}-${title}-${id}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

export async function scrapePlanetBids(portalId: string, agencyName: string, region: string) {
  console.log(`--- Starting Scrape: ${agencyName} (ID: ${portalId}) ---`);
  
  const browser = await chromium.launch({ 
    headless: true, // Set to false if you want to see the action locally
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    const url = `https://vendors.planetbids.com/portal/${portalId}/bo/bo-search`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Check for WAF / Captcha
    const wafParams = await CaptchaService.detectWaf(page);
    if (wafParams) {
      console.log('Amazon WAF detected. Attempting to solve...');
      const token = await CaptchaService.solveAmazonWaf(url, wafParams.siteKey, wafParams.iv, wafParams.context);
      if (token) {
        console.log('Captcha solved. Injecting token...');
        // Injection logic varies, but usually setting a cookie or calling a JS function works
        await page.evaluate((t) => {
          document.cookie = `aws-waf-token=${t}; path=/; domain=vendors.planetbids.com`;
          window.location.reload();
        }, token);
        await page.waitForTimeout(5000);
      } else {
        console.warn('Captcha solving failed (likely missing API key). Skipping this portal.');
        return;
      }
    } else {
      console.log('No WAF detected or already bypassed.');
    }

    // Filter for "Janitorial"
    await page.waitForTimeout(3000);
    const searchInput = await page.locator('input[placeholder*="Search"], input[title*="Search"], .pb-search-input').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Janitorial');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000); // Wait for results
    }

    // Capture bid rows
    const rows = await page.locator('.pb-grid-row, tr.grid-row').all();
    console.log(`Found ${rows.length} results for ${agencyName}`);

    for (let i = 0; i < rows.length; i++) {
      try {
        // Refresh rows to avoid stale element reference
        const currentRow = (await page.locator('.pb-grid-row, tr.grid-row').all())[i];
        if (!currentRow) continue;

        const title = await currentRow.locator('.pb-grid-cell[data-column="Project Title"], td:nth-child(2)').innerText();
        const bidId = await currentRow.locator('.pb-grid-cell[data-column="Bid Number"], td:nth-child(1)').innerText();
        const deadlineStr = await currentRow.locator('.pb-grid-cell[data-column="Bid Due Date"], td:nth-child(3)').innerText();
        
        if (!title || !bidId) continue;
        console.log(`Processing bid: ${bidId} - ${title}`);

        // Click on the row to open details
        await currentRow.click();
        await page.waitForTimeout(3000);

        // Extract more info from details panel
        // Note: PlanetBids details are often in a right panel or a popup
        let estValue = 'N/A';
        const docUrls: string[] = [];
        let rawText = '';

        // Try to find "Documents" tab
        const docTab = page.locator('.pb-tabs-header-item:has-text("Documents"), .pb-tab-label:has-text("Documents")').first();
        if (await docTab.isVisible()) {
          await docTab.click();
          await page.waitForTimeout(2000);
          
          // Look for PDF links
          const pdfLinks = await page.locator('a[href*=".pdf"], .pb-document-download-link').all();
          for (const link of pdfLinks) {
            const href = await link.getAttribute('href');
            if (href && href.startsWith('http')) {
              docUrls.push(href);
            }
          }
          
          if (docUrls.length > 0) {
            console.log(`Found ${docUrls.length} document links. Attempting to parse...`);
            rawText = await PdfService.extractTextFromUrls(docUrls);
          }
        }

        const hash = generateBidHash(agencyName, title, bidId);
        const deadline = deadlineStr ? new Date(deadlineStr) : null;

        await pool.query(
          `INSERT INTO bids (title, agency, region, portal, portal_url, est_value, deadline, posted_at, set_aside, naics, doc_urls, hash, raw_text)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (hash) DO UPDATE SET raw_text = EXCLUDED.raw_text, doc_urls = EXCLUDED.doc_urls`,
          [
            title, agencyName, region, 'PlanetBids', url, estValue,
            deadline, new Date(), 'None', '561720', docUrls, hash, rawText
          ]
        );

        // Go back to list if needed (PlanetBids usually keeps list open)
        // If it's a popup, close it
        const closeBtn = page.locator('.pb-panel-close, .pb-dialog-close').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(1000);
        }

      } catch (err: any) {
        console.error(`Error processing row ${i}:`, err.message);
      }
    }

  } catch (error: any) {
    console.error(`Error scraping ${agencyName}:`, error.message);
  } finally {
    await browser.close();
  }
}
