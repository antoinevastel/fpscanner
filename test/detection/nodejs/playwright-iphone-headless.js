/**
 * Detection test: Playwright + Chromium + iPhone 15 device emulation (headless)
 *
 * Uses Playwright's built-in device descriptor for iPhone 15, which sets the
 * correct viewport, userAgent, deviceScaleFactor, and touch capabilities.
 *
 * Prerequisites:
 *   npm install  (inside test/detection/nodejs/)
 *   npx playwright install chromium
 *   npm run dev  (in the project root, to start the Vite server on port 3000)
 *
 * Run:
 *   node playwright-iphone-headless.js
 */

const { chromium, devices } = require('playwright');

const DEVICE = devices['iPhone 15'];
const TARGET_URL = 'http://localhost:3000/test/dev-source.html';
const WAIT_TIMEOUT_MS = 15000;

(async () => {
    console.log(`[playwright-iphone] Launching headless Chromium emulating "${DEVICE.userAgent.split(' ').slice(-1)[0]}"...`);
    console.log(`[playwright-iphone] Viewport: ${DEVICE.viewport.width}x${DEVICE.viewport.height}, dpr: ${DEVICE.deviceScaleFactor}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ ...DEVICE });
    const page = await context.newPage();

    console.log(`[playwright-iphone] Navigating to ${TARGET_URL}`);
    await page.goto(TARGET_URL);

    console.log('[playwright-iphone] Waiting for fingerprint result...');
    await page.waitForFunction(() => window.result !== undefined, { timeout: WAIT_TIMEOUT_MS });

    const fastBotDetectionDetails = await page.evaluate(() => window.result.fastBotDetectionDetails);

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
    console.log('\n[playwright-iphone] Done.');
})();
