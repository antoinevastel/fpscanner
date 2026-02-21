# Detection Quality Tests

These scripts are **not** part of the CI/CD pipeline. They are manual tools for evaluating how well fpscanner detects various automation frameworks.

Each script navigates to the local dev page (`http://localhost:3000/test/dev-source.html`), waits for the fingerprint to be collected, then prints the `fastBotDetectionDetails` object along with a summary of which detections were triggered.

## Prerequisites

Start the Vite dev server in the project root before running any of the scripts:

```bash
npm run dev
```

---

## Node.js tests

Located in `nodejs/`. Two variants:

| Script | Framework | Engine | Evasion |
|---|---|---|---|
| `puppeteer-headless.js` | Puppeteer | Chromium | None |
| `puppeteer-stealth.js` | Puppeteer + stealth plugin | Chromium | Yes |
| `playwright-chromium-headless.js` | Playwright | Chromium | None |
| `playwright-firefox-headless.js` | Playwright | Firefox | None |
| `playwright-webkit-headless.js` | Playwright | WebKit | None |
| `playwright-iphone-headless.js` | Playwright | Chromium | None (iPhone 15 emulation) |
| `playwright-android-headless.js` | Playwright | Chromium | None (Pixel 7 emulation) |

### Setup

```bash
cd test/detection/nodejs
npm install
npx playwright install chromium firefox webkit   # download browser binaries
```

### Run

```bash
node puppeteer-headless.js
node puppeteer-stealth.js
node playwright-chromium-headless.js
node playwright-firefox-headless.js
node playwright-webkit-headless.js
node playwright-iphone-headless.js
node playwright-android-headless.js
```

Or via npm scripts:

```bash
npm run test:headless
npm run test:stealth
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:iphone
npm run test:android
```

---

## Python tests

Located in `python/`. Two variants:

| Script | Framework | Evasion |
|---|---|---|
| `selenium_headless_test.py` | Selenium + headless Chrome | None |
| `undetected_chromedriver_test.py` | undetected-chromedriver | Yes (Chromium) |
| `camoufox_test.py` | Camoufox (patched Firefox) | Yes (Firefox, C++ level) |

### Setup

```bash
cd test/detection/python
pip install -r requirements.txt
python -m camoufox fetch   # one-time download of the Camoufox browser binary
```

### Run

```bash
# Plain headless Chrome via Selenium (expect many detections)
python selenium_headless_test.py

# With undetected-chromedriver patches (fewer detections expected)
python undetected_chromedriver_test.py

# Camoufox — patched Firefox, C++-level fingerprint spoofing via Playwright
python camoufox_test.py
```
