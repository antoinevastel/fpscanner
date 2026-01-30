# Fingerprint Scanner

A browser fingerprinting library for bot detection.

## Fingerprint Scanner ID (fsid) Format

The `fsid` is a JA4-inspired, locality-preserving fingerprint identifier. Unlike a simple hash, it's structured into semantic sections delimited by `_`, making it both human-readable and machine-parseable.

### Format

```
FS1_<det>_<auto>_<dev>_<brw>_<gfx>_<cod>_<loc>_<ctx>
```

### Example

```
FS1_00000100000000_10010h3f2a_1728x1117c14m08b01011h4e7a9f_f1101011001e00000000p1100h2c8b1e_0h9d3f7a_1h6a2e4c_en4h1b2c_0000h3e9f
```

### Section Breakdown

| # | Section | Format | Example | Description |
|---|---------|--------|---------|-------------|
| 1 | **Version** | `FS1` | `FS1` | Fingerprint Scanner version 2 |
| 2 | **Detection** | 14-bit bitmask | `00000100000000` | All fastBotDetectionDetails booleans |
| 3 | **Automation** | `<5-bit>h<hash>` | `10010h3f2a` | Automation booleans + hash |
| 4 | **Device** | `<W>x<H>c<cpu>m<mem>b<5-bit>h<hash>` | `1728x1117c14m08b01011h4e7a9f` | Screen, cpu, memory, device booleans + hash |
| 5 | **Browser** | `f<10-bit>e<8-bit>p<4-bit>h<hash>` | `f1101011001e00000000p1100h2c8b1e` | Features + extensions + plugins bitmasks + hash |
| 6 | **Graphics** | `<1-bit>h<hash>` | `0h9d3f7a` | hasModifiedCanvas + hash |
| 7 | **Codecs** | `<1-bit>h<hash>` | `1h6a2e4c` | hasMediaSource + hash |
| 8 | **Locale** | `<lang><n>h<hash>` | `en4h1b2c` | Language code + count + hash |
| 9 | **Contexts** | `<4-bit>h<hash>` | `0000h3e9f` | Mismatch + webdriver flags + hash |

### Bitmask Design (Extensibility)

Each section uses the pattern `<bitmask>h<hash>` where applicable. **Bitmasks are extensible** — adding a new boolean field appends a bit without breaking existing positions.

#### Detection Bitmask (14 bits)

Position-to-field mapping (in order):
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
```

Examples:
- `00000000000000` — No detections, clean browser
- `01001100000000` — hasWebdriver + hasCDP + hasPlaywright detected

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

#### Browser Section Bitmasks

The browser section uses three bitmasks:

**Features bitmask (`f` prefix, 10 bits)** — from `browser.features.bitmask`:
```
Bit 0: chrome
Bit 1: brave
Bit 2: applePaySupport
Bit 3: opera
Bit 4: serial
Bit 5: attachShadow
Bit 6: caches
Bit 7: webAssembly
Bit 8: buffer
Bit 9: showModalDialog
```

**Extensions bitmask (`e` prefix, 8 bits)** — from `browser.extensions.bitmask`:
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

**Plugins bitmask (`p` prefix, 4 bits)**:
```
Bit 0: isValidPluginArray
Bit 1: pluginConsistency1
Bit 2: pluginOverflow
Bit 3: hasToSource
```

#### Contexts Bitmask (4 bits)

```
Bit 0: iframe mismatch (signals differ from main context)
Bit 1: worker mismatch (signals differ from main context)
Bit 2: iframe.webdriver
Bit 3: webWorker.webdriver
```

### Why This Format?

Inspired by [JA4+](https://github.com/FoxIO-LLC/ja4), this format enables:

1. **Extensibility**: Adding a new boolean check just appends a bit — existing bit positions remain stable
   - Add a new browser feature? The first 10 bits stay the same
   - Add a new extension detection? Previous extensions keep their positions

2. **Partial Matching**: Compare specific sections across fingerprints
   - Same GPU but different screen? Compare `gfx` vs `dev` sections
   - Find all bots with same automation signals

3. **Human Readability**: Key values visible at a glance
   - `1728x1117c14m08` — Screen 1728×1117, 14 cores, 8GB RAM
   - `f1101011001` — Browser features: chrome=true, brave=true, applePaySupport=false, opera=true, etc.
   - First 14 bits show exactly which bot detections triggered

4. **Similarity Detection**: Two different fsid values may share sections
   - Same device with different browser window sizes will match on `gfx` and `cod` sections
   - Bots from the same framework will often share automation/browser hashes

### Signals Included

All fingerprint signals are captured in the fsid:

| Section | Signals |
|---------|---------|
| Detection | All 14 fastBotDetectionDetails booleans |
| Automation | webdriver, webdriverWritable, selenium, cdp, playwright, navigatorPropertyDescriptors |
| Device | cpuCount, memory, platform, screenResolution.*, multimediaDevices.*, mediaQueries.* |
| Browser | userAgent, etsl, maths, features.*, extensions.*, plugins.*, highEntropyValues.*, toSourceError.* |
| Graphics | webGL.*, webgpu.*, canvas.* |
| Codecs | audioCanPlayTypeHash, videoCanPlayTypeHash, audioMediaSourceHash, videoMediaSourceHash, rtcAudioCapabilitiesHash, rtcVideoCapabilitiesHash, hasMediaSource |
| Locale | internationalization.*, languages.* |
| Contexts | iframe.*, webWorker.* |

---

## Server-Side Decryption

`collectFingerprint()` supports **two modes**:

- **Encrypted payload (default)**: returns an encrypted Base64 string (recommended if you rely on client-side tamper resistance)
- **Raw payload**: returns the plain `Fingerprint` object (recommended if you want to encrypt/sign/encode the payload yourself)

### Client API

```javascript
import FingerprintScanner from 'fpscanner';

const scanner = new FingerprintScanner();

// 1) Default: returns an encrypted base64 string
const encryptedPayload = await scanner.collectFingerprint();

// 2) With options: explicitly enable/disable encryption
const encryptedPayload = await scanner.collectFingerprint({ encrypt: true });

// 3) Raw: returns the Fingerprint object (no library encryption)
const fingerprint = await scanner.collectFingerprint({ encrypt: false });
```

### If you use encryption (`encrypt: true`, default)

The payload returned by `collectFingerprint()` or `collectFingerprint({ encrypt: true })` is encrypted on the client side. To read it on your server, decrypt it using the **same key** that was used when building the library.

> ⚠️ **Important**: You must use the **exact same key** on your server that you used when running `npx fpscanner build --key=YOUR_KEY`. If the keys don't match, decryption will fail or produce garbage. See `CONFIGURATION.md` for the build-time key injection workflow.

### If you disable encryption (`encrypt: false`)

If you call `collectFingerprint({ encrypt: false })`, the library returns the raw `Fingerprint` object. In that case:

- You should **encrypt/sign/encode the payload yourself** before sending it to your backend (in addition to using TLS)
- You can choose a stronger scheme (e.g. authenticated encryption, request signing, etc.) appropriate for your threat model

### Why Encryption?

The fingerprint is encrypted for several security reasons:

1. **Prevent Payload Forgery**: Without encryption, an attacker could inspect your frontend code, understand the fingerprint structure, and craft fake "clean" fingerprints to bypass bot detection — without ever running the actual detection code.

2. **Prevent Replay Attacks**: Combined with the `nonce` and `time` fields, encryption allows your server to verify that fingerprints are fresh and haven't been reused.

3. **Key Binding**: The encryption key is **injected at build time** and embedded in the obfuscated client code. This means:
   - Each customer has their own unique key
   - The key is not visible in plain text (obfuscated + minified)
   - Only your server (which knows the key) can decrypt the payload

### Decryption Algorithm

The library uses a simple XOR cipher with Base64 encoding. Here's the decryption function you can use on your server:

```javascript
/**
 * Decrypts a fingerprint payload that was encrypted by fpscanner
 * @param {string} ciphertext - The encrypted string (base64 encoded)
 * @param {string} key - The decryption key (must match the build key)
 * @returns {Promise<string>} Decrypted JSON string
 */
async function decryptString(ciphertext, key) {
    // Decode from base64
    const binaryString = atob(ciphertext);
    const encrypted = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        encrypted[i] = binaryString.charCodeAt(i);
    }

    // Convert key to bytes
    const keyBytes = new TextEncoder().encode(key);
    const decrypted = new Uint8Array(encrypted.length);

    // XOR decryption (symmetric with encryption)
    for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
    }

    return new TextDecoder().decode(decrypted);
}
```

### Node.js Example

For Node.js servers, use `Buffer` instead of `atob`:

```javascript
async function decryptString(ciphertext, key) {
    // Decode from base64 (Node.js)
    const encrypted = Buffer.from(ciphertext, 'base64');
    const keyBytes = Buffer.from(key, 'utf8');
    const decrypted = Buffer.alloc(encrypted.length);

    // XOR decryption
    for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
    }

    return decrypted.toString('utf8');
}

// Usage example
async function handleFingerprintRequest(encryptedPayload) {
    // Use the SAME key you used when building fpscanner
    const key = process.env.FINGERPRINT_KEY;
    
    try {
        const decrypted = await decryptString(encryptedPayload, key);
        let fingerprint = JSON.parse(decrypted);
        // Handle double-JSON-encoding (string containing JSON)
        if (typeof fingerprint === 'string') {
            fingerprint = JSON.parse(fingerprint);
        }
        
        // Validate timestamp to prevent replay attacks
        const ageMs = Date.now() - fingerprint.time;
        if (ageMs > 60000) { // 60 seconds
            throw new Error('Fingerprint expired');
        }
        
        // Check bot detection
        if (fingerprint.fastBotDetection) {
            console.log('🤖 Bot detected!', fingerprint.fastBotDetectionDetails);
            // Handle bot...
        }
        
        // Use the fingerprint data
        console.log('Fingerprint ID:', fingerprint.fsid);
        console.log('Signals:', fingerprint.signals);
        
        return fingerprint;
    } catch (error) {
        console.error('Failed to decrypt fingerprint:', error);
        throw error;
    }
}
```

### Python Example

The decryption algorithm is simple enough to implement in any language. Here's a Python version:

```python
import base64
import json
import os
import time

def decrypt_string(ciphertext: str, key: str) -> str:
    """Decrypt a fingerprint payload encrypted by fpscanner."""
    # Decode from base64
    encrypted = base64.b64decode(ciphertext)
    key_bytes = key.encode('utf-8')
    
    # XOR decryption
    decrypted = bytearray(len(encrypted))
    for i in range(len(encrypted)):
        decrypted[i] = encrypted[i] ^ key_bytes[i % len(key_bytes)]
    
    return decrypted.decode('utf-8')


def handle_fingerprint_request(encrypted_payload: str) -> dict:
    """Process an encrypted fingerprint from the client."""
    # Use the SAME key you used when building fpscanner
    key = os.environ.get('FINGERPRINT_KEY')
    
    decrypted = decrypt_string(encrypted_payload, key)
    fingerprint = json.loads(decrypted)
    # Handle double-JSON-encoding (string containing JSON)
    if isinstance(fingerprint, str):
        fingerprint = json.loads(fingerprint)
    
    # Validate timestamp to prevent replay attacks
    age_ms = (time.time() * 1000) - fingerprint['time']
    if age_ms > 60000:  # 60 seconds
        raise ValueError('Fingerprint expired')
    
    # Check bot detection
    if fingerprint['fastBotDetection']:
        print('🤖 Bot detected!', fingerprint['fastBotDetectionDetails'])
    
    return fingerprint
```

### Other Languages

The XOR decryption algorithm is straightforward to port to any language:

1. **Base64 decode** the ciphertext to get raw bytes
2. **XOR each byte** with the corresponding key byte (cycling through the key)
3. **Decode** the result as UTF-8 to get the JSON string
4. **Parse** the JSON to get the fingerprint object

This works in Go, Ruby, PHP, Java, C#, Rust, or any language with base64 and XOR support.

### Key Management

| Environment | How to Store the Key |
|-------------|----------------------|
| Development | `.env` file (git-ignored) |
| CI/CD | Secret environment variable |
| Production | Secret manager (AWS Secrets Manager, Vault, etc.) |

The key must be:
- **Identical** on client build and server
- **Secret** — never commit to version control
- **Strong** — at least 32 random characters recommended

### Security Considerations

1. **This is obfuscation, not strong encryption**: XOR cipher is fast but not cryptographically secure. A determined attacker with access to the obfuscated code could eventually extract the key. The goal is to raise the bar, not create an impenetrable system.

2. **Defense in depth**: Combine fingerprinting with other signals (rate limiting, behavioral analysis, CAPTCHAs) for robust bot detection.

3. **Key rotation**: If you suspect your key has been compromised, generate a new one, rebuild the client, and redeploy.

4. **Timestamp validation**: Always check the `time` field to reject stale fingerprints and prevent replay attacks.
