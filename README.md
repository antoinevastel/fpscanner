# Fingerprint Scanner

> **News:** After more than 7 years without any updates, I'm releasing a completely new version of FPScanner! This version includes both the fingerprinting code and detection logic in a single library. Consider this a beta release — feel free to use it in your projects. The overall API should remain stable, but expect some small changes as we refine the library based on feedback.

[![CI](https://github.com/antoinevastel/fpscanner/actions/workflows/ci.yml/badge.svg)](https://github.com/antoinevastel/fpscanner/actions/workflows/ci.yml)

## Sponsor

This project is sponsored by <a href="https://castle.io/?utm_source=github&utm_medium=oss&utm_campaign=fpscanner">Castle.</a>

<a href="https://castle.io/?utm_source=github&utm_medium=oss&utm_campaign=fpscanner"><img src="assets/castle-logo.png" alt="Castle" height="48" style="vertical-align: middle;"></a>

This library focuses on self-hosted fingerprinting and bot detection primitives. In real-world fraud and bot prevention, teams often need additional capabilities such as traffic observability, historical analysis, rule iteration, and correlation across device, network, and behavioral signals.

Castle provides a production-grade platform for bot and fraud detection, designed to operate at scale and handle these operational challenges end to end.

For a deeper explanation of what this library intentionally does not cover, see the **“Limits and non-goals”** section at the end of this README.


## FPScanner: description

A lightweight browser fingerprinting library for bot detection.

Scraping has become mainstream. AI and LLM-driven companies now crawl the web at a scale that was previously limited to specialized actors, often without clearly respecting `robots.txt` or rate limits. At the same time, fraudsters do not need to rely solely on public frameworks like OpenBullet or generic automation stacks anymore. With LLMs, writing a custom bot tailored to a specific website has become significantly easier, faster, and cheaper.

The result is a much broader and more diverse bot ecosystem:
- More actors scraping content, training models, or extracting data
- More custom automation, harder to fingerprint with outdated heuristics
- More abuse at signup, login, and sensitive workflows, not just simple scraping

On the defender side, the situation is much more constrained.

You often have two options:
- Very basic open source libraries that focus on naive or outdated signals
- Expensive, black-box bot and fraud solutions that require routing traffic through third-party CDNs or vendors

Not every website can afford enterprise-grade bot management products. And even when cost is not the main issue, you may not want to route all your traffic through a CDN or outsource all detection logic to a third party.

This library exists to fill that gap.

It is a **self-hosted, lightweight, and up-to-date** browser fingerprinting and bot detection library, designed with real-world constraints in mind. The goal is not to promise perfect detection, but to give you solid building blocks that reflect how bots actually behave today.

This includes practical considerations that are often ignored in toy implementations:
- Anti-replay protections (timestamp + nonce)
- Payload encryption to prevent trivial forgery
- Optional obfuscation to raise the cost of reverse-engineering
- Focus on strong, low-noise signals rather than brittle tricks

The design and trade-offs behind this library are directly inspired by real production experience and by the ideas discussed in these articles:
- [Roll your own bot detection: fingerprinting (JavaScript)](https://blog.castle.io/roll-your-own-bot-detection-fingerprinting-javascript-part-1/)
- [Roll your own bot detection: server-side detection](https://blog.castle.io/roll-your-own-bot-detection-server-side-detection-part-2/)

Those articles are not documentation for this library, but they reflect the same philosophy: understand what attackers actually do, accept that no single signal is perfect, and build simple, composable primitives that you fully control.

### Open Source, Production-Ready

This library is open source, but it is not naive about the implications of being open.

In bot detection, openness cuts both ways. Publishing detection logic makes it easier for attackers to study how they are detected. At the same time, defenders routinely study open and closed automation frameworks, anti-detect browsers, and bot tooling to discover new signals and weaknesses. This asymmetry already exists in the ecosystem, regardless of whether this library is open source or not.

The goal here is not to rely on obscurity. It is to acknowledge that attackers will read the code and still make abuse operationally expensive.

This is why the library combines transparency with pragmatic hardening:
- **Anti-replay mechanisms** ensure that a valid fingerprint cannot simply be captured once and reused at scale.
- **Build-time key injection** means attackers cannot trivially generate valid encrypted payloads without access to your specific build.
- **Optional obfuscation** raises the cost of reverse-engineering and makes automated payload forgery harder without executing the code in a real browser.

These controls are not meant to be perfect or unbreakable. Their purpose is to remove the easy shortcuts. An attacker should not be able to look at the repository, reimplement a serializer, and start sending convincing fingerprints from a headless script.

More importantly, detection does not stop at a single boolean flag.

Even if an attacker focuses on bypassing individual bot detection checks, producing **fully consistent fingerprints** over time is significantly harder. Fingerprints encode relationships between signals, contexts, and environments. Maintaining that consistency across sessions, IPs, and accounts requires real execution, careful state management, and stable tooling.

In practice, this creates leverage on the server side:
- Fingerprints can be tracked over time
- Reuse patterns and drift become visible
- Inconsistencies surface when attackers partially emulate environments or rotate tooling incorrectly

This is how fingerprinting is used in production systems: not as a one-shot verdict, but as a way to observe structure, reuse, and anomalies at scale.

Open source does not weaken this approach. It makes the trade-offs explicit. Attackers are assumed to be capable and adaptive, not careless. The library is designed accordingly: to force real execution, limit replay, and preserve enough structure in the signals that automation leaves traces once you observe it over time.


## Features

| Feature | Description |
|---------|-------------|
| **Fast bot detection** | Client-side detection of strong automation signals such as `navigator.webdriver`, CDP usage, Playwright markers, and other common automation artifacts |
| **Browser fingerprinting** | Short-lived fingerprint designed for attack detection, clustering, and session correlation rather than long-term device tracking |
| **Encrypted payloads** | Optional payload encryption to prevent trivial forgery, with the encryption key injected at build time |
| **Obfuscation** | Optional code obfuscation to increase the cost of reverse-engineering and make it harder to forge valid fingerprints without actually executing the collection code |
| **Cross-context validation** | Detects inconsistencies across different JavaScript execution contexts (main page, iframes, and web workers) |


---

## Quick Start

### Installation

```bash
npm install fpscanner
```

> **Note**: Out of the box, fpscanner uses a default placeholder encryption key and no obfuscation. This is fine for development and testing, but for production deployments you should build with your own key and enable obfuscation. See [Advanced: Custom Builds](#advanced-custom-builds) for details.

### Basic Usage

```javascript
import FingerprintScanner from 'fpscanner';

const scanner = new FingerprintScanner();
const payload = await scanner.collectFingerprint();

// Send payload to your server
fetch('/api/fingerprint', {
  method: 'POST',
  body: JSON.stringify({ fingerprint: payload }),
  headers: { 'Content-Type': 'application/json' }
});
```

### Server-Side (Node.js)

```javascript
// Decrypt and validate the fingerprint
// Use the same key you provided when building: npx fpscanner build --key=your-key
const key = 'your-secret-key'; // Your custom key

function decryptFingerprint(ciphertext, key) {
  const encrypted = Buffer.from(ciphertext, 'base64');
  const keyBytes = Buffer.from(key, 'utf8');
  const decrypted = Buffer.alloc(encrypted.length);

  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
  }

  return JSON.parse(decrypted.toString('utf8'));
}

app.post('/api/fingerprint', (req, res) => {
  const fingerprint = decryptFingerprint(req.body.fingerprint, key);

  // Check bot detection
  if (fingerprint.fastBotDetection) {
    console.log('🤖 Bot detected!', fingerprint.fastBotDetectionDetails);
    return res.status(403).json({ error: 'Bot detected' });
  }

  // Validate timestamp (prevent replay attacks)
  const ageMs = Date.now() - fingerprint.time;
  if (ageMs > 60000) { // 60 seconds
    return res.status(400).json({ error: 'Fingerprint expired' });
  }

  // Use fingerprint.fsid for session correlation
  console.log('Fingerprint ID:', fingerprint.fsid);
  res.json({ ok: true });
});
```

That's it! For most use cases, this is all you need.

---

## API Reference

### `collectFingerprint(options?)`

Collects browser signals and returns a fingerprint.

```javascript
const scanner = new FingerprintScanner();

// Default: returns encrypted base64 string
const encrypted = await scanner.collectFingerprint();

// Explicit encryption
const encrypted = await scanner.collectFingerprint({ encrypt: true });

// Raw object (no library encryption)
const fingerprint = await scanner.collectFingerprint({ encrypt: false });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `encrypt` | `boolean` | `true` | Whether to encrypt the payload |
| `skipWorker` | `boolean` | `false` | Skip Web Worker signals (use if CSP blocks blob: URLs) |

### Fingerprint Object

When decrypted (or with `encrypt: false`), the fingerprint contains:

```typescript
interface Fingerprint {
  // Bot detection
  fastBotDetection: boolean;           // true if any bot signal detected
  fastBotDetectionDetails: {
    hasWebdriver: boolean;             // navigator.webdriver === true
    hasWebdriverWritable: boolean;     // webdriver property is writable
    hasSeleniumProperty: boolean;      // Selenium-specific properties
    hasCDP: boolean;                   // Chrome DevTools Protocol signals
    hasPlaywright: boolean;            // Playwright-specific signals
    hasWebdriverIframe: boolean;       // webdriver in iframe context
    hasWebdriverWorker: boolean;       // webdriver in worker context
    // ... more detection flags
  };

  // Fingerprint
  fsid: string;                        // JA4-inspired fingerprint ID
  signals: { /* raw signal data */ };

  // Anti-replay
  time: number;                        // Unix timestamp (ms)
  nonce: string;                       // Random value for replay detection
}
```

---

## What It Detects

The library focuses on **strong, reliable signals** from major automation frameworks:

| Detection | Signal | Frameworks |
|-----------|--------|------------|
| `hasWebdriver` | `navigator.webdriver === true` | Selenium, Puppeteer, Playwright |
| `hasWebdriverWritable` | webdriver property descriptor | Puppeteer, Playwright |
| `hasSeleniumProperty` | `document.$cdc_`, `$wdc_` | Selenium WebDriver |
| `hasCDP` | CDP runtime markers | Chrome DevTools Protocol |
| `hasPlaywright` | `__playwright`, `__pw_*` | Playwright |
| `hasMissingChromeObject` | Missing `window.chrome` | Headless Chrome |
| `headlessChromeScreenResolution` | 800x600 default | Headless browsers |
| `hasHighCPUCount` | Unrealistic core count | VM/container environments |
| `hasImpossibleDeviceMemory` | Unrealistic memory values | Spoofed environments |

### Cross-Context Validation

Bots often fail to maintain consistency across execution contexts:

| Detection | Description |
|-----------|-------------|
| `hasWebdriverIframe` | webdriver detected in iframe but not main |
| `hasWebdriverWorker` | webdriver detected in web worker |
| `hasMismatchPlatformIframe` | Platform differs between main and iframe |
| `hasMismatchPlatformWorker` | Platform differs between main and worker |
| `hasMismatchWebGLInWorker` | WebGL renderer differs in worker |

---

## Fingerprint ID (fsid) Format

The `fsid` is a JA4-inspired, locality-preserving fingerprint identifier. Unlike a simple hash, it's structured into semantic sections, making it both human-readable and useful for partial matching.

### Format

```
FS1_<det>_<auto>_<dev>_<brw>_<gfx>_<cod>_<loc>_<ctx>
```

### Example

```
FS1_00000100000000_10010h3f2a_1728x1117c14m08b01011h4e7a9f_f1101011001e00000000p1100h2c8b1e_0h9d3f7a_1h6a2e4c_en4tEurope-Paris_hab12_0000h3e9f
```

### Section Breakdown

| # | Section | Format | Example | Description |
|---|---------|--------|---------|-------------|
| 1 | **Version** | `FS1` | `FS1` | Fingerprint Scanner version 1 |
| 2 | **Detection** | n-bit bitmask (21 bits in FS1) | `000001000000000000000` | All fastBotDetectionDetails booleans (extensible) |
| 3 | **Automation** | `<5-bit>h<hash>` | `10010h3f2a` | Automation booleans + hash |
| 4 | **Device** | `<W>x<H>c<cpu>m<mem>b<5-bit>h<hash>` | `1728x1117c14m08b01011h4e7a9f` | Screen, cpu, memory, device booleans + hash |
| 5 | **Browser** | `f<10-bit>e<8-bit>p<4-bit>h<hash>` | `f1101011001e00000000p1100h2c8b1e` | Features + extensions + plugins bitmasks + hash |
| 6 | **Graphics** | `<1-bit>h<hash>` | `0h9d3f7a` | hasModifiedCanvas + hash |
| 7 | **Codecs** | `<1-bit>h<hash>` | `1h6a2e4c` | hasMediaSource + hash |
| 8 | **Locale** | `<lang><n>t<tz>_h<hash>` | `en4tEurope-Paris_hab12` | Language code + count + timezone + hash |
| 9 | **Contexts** | `<4-bit>h<hash>` | `0000h3e9f` | Mismatch + webdriver flags + hash |

### Why This Format?

Inspired by [JA4+](https://github.com/FoxIO-LLC/ja4), this format enables:

1. **Partial Matching** — Compare specific sections across fingerprints (same GPU but different screen?)
2. **Human Readability** — `1728x1117c14m08` = 1728×1117 screen, 14 cores, 8GB RAM
3. **Extensibility** — Adding a new boolean check appends a bit without breaking existing positions
4. **Similarity Detection** — Bots from the same framework often share automation/browser hashes

<details>
<summary><strong>Bitmask Reference</strong></summary>

#### Detection Bitmask (21 bits in FS1, extensible)

> ⚠️ **Note**: The number of detection bits increases as new bot detection checks are added. Always check the fingerprint version (FS1, FS2, etc.) to know the exact bit count and meaning. New checks are appended to maintain backward compatibility.

```
Bit 0:  headlessChromeScreenResolution
Bit 1:  hasWebdriver
Bit 2:  hasWebdriverWritable
Bit 3:  hasSeleniumProperty
Bit 4:  hasCDP
Bit 5:  hasPlaywright
Bit 6:  hasImpossibleDeviceMemory
Bit 7:  hasHighCPUCount
Bit 8:  hasMissingChromeObject
Bit 9:  hasWebdriverIframe
Bit 10: hasWebdriverWorker
Bit 11: hasMismatchWebGLInWorker
Bit 12: hasMismatchPlatformIframe
Bit 13: hasMismatchPlatformWorker
Bit 14: hasSwiftshaderRenderer
Bit 15: hasUTCTimezone
Bit 16: hasMismatchLanguages
Bit 17: hasInconsistentEtsl
Bit 18: hasBotUserAgent
Bit 19: hasGPUMismatch
Bit 20: hasPlatformMismatch
```

#### Automation Bitmask (5 bits)

```
Bit 0: webdriver
Bit 1: webdriverWritable
Bit 2: selenium
Bit 3: cdp
Bit 4: playwright
```

#### Device Bitmask (5 bits)

```
Bit 0: hasMultipleDisplays
Bit 1: prefersReducedMotion
Bit 2: prefersReducedTransparency
Bit 3: hover
Bit 4: anyHover
```

#### Browser Features Bitmask (28 bits in FS1, extensible)

```
Bit 0:  chrome
Bit 1:  brave
Bit 2:  applePaySupport
Bit 3:  opera
Bit 4:  serial
Bit 5:  attachShadow
Bit 6:  caches
Bit 7:  webAssembly
Bit 8:  buffer
Bit 9:  showModalDialog
Bit 10: safari
Bit 11: webkitPrefixedFunction
Bit 12: mozPrefixedFunction
Bit 13: usb
Bit 14: browserCapture
Bit 15: paymentRequestUpdateEvent
Bit 16: pressureObserver
Bit 17: audioSession
Bit 18: selectAudioOutput
Bit 19: barcodeDetector
Bit 20: battery
Bit 21: devicePosture
Bit 22: documentPictureInPicture
Bit 23: eyeDropper
Bit 24: editContext
Bit 25: fencedFrame
Bit 26: sanitizer
Bit 27: otpCredential
```

#### Browser Extensions Bitmask (8 bits)

```
Bit 0: grammarly
Bit 1: metamask
Bit 2: couponBirds
Bit 3: deepL
Bit 4: monicaAI
Bit 5: siderAI
Bit 6: requestly
Bit 7: veepn
```

#### Plugins Bitmask (4 bits)

```
Bit 0: isValidPluginArray
Bit 1: pluginConsistency1
Bit 2: pluginOverflow
Bit 3: hasToSource
```

#### Contexts Bitmask (4 bits)

```
Bit 0: iframe mismatch
Bit 1: worker mismatch
Bit 2: iframe.webdriver
Bit 3: webWorker.webdriver
```

</details>

---

## Server-Side Decryption

The library uses a simple XOR cipher with Base64 encoding. This is easy to implement in any language.

### Node.js

```javascript
function decryptFingerprint(ciphertext, key) {
  const encrypted = Buffer.from(ciphertext, 'base64');
  const keyBytes = Buffer.from(key, 'utf8');
  const decrypted = Buffer.alloc(encrypted.length);

  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
  }

  let fingerprint = JSON.parse(decrypted.toString('utf8'));
  // Handle double-JSON-encoding if present
  if (typeof fingerprint === 'string') {
    fingerprint = JSON.parse(fingerprint);
  }
  return fingerprint;
}
```

### Python

```python
import base64
import json

def decrypt_fingerprint(ciphertext: str, key: str) -> dict:
    encrypted = base64.b64decode(ciphertext)
    key_bytes = key.encode('utf-8')

    decrypted = bytearray(len(encrypted))
    for i in range(len(encrypted)):
        decrypted[i] = encrypted[i] ^ key_bytes[i % len(key_bytes)]

    fingerprint = json.loads(decrypted.decode('utf-8'))
    # Handle double-JSON-encoding if present
    if isinstance(fingerprint, str):
        fingerprint = json.loads(fingerprint)
    return fingerprint
```

### Other Languages

The algorithm is straightforward to port:

1. **Base64 decode** the ciphertext to get raw bytes
2. **XOR each byte** with the corresponding key byte (cycling through the key)
3. **Decode** the result as UTF-8 to get the JSON string
4. **Parse** the JSON to get the fingerprint object

See the [`examples/`](./examples/) folder for complete Node.js and Python server examples.

---

## Advanced: Custom Builds

By default, fpscanner uses a placeholder key that gets replaced when you run the build command. For production, you should use your own encryption key and enable obfuscation to make it harder for attackers to forge payloads.

### Bring Your Own Encryption/Obfuscation

The library provides built-in encryption and obfuscation, but **you're not required to use them**. If you prefer:

- Use `collectFingerprint({ encrypt: false })` to get the raw fingerprint object
- Apply your own encryption, signing, or encoding before sending to your server
- Run your own obfuscation tool (Terser, JavaScript Obfuscator, etc.) on your bundle

The recommended approach is to use **some form of** encryption + obfuscation — whether that's the library's built-in solution or your own. The key is to prevent attackers from easily forging payloads without executing the actual collection code.

### Why Custom Builds?

| Threat | Without Protection | With Encryption + Obfuscation |
|--------|---------------------|-------------------|
| Payload forgery | Attacker can craft fake fingerprints | Key is hidden in obfuscated code |
| Replay attacks | Attacker captures and replays fingerprints | Server validates timestamp + nonce |
| Code inspection | Detection logic is readable | Control flow obfuscation makes analysis harder |

> **Note**: Obfuscation is not encryption. A determined attacker can still reverse-engineer the code. The goal is to raise the bar and force attackers to invest significant effort, not to create an impenetrable system.

### Build with Your Key

```bash
npx fpscanner build --key=your-secret-key-here
```

This will:
1. Rebuild the library with your key baked in
2. Obfuscate the output to protect the key
3. Overwrite the files in `node_modules/fpscanner/dist/`

### Key Injection Methods

The CLI supports multiple methods (in order of priority):

```bash
# 1. Command line argument (highest priority)
npx fpscanner build --key=your-secret-key

# 2. Environment variable
export FINGERPRINT_KEY=your-secret-key
npx fpscanner build

# 3. .env file
echo "FINGERPRINT_KEY=your-secret-key" >> .env
npx fpscanner build

# 4. Custom env file
npx fpscanner build --env-file=.env.production
```

### CI/CD Integration

Add a `postinstall` script to automatically build with your key:

```json
{
  "scripts": {
    "postinstall": "fpscanner build"
  }
}
```

Then set `FINGERPRINT_KEY` as a secret in your CI/CD:

**GitHub Actions:**

```yaml
env:
  FINGERPRINT_KEY: ${{ secrets.FINGERPRINT_KEY }}

steps:
  - run: npm install  # postinstall runs fpscanner build automatically
```

### Build Options

| Option | Description |
|--------|-------------|
| `--key=KEY` | Encryption key (highest priority) |
| `--env-file=FILE` | Load key from custom env file |
| `--no-obfuscate` | Skip obfuscation (faster, for development) |

#### Skip Obfuscation

Obfuscation is enabled by default. For faster builds during development:

```bash
# Via CLI flag
npx fpscanner build --key=dev-key --no-obfuscate

# Via environment variable
FINGERPRINT_OBFUSCATE=false npx fpscanner build

# In .env file
FINGERPRINT_OBFUSCATE=false
```

> ⚠️ **Warning**: Without obfuscation, the encryption key is visible in plain text in the source code. This means attackers can easily extract the key and forge fingerprint payloads without running the actual collection code. If you skip the library's obfuscation, make sure you apply your own obfuscation to the final bundle.

---

## Development

### Local Development Scripts

```bash
# Quick build (default key, no obfuscation)
npm run build

# Build with dev-key, no obfuscation
npm run build:dev

# Build + serve test/dev-source.html at localhost:3000
npm run dev

# Build with obfuscation
npm run build:obfuscate

# Production build (key from .env, with obfuscation)
npm run build:prod

# Watch mode (rebuilds on changes)
npm run watch
```

### Testing

```bash
npm test
```

---

## Security Best Practices

1. **Use a strong, random key and rotate it regularly**  
   Use a high-entropy key (at least 32 random characters) and rotate it periodically. Because the encryption key is shipped client-side in the JavaScript bundle, long-lived keys give attackers more time to extract and reuse them. Rotating the key forces attackers to re-analyze and re-adapt, and requires rebuilding and redeploying the fingerprinting script.

2. **Use obfuscation in production**  
   Enable the library’s built-in obfuscation or apply your own obfuscation step to the final bundle. Without obfuscation, the encryption key is visible in plain text in the client-side code, making it trivial to forge payloads without executing the fingerprinting logic. Obfuscation raises the cost of key extraction and payload forgery.

3. **Validate timestamps server-side**  
   Reject fingerprints that are older than a reasonable threshold (for example, 60 seconds). This limits the usefulness of captured payloads and reduces the impact of replay attacks.

4. **Track nonces**  
   Optionally store recently seen nonces and reject duplicates. This provides an additional layer of replay protection, especially for high-value or abuse-prone endpoints.

5. **Monitor fingerprint distributions over time**  
   Do not treat fingerprinting as a one-shot decision. Monitor how fingerprints evolve and distribute over time. Sudden spikes, new dominant fingerprints, or unusual reuse patterns can indicate automated or malicious activity, even if individual requests do not trigger explicit bot detection flags.

6. **Defense in depth on sensitive endpoints**  
   When protecting sensitive flows (signup, login, password reset, API access), combine this library with other controls such as fingerprint-based rate limiting, behavioral analysis, disposable emails detection and challenge mechanisms like CAPTCHAs or risk-based authentication. Fingerprinting works best as one layer in a broader detection and mitigation strategy.


---

## Troubleshooting

### "No encryption key found!"

Provide a key via one of the supported methods:

```bash
npx fpscanner build --key=your-key
# or
export FINGERPRINT_KEY=your-key && npx fpscanner build
# or
echo "FINGERPRINT_KEY=your-key" >> .env && npx fpscanner build
```

### Decryption returns garbage

Make sure you're using the **exact same key** on your server that you used when building. Keys must match exactly.

### Obfuscation is slow

Use `--no-obfuscate` during development. Only enable obfuscation for production builds.

### `postinstall` fails in CI

Ensure `FINGERPRINT_KEY` is set as an environment variable before `npm install` runs.

---

## Limits and non-goals

This library provides building blocks, not a complete bot or fraud detection system. It is important to understand its limits before using it in production.

### Open source and attacker adaptation

The library is open source, which means attackers can inspect the code and adapt their tooling. This is expected and reflects how the ecosystem already works. Defenders routinely analyze automation frameworks and anti-detect browsers, and attackers do the same with detection logic.

The goal is not secrecy, but to make abuse operationally expensive by forcing real execution, limiting replay, and preserving consistency constraints that are difficult to fake at scale.

### Obfuscation is not a silver bullet

The optional obfuscation relies on an open source obfuscator, and some attackers maintain deobfuscation tooling for it. Obfuscation is a friction mechanism, not a guarantee. It slows down analysis and discourages low-effort abuse, but motivated attackers can still reverse-engineer the code.

### Limits of client-side detection

All client-side fingerprinting and bot detection techniques can be spoofed or emulated. This library focuses on strong, low-noise signals, but no individual signal or fingerprint should be treated as definitive.

Fingerprints are representations, not verdicts. Their value comes from observing how they behave over time, how often they appear, and how they correlate with actions, IPs, and accounts.

### Not an end-to-end solution

Real-world bot and fraud detection requires server-side context, observability, and iteration: the ability to monitor traffic, build and test rules, and adapt over time. This library intentionally does not provide dashboards, rule engines, or managed mitigation.

If you need a production-grade, end-to-end solution with observability and ongoing maintenance, consider using a dedicated platform like [Castle](https://castle.io/).


---

## License

MIT
