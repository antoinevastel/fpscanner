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

| Script | Framework | Evasion |
|---|---|---|
| `puppeteer-headless.js` | Puppeteer + headless Chrome | None |
| `puppeteer-stealth.js` | Puppeteer + puppeteer-extra-plugin-stealth | Yes |

### Setup

```bash
cd test/detection/nodejs
npm install
```

### Run

```bash
# Plain headless Chrome (expect many detections)
node puppeteer-headless.js

# With stealth plugin (fewer detections expected)
node puppeteer-stealth.js
```

---

## Python tests

Located in `python/`. Uses [undetected-chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) which patches the ChromeDriver binary to reduce detection.

### Setup

```bash
cd test/detection/python
pip install -r requirements.txt
```

### Run

```bash
python undetected_chromedriver_test.py
```
