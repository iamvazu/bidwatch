import { scrapeSamGov } from './sam_gov';
import { scrapePlanetBids } from './planet_bids';
import { PLANET_BIDS_PORTALS } from './registry';
import pool from '../db';

export async function runAll() {
  console.log('=== STARTING ALL SCRAPERS ===');
  
  try {
    // 1. Run SAM.gov
    console.log('Step 1: Running SAM.gov scraper...');
    await scrapeSamGov();

    // 2. Run PlanetBids Portals
    console.log('\nStep 2: Running PlanetBids scrapers (11 portals)...');
    
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
    return { success: true };
  } catch (err) {
    console.error('Fatal error in runner:', err);
    return { success: false, error: err };
  }
}

// Only run immediately if this script is executed directly via CLI
if (require.main === module) {
  runAll().then(() => process.exit(0));
}
