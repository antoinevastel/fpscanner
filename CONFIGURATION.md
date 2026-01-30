# Configuration & Installation Guide

## Why Custom Builds?

Fingerprint Scanner uses a **build-time key injection** system rather than runtime configuration. This is a deliberate security decision designed to protect the integrity of fingerprint data.

### Security Motivation

#### 1. Preventing Payload Forgery

If the encryption key were passed at runtime (e.g., `new FingerprintScanner({ key: 'xxx' })`), an attacker could:

- Inspect your frontend code to find the key
- Craft fake fingerprint payloads without running the actual detection code
- Submit fabricated "clean" fingerprints to bypass bot detection

By baking the key into an **obfuscated build**, extracting it becomes significantly harder. The key is embedded within minified, control-flow-flattened, string-encoded code.

#### 2. Preventing Replay Attacks

Combined with the `nonce` and `time` fields in the fingerprint, the encrypted payload helps prevent replay attacks where an attacker:

1. Captures a legitimate fingerprint from a real browser
2. Replays it repeatedly from automated scripts

Your server can decrypt the payload, verify the timestamp, and reject stale or reused fingerprints.

#### 3. Code Integrity

Obfuscation makes it harder for attackers to:

- Understand the detection logic
- Identify which signals are being collected
- Craft targeted evasions for specific detection tests

> ⚠️ **Note**: Obfuscation is not encryption. A determined attacker can still reverse-engineer the code. However, it raises the bar significantly and deters casual tampering.

---

## Installation

### Step 1: Install the Package

```bash
npm install fpscanner
```

This installs the package with a **default placeholder key** (`my-shared-secret`). This is fine for development and testing, but you **must** build with your own key before deploying to production.

### Step 2: Build with Your Encryption Key

Run the build CLI with your secret key:

```bash
npx fpscanner build --key=your-secret-key-here
```

This will:
1. Rebuild the library with your key baked in
2. Obfuscate the output to protect the key
3. Overwrite the files in `node_modules/fpscanner/dist/`

After this, you can import normally (encrypted payload mode):

```javascript
import FingerprintScanner from 'fpscanner';

const scanner = new FingerprintScanner();
// Default: returns an encrypted base64 string (encrypted with YOUR key)
const encryptedPayload = await scanner.collectFingerprint(true);
```

### Optional: Disable Library Encryption

If you prefer to handle payload protection yourself (encrypt/sign/encode on your side), you can disable the library encryption and get the raw fingerprint object:

```javascript
import FingerprintScanner from 'fpscanner';

const scanner = new FingerprintScanner();
const fingerprint = await scanner.collectFingerprint(false); // returns Fingerprint (raw)
```

If you disable library encryption:
- You should **encrypt/sign/encode the payload yourself** before sending it to your backend (in addition to using TLS)
- You may not need the build-time key injection flow, since the built-in key is not used when `encryptFingerprint=false`

---

## Providing Your Encryption Key

The CLI supports multiple methods to provide your key, in order of priority:

### Method 1: Command Line Argument (Highest Priority)

```bash
npx fpscanner build --key=your-secret-key
```

Best for: One-off builds, CI/CD pipelines with inline secrets.

### Method 2: Environment Variable

```bash
export FINGERPRINT_KEY=your-secret-key
npx fpscanner build
```

Or inline:

```bash
FINGERPRINT_KEY=your-secret-key npx fpscanner build
```

Best for: CI/CD pipelines (GitHub Actions, GitLab CI, etc.) where secrets are injected as environment variables.

### Method 3: `.env` File

Create a `.env` file in your project root:

```
FINGERPRINT_KEY=your-secret-key
```

Then run:

```bash
npx fpscanner build
```

The CLI automatically loads `.env` if no key is provided via argument or environment.

Best for: Local development.

### Method 4: Custom Env File

```bash
npx fpscanner build --env-file=.env.production
```

Best for: Different keys per environment (staging, production, etc.).

---

## Automatic Builds on Install

To ensure the build runs automatically whenever dependencies are installed (including in CI/CD), add a `postinstall` script to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "fpscanner build"
  }
}
```

### With Environment Variable (CI/CD)

In your CI/CD pipeline, set `FINGERPRINT_KEY` as a secret environment variable. The `postinstall` script will pick it up automatically.

**GitHub Actions example:**

```yaml
env:
  FINGERPRINT_KEY: ${{ secrets.FINGERPRINT_KEY }}

steps:
  - run: npm install  # postinstall runs fpscanner build automatically
```

### With `.env` File (Local Development)

Create `.env` with your key (add to `.gitignore`!):

```
FINGERPRINT_KEY=your-dev-key
```

Then `npm install` will automatically build with that key.

---

## Build Options

### Obfuscation Control

Obfuscation is **enabled by default**. You can disable it using either:

1. **CLI flag**: `--no-obfuscate`
2. **Environment variable**: `FINGERPRINT_OBFUSCATE=false`

The environment variable is particularly useful for `postinstall` scripts where you can't pass CLI flags.

#### When to Use Obfuscation

| Scenario | Obfuscation | Reason |
|----------|-------------|--------|
| Production (default) | ✅ Yes | Defense-in-depth against fingerprint forgery |
| Development | ❌ No | Faster builds, easier debugging |
| CI/CD with tight time constraints | ❌ Optional | Trade-off between speed and security |
| High-security applications | ✅ Yes | Make reverse-engineering harder |

#### Skip Obfuscation via CLI

```bash
npx fpscanner build --key=my-key --no-obfuscate
```

#### Skip Obfuscation via Environment Variable

```bash
# Inline
FINGERPRINT_OBFUSCATE=false npx fpscanner build

# Or export
export FINGERPRINT_OBFUSCATE=false
npx fpscanner build
```

#### In `.env` File

You can also set it in your `.env` file:

```
FINGERPRINT_KEY=your-secret-key
FINGERPRINT_OBFUSCATE=false
```

> **Note**: Accepted values for disabling obfuscation: `false`, `0`, `no` (case-insensitive)

#### Postinstall with Obfuscation Control

Control obfuscation during `npm install` via environment variables:

```bash
# With obfuscation (default)
FINGERPRINT_KEY=my-key npm install

# Without obfuscation
FINGERPRINT_KEY=my-key FINGERPRINT_OBFUSCATE=false npm install
```

**CI/CD example (GitHub Actions):**

```yaml
env:
  FINGERPRINT_KEY: ${{ secrets.FINGERPRINT_KEY }}
  FINGERPRINT_OBFUSCATE: "false"  # Optional: skip obfuscation

steps:
  - run: npm install
```

### Security Considerations

> ⚠️ **Without obfuscation, the encryption key is visible in the source code.** This means:
> - Anyone can read your key from `dist/fpScanner.es.js`
> - Attackers can craft fake fingerprint payloads
> 
> If you skip obfuscation, ensure your security relies primarily on **server-side validation** rather than client-side protection.

### Full CLI Help

```bash
npx fpscanner --help
```

Output:

```
📦 fpscanner CLI

Commands:
  build     Build fpscanner with your custom encryption key

Usage:
  npx fpscanner build [options]

Options:
  --key=KEY           Use KEY as the encryption key (highest priority)
  --env-file=FILE     Load FINGERPRINT_KEY from FILE (default: .env)
  --no-obfuscate      Skip obfuscation step (faster builds for development)

Key Resolution (in order of priority):
  1. --key=xxx argument
  2. FINGERPRINT_KEY environment variable
  3. FINGERPRINT_KEY in .env file (or custom file via --env-file)
```

---

## Local Development Scripts
TODO: maybe move to another page

The package includes several npm scripts for different development scenarios:

| Script | Key | Obfuscation | Use Case |
|--------|-----|-------------|----------|
| `npm run build` | Default | ❌ No | Quick build for development |
| `npm run build:dev` | `dev-key` | ❌ No | Fast iteration, custom dev key |
| `npm run build:obfuscate` | `dev-key` | ✅ Yes | Test obfuscation locally |
| `npm run build:prod` | From `.env` or env var | ✅ Yes | Production (recommended) |
| `npm run build:prod:plain` | From `.env` or env var | ❌ No | Production without obfuscation |

### Development Workflow

#### 1. Quick Development (No Obfuscation)

For fast iteration during development:

```bash
npm run build:dev    # Build with dev-key, no obfuscation
npm run dev          # Build + start dev server at localhost:3000
```

The `dev` script opens `test.html` automatically where you can see the fingerprint output in the browser console.

#### 2. Test with Obfuscation

Before deploying, test that obfuscation doesn't break anything:

```bash
npm run build:obfuscate   # Build with dev-key + obfuscation
npm run dev:obfuscate     # Build with obfuscation + start dev server
```

#### 3. Production-like Build

Test the full production flow locally:

```bash
# Create .env with your test key
echo "FINGERPRINT_KEY=my-prod-test-key" > .env

# Build like production (reads from .env, obfuscates)
npm run build:prod

# Or with explicit key
FINGERPRINT_KEY=my-prod-test-key npm run build:prod
```

#### 4. Watch Mode

For continuous rebuilding during development:

```bash
npm run watch   # Rebuilds on file changes (uses default key, no obfuscation)
```

> **Note**: Watch mode uses the default key (`my-shared-secret`) and no obfuscation. It's meant for rapid development, not testing the build pipeline.

### How to Know Which Build You're Running?

Check the built file for the key (only works without obfuscation):

```bash
# If you can find the key, it's not obfuscated
grep -o "dev-key\|my-shared-secret" dist/fpScanner.es.js
```

If obfuscated, the key won't be visible in plain text. You can also check the file size — obfuscated builds are larger due to dead code injection and control flow flattening.

### Script Summary

```bash
# Development
npm run build          # Quick build (default key, no obfuscation)
npm run build:dev      # Build with dev-key, no obfuscation
npm run dev            # Build + serve test.html at localhost:3000
npm run watch          # Rebuild on changes

# Testing obfuscation
npm run build:obfuscate  # Build with dev-key + obfuscation
npm run dev:obfuscate    # Build obfuscated + serve

# Production
npm run build:prod        # Build with key from .env/env var + obfuscation
npm run build:prod:plain  # Build with key from .env/env var, NO obfuscation
```

---

## Server-Side Decryption

On your server, decrypt the fingerprint using the same key:

```javascript
// Your backend (Node.js example)
const { decryptString } = require('./crypto-helpers'); // Same algorithm as client

async function verifyFingerprint(encryptedPayload) {
  const key = process.env.FINGERPRINT_KEY; // Same key used in build
  const decrypted = await decryptString(encryptedPayload, key);
  const fingerprint = JSON.parse(decrypted);
  
  // Verify timestamp to prevent replay attacks
  const age = Date.now() - fingerprint.time;
  if (age > 60000) { // 60 seconds
    throw new Error('Fingerprint expired');
  }
  
  // Check bot detection flags
  if (fingerprint.fastBotDetection) {
    console.log('Bot detected:', fingerprint.fastBotDetectionDetails);
  }
  
  return fingerprint;
}
```

---

## Security Best Practices

1. **Use a strong, random key** — At least 32 characters, randomly generated.

2. **Never commit your key** — Add `.env` to `.gitignore`. Use CI/CD secrets for production.

3. **Rotate keys periodically** — If you suspect a key has been compromised, generate a new one and redeploy.

4. **Always obfuscate in production** — Never use `--no-obfuscate` for production builds.

5. **Validate on the server** — Don't trust the client. Always decrypt and validate fingerprints server-side.

6. **Check timestamps** — Reject fingerprints older than a reasonable threshold (e.g., 60 seconds).

7. **Monitor for anomalies** — Track fingerprint patterns. A sudden spike in identical `fsid` values from different IPs may indicate replay attacks.

---

## Troubleshooting

### "No encryption key found!"

Make sure you're providing a key via one of the supported methods:

```bash
# Option 1: CLI argument
npx fpscanner build --key=your-key

# Option 2: Environment variable
export FINGERPRINT_KEY=your-key
npx fpscanner build

# Option 3: .env file
echo "FINGERPRINT_KEY=your-key" >> .env
npx fpscanner build
```

### Build works but key is still `my-shared-secret`

The build writes to `node_modules/fpscanner/dist/`. If you're importing from elsewhere, make sure you're using the rebuilt files.

### Obfuscation is slow

The obfuscation step can take a few seconds. For development, use `--no-obfuscate`:

```bash
npx fpscanner build --key=dev-key --no-obfuscate
```

### `postinstall` fails in CI

Make sure `FINGERPRINT_KEY` is set as an environment variable in your CI/CD pipeline before `npm install` runs.
