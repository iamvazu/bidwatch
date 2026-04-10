import { chromium } from 'playwright';

async function inspect() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to PlanetBids...');
  await page.goto('https://vendors.planetbids.com/portal/17950/bo/bo-search', { waitUntil: 'networkidle' });
  
  // Wait for the grid to load
  await page.waitForTimeout(5000);
  
  // Get all text on the page to see if we can find bid titles
  const bodyText = await page.innerText('body');
  console.log('--- Body Text Start ---');
  // console.log(bodyText); // Might be too long
  console.log('--- Body Text End ---');

  // Try to find the bid list table
  const tableExists = await page.isVisible('.pb-grid');
  console.log('Grid exists (.pb-grid):', tableExists);

  // Take a screenshot of the page and save it (even if we can't see it, it's good for debugging if we can download it later)
  // await page.screenshot({ path: 'planetbids_debug.png' });

  // Get the HTML of the main content area
  const content = await page.content();
  console.log('HTML Length:', content.length);
  
  // Look for specific planetbids selectors
  const gridRows = await page.$$('.pb-grid-row');
  console.log('Found .pb-grid-row count:', gridRows.length);

  await browser.close();
}

inspect().catch(console.error);
