import { scrapePlanetBids } from './scrapers/planet_bids.js';

async function test() {
  console.log('--- TEST RUN: PlanetBids Scraper ---');
  // City of San Diego
  await scrapePlanetBids('17950', 'City of San Diego', 'San Diego');
  console.log('--- TEST COMPLETED ---');
  process.exit(0);
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
