/**
 * Detection test: Puppeteer with headless Chrome (no evasion)
 *
 * Prerequisites:
 *   npm install  (inside test/detection/nodejs/)
 *   npm run dev  (in the project root, to start the Vite server on port 3000)
 *
 * Run:
 *   node puppeteer-headless.js
 */

const puppeteer = require('puppeteer');

const TARGET_URL = 'http://localhost:3000/test/dev-source.html';
const WAIT_TIMEOUT_MS = 15000;

(async () => {
    console.log('[puppeteer-headless] Launching headless Chrome...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    console.log(`[puppeteer-headless] Navigating to ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

    console.log('[puppeteer-headless] Waiting for fingerprint result...');
    await page.waitForFunction(
        () => window.result !== undefined,
        { timeout: WAIT_TIMEOUT_MS }
    );

    const fastBotDetectionDetails = await page.evaluate(
        () => window.result.fastBotDetectionDetails
    );

    console.log('\n=== fastBotDetectionDetails ===');
    console.log(JSON.stringify(fastBotDetectionDetails, null, 2));

    const triggered = Object.entries(fastBotDetectionDetails)
        .filter(([, v]) => v.detected)
        .map(([k]) => k);

    console.log(`\n=== Triggered detections (${triggered.length}) ===`);
    if (triggered.length === 0) {
        console.log('None');
    } else {
        triggered.forEach(name => console.log(` • ${name}`));
    }

    await browser.close();
    console.log('\n[puppeteer-headless] Done.');
})();
