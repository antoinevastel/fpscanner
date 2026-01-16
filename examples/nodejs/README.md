# FPScanner Node.js Demo

This example demonstrates how to use fpscanner with a Node.js backend server.

## What it does

1. **Client side**: The HTML page loads the fpscanner library and collects an encrypted fingerprint
2. **Server side**: The Node.js server receives the encrypted fingerprint, decrypts it, and logs the result

## Prerequisites

- Node.js installed
- fpscanner built with the `dev-key` (or your custom key)

## Setup

1. First, build fpscanner with the dev key (from the fpscanner root directory):

```bash
npm run build:obfuscate
```

This builds the library with the `dev-key` encryption key.

2. Navigate to this example directory:

```bash
cd examples/nodejs
```

3. Start the demo server:

```bash
node demo-server.js
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
FINGERPRINT_KEY=your-secret-key node demo-server.js
```

## Files

- `index.html` - Client-side page that collects and sends the fingerprint
- `demo-server.js` - Node.js server that decrypts and logs fingerprints
- `README.md` - This file
