# Fingerprint Scanner

A browser fingerprinting library for bot detection.

## Fingerprint Scanner ID (fsid) Format

The `fsid` is a JA4-inspired, locality-preserving fingerprint identifier. Unlike a simple hash, it's structured into semantic sections delimited by `_`, making it both human-readable and machine-parseable.

### Format

```
FS1_<bot>_<env>_<hw>_<gl>_<gpu>_<scr>_<loc>_<ifr>_<wrk>
```

### Example

```
FS1_00000_a7f3b2_c08m16_e4a1c9_b82f0d_1920x1080hf3a2_en2hc8b1_0ha3f2e1_0hb7c4d2
```

### Section Breakdown

| # | Section | Format | Example | Description |
|---|---------|--------|---------|-------------|
| 1 | **Version** | `FS1` | `FS1` | Fingerprint Scanner version 1 |
| 2 | **Bot** | `<count><w><c><p>` | `05110` | Detection count (2 digits) + flags: webdriver, cdp, playwright |
| 3 | **Environment** | 6-char hash | `a7f3b2` | Hash of: userAgent, platform, chrome, brave, etsl |
| 4 | **Hardware** | `c<cpu>m<mem>` | `c08m16` | CPU count + memory in GB (human-readable) |
| 5 | **WebGL** | 6-char hash | `e4a1c9` | Hash of: WebGL vendor + renderer |
| 6 | **WebGPU** | 6-char hash | `b82f0d` | Hash of: WebGPU vendor, architecture, device, description |
| 7 | **Screen** | `<w>x<h>h<hash>` | `1920x1080hf3a2` | Width × Height + 4-char hash of other screen attributes |
| 8 | **Locale** | `<lang><n>h<hash>` | `en2hc8b1` | Primary language (2 chars) + language count + 4-char hash |
| 9 | **Iframe** | `<m>h<hash>` | `0ha3f2e1` | Mismatch flag (0/1) + 6-char hash of iframe signals |
| 10 | **Worker** | `<m>h<hash>` | `0hb7c4d2` | Mismatch flag (0/1) + 6-char hash of web worker signals |

### Detailed Section Descriptions

#### Bot Section (`<count><w><c><p>`)

- **count**: 2-digit count of triggered detection tests (00-12)
- **w**: `1` if `navigator.webdriver` is true, `0` otherwise
- **c**: `1` if CDP (Chrome DevTools Protocol) detected, `0` otherwise
- **p**: `1` if Playwright detected, `0` otherwise

Examples:
- `00000` — No detections, clean browser
- `07110` — 7 detections triggered, webdriver=true, cdp=true, playwright=false
- `12111` — All 12 detections triggered, all bot signals true

#### Hardware Section (`c<cpu>m<mem>`)

Human-readable hardware specs:
- `c08m16` — 8 CPU cores, 16 GB memory
- `c02m04` — 128 CPU cores, 4 GB memory (suspiciously high number of CPU cores, could be a bot running from a server)

#### Screen Section (`<w>x<h>h<hash>`)

- Width and height are human-readable
- The 4-char hash includes: pixelDepth, colorDepth, availableWidth, availableHeight, innerWidth, innerHeight, hasMultipleDisplays

Examples:
- `1920x1080hf3a2` — Full HD display
- `800x600ha1b2` —  Headless Chrome resolution

#### Locale Section (`<lang><n>h<hash>`)

- Primary language code (2 chars, lowercase)
- Number of languages configured
- Hash of: timezone, localeLanguage, all languages

Examples:
- `en3hc8b1` — English primary, 3 languages configured
- `fr1h0000` — French only, single language

#### Iframe/Worker Sections (`<m>h<hash>`)

- **m**: Mismatch flag — `1` if signals from iframe/worker differ from main context (indicates potential spoofing)
- **hash**: 6-char hash of all signals collected from that context

Examples:
- `0ha3f2e1` — No mismatch, consistent fingerprint
- `1hffffff` — Mismatch detected! Iframe/worker signals differ from main context

### Why This Format?

Inspired by [JA4+](https://github.com/FoxIO-LLC/ja4), this format enables:

1. **Partial Matching**: Compare specific sections across fingerprints
   - Same GPU but different screen? Compare sections 5-6 vs 7
   - Find all bots with same environment hash

2. **Human Readability**: Key values visible at a glance
   - `c08m16` immediately tells you 8 cores, 16GB RAM
   - `1920x1080` shows screen resolution
   - `07110` shows 7 detections and which bot signals fired

3. **Similarity Detection**: Two different fsid values may share sections
   - Same device with different browser window sizes will match on hardware/GPU sections
   - Bots from the same framework will often share environment hashes

### Signals Included

All 41 fingerprint signals are captured in the fsid:

| Section | Signals |
|---------|---------|
| Bot | webdriver, cdp, playwright + all 12 detection test results |
| Environment | userAgent, platform, chrome, brave, etsl |
| Hardware | cpuCount, memory |
| WebGL | webGL.vendor, webGL.renderer |
| WebGPU | webgpu.vendor, webgpu.architecture, webgpu.device, webgpu.description |
| Screen | width, height, pixelDepth, colorDepth, availableWidth, availableHeight, innerWidth, innerHeight, hasMultipleDisplays |
| Locale | timezone, localeLanguage, languages[], language |
| Iframe | iframe.webdriver, iframe.userAgent, iframe.platform, iframe.memory, iframe.cpuCount, iframe.language |
| Worker | webworker.webdriver, webworker.userAgent, webworker.platform, webworker.memory, webworker.cpuCount, webworker.language, webworker.vendor, webworker.renderer |

---

## Server-Side Decryption

The fingerprint payload returned by `collectFingerprint()` is encrypted on the client side. To read it on your server, you need to decrypt it using the **same key** that was used when building the library.

### Why Encryption?

The fingerprint is encrypted for several security reasons:

1. **Prevent Payload Forgery**: Without encryption, an attacker could inspect your frontend code, understand the fingerprint structure, and craft fake "clean" fingerprints to bypass bot detection — without ever running the actual detection code.

2. **Prevent Replay Attacks**: Combined with the `nonce` and `time` fields, encryption allows your server to verify that fingerprints are fresh and haven't been reused.

3. **Key Binding**: The encryption key is **injected at build time** and embedded in the obfuscated client code. This means:
   - Each customer has their own unique key
   - The key is not visible in plain text (obfuscated + minified)
   - Only your server (which knows the key) can decrypt the payload

> ⚠️ **Important**: You must use the **exact same key** on your server that you used when running `npx fpscanner build --key=YOUR_KEY`. If the keys don't match, decryption will fail or produce garbage.

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
