/**
 * FPScanner Demo Server (Node.js)
 * 
 * This server demonstrates how to receive and decrypt fingerprints
 * collected by fpscanner on the client side.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// The encryption key - must match the key used when building fpscanner
// In production, this should come from environment variables
const ENCRYPTION_KEY = process.env.FINGERPRINT_KEY || 'dev-key';

/**
 * Decrypt an XOR-encrypted, base64-encoded string
 */
function decryptString(ciphertext, key) {
    const binaryString = Buffer.from(ciphertext, 'base64').toString('binary');
    const encrypted = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        encrypted[i] = binaryString.charCodeAt(i);
    }

    const keyBytes = Buffer.from(key, 'utf8');
    const decrypted = new Uint8Array(encrypted.length);

    for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
    }

    return Buffer.from(decrypted).toString('utf8');
}

/**
 * Decrypt and parse a fingerprint payload
 */
function decryptFingerprint(encryptedFingerprint) {
    const decryptedJson = decryptString(encryptedFingerprint, ENCRYPTION_KEY);
    let parsed = JSON.parse(decryptedJson);
    // Handle double-JSON-encoding (string containing JSON)
    if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
    }
    return parsed;
}

// MIME types for serving static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
};

const server = http.createServer(async (req, res) => {
    // Handle fingerprint submission
    if (req.method === 'POST' && req.url === '/api/fingerprint') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { fingerprint: encryptedFingerprint } = JSON.parse(body);
                
                // Decrypt the fingerprint
                const fingerprint = decryptFingerprint(encryptedFingerprint);
                
                // Log the decrypted fingerprint
                console.log('\n' + '='.repeat(60));
                console.log('📥 Received fingerprint from client');
                console.log('='.repeat(60));
                console.log('\n🔓 Decrypted fingerprint:');
                console.log(JSON.stringify(fingerprint, null, 2));
                console.log('\n📊 Summary:');
                console.log(`   FSID: ${fingerprint.fsid}`);
                console.log(`   Platform: ${fingerprint.signals.device.platform}`);
                console.log(`   User Agent: ${fingerprint.signals.browser.userAgent.substring(0, 50)}...`);
                console.log(`   CPU Count: ${fingerprint.signals.device.cpuCount}`);
                console.log(`   Memory: ${fingerprint.signals.device.memory} GB`);
                console.log(`   Screen: ${fingerprint.signals.device.screenResolution.width}x${fingerprint.signals.device.screenResolution.height}`);
                console.log(`   Bot Detection: ${fingerprint.fastBotDetection ? '⚠️  SUSPICIOUS' : '✓ OK'}`);
                console.log('='.repeat(60) + '\n');
                
                // Send response with full fingerprint
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    fingerprint: fingerprint
                }));
            } catch (error) {
                console.error('❌ Error processing fingerprint:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }
    
    // Serve static files
    let filePath;
    if (req.url === '/' || req.url === '/index.html') {
        filePath = path.join(__dirname, 'index.html');
    } else {
        // Serve files from the fpscanner root (for dist folder access)
        filePath = path.join(__dirname, '../..', req.url);
    }
    
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end(`Not found: ${req.url}`);
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║          FPScanner Demo Server (Node.js)               ║
╠════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}              ║
║  Open this URL in your browser to test                 ║
╚════════════════════════════════════════════════════════╝
`);
});
