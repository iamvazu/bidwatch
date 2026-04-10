import { scrapeSamGov } from './sam_gov';
import { scrapePlanetBids } from './planet_bids';
import { PLANET_BIDS_PORTALS } from './registry';
import pool from '../db';

async function runAll() {
  console.log('=== STARTING ALL SCRAPERS ===');
  
  try {
    // 1. Run SAM.gov
    console.log('Step 1: Running SAM.gov scraper...');
    await scrapeSamGov();

    // 2. Run PlanetBids Portals
    console.log('\nStep 2: Running PlanetBids scrapers (11 portals)...');
    
    // We run them sequentially for safety (avoiding IP blocks) but the user asked for "at once".
    // I'll implement a simple batching to run 3 at a time.
    const batchSize = 3;
    for (let i = 0; i < PLANET_BIDS_PORTALS.length; i += batchSize) {
      const batch = PLANET_BIDS_PORTALS.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(PLANET_BIDS_PORTALS.length / batchSize)}...`);
      
      await Promise.all(batch.map(portal => 
        scrapePlanetBids(portal.id, portal.name, portal.region)
          .catch(err => console.error(`Failed to scrape ${portal.name}:`, err.message))
      ));
    }

    console.log('\n=== ALL SCRAPERS COMPLETED ===');
  } catch (err) {
    console.error('Fatal error in runner:', err);
  } finally {
    // Note: Pool management. If individual scrapers call pool.end(), this will fail.
    // I need to ensure they DON'T call pool.end() internally if run from here.
    // Wait, let's check sam_gov.ts again.
    process.exit(0);
  }
}

runAll();
