# FPScanner Python Demo

This example demonstrates how to use fpscanner with a Python backend server.

## What it does

1. **Client side**: The HTML page loads the fpscanner library and collects an encrypted fingerprint
2. **Server side**: The Python server receives the encrypted fingerprint, decrypts it, and logs the result

## Prerequisites

- Python 3.6+ installed
- fpscanner built with the `dev-key` (or your custom key)

## Setup

1. First, build fpscanner with the dev key (from the fpscanner root directory):

```bash
npm run build:obfuscate
```

This builds the library with the `dev-key` encryption key.

2. Navigate to this example directory:

```bash
cd examples/python
```

3. Start the demo server:

```bash
python3 demo-server.py
```

4. Open your browser and navigate to:

```
http://localhost:3000
```

## Expected Output

When you open the page, you should see:

1. **In the browser**: A success message showing the fingerprint was received
2. **In the terminal**: The decrypted fingerprint with a summary like:

```
════════════════════════════════════════════════════════════
📥 Received fingerprint from client
════════════════════════════════════════════════════════════

🔓 Decrypted fingerprint:
{
  "signals": {
    "webdriver": false,
    "userAgent": "Mozilla/5.0 ...",
    ...
  },
  "fsid": "FS1_00000_abc123_...",
  ...
}

📊 Summary:
   FSID: FS1_00000_abc123_...
   Platform: MacIntel
   CPU Count: 8
   Memory: 16 GB
   Screen: 1920x1080
   Bot Detection: ✓ OK
════════════════════════════════════════════════════════════
```

## Using a Custom Encryption Key

To use your own encryption key:

1. Build fpscanner with your key:

```bash
FINGERPRINT_KEY=your-secret-key npm run build:prod
```

2. Set the same key when running the server:

```bash
FINGERPRINT_KEY=your-secret-key python3 demo-server.py
```

## Decryption Function

The key part of the Python server is the decryption function:

```python
import base64

def xor_decrypt(ciphertext_b64: str, key: str) -> str:
    """Decrypt an XOR-encrypted, base64-encoded string."""
    # Decode from base64
    encrypted = base64.b64decode(ciphertext_b64)
    key_bytes = key.encode('utf-8')
    
    # XOR decrypt
    decrypted = bytearray(len(encrypted))
    for i in range(len(encrypted)):
        decrypted[i] = encrypted[i] ^ key_bytes[i % len(key_bytes)]
    
    return decrypted.decode('utf-8')
```

This function can be easily integrated into any Python web framework (Flask, Django, FastAPI, etc.).

## Files

- `index.html` - Client-side page that collects and sends the fingerprint
- `demo-server.py` - Python server that decrypts and logs fingerprints
- `README.md` - This file
