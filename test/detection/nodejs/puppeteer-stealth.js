/**
 * Detection test: Puppeteer with puppeteer-extra-plugin-stealth
 *
 * The stealth plugin applies a collection of evasion techniques designed to
 * make headless Chrome look more like a real browser.
 *
 * Prerequisites:
 *   npm install  (inside test/detection/nodejs/)
 *   npm run dev  (in the project root, to start the Vite server on port 3000)
 *
 * Run:
 *   node puppeteer-stealth.js
 */

const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteerExtra.use(StealthPlugin());

const TARGET_URL = 'http://localhost:3000/test/dev-source.html';
const WAIT_TIMEOUT_MS = 15000;

(async () => {
    console.log('[puppeteer-stealth] Launching headless Chrome with stealth plugin...');

    const browser = await puppeteerExtra.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    console.log(`[puppeteer-stealth] Navigating to ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

    console.log('[puppeteer-stealth] Waiting for fingerprint result...');
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
    console.log('\n[puppeteer-stealth] Done.');
})();
