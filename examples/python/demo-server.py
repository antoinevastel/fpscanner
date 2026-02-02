#!/usr/bin/env python3
"""
FPScanner Demo Server (Python)

This server demonstrates how to receive and decrypt fingerprints
collected by fpscanner on the client side.
"""

import base64
import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

PORT = 3010

# The encryption key - must match the key used when building fpscanner
# In production, this should come from environment variables
ENCRYPTION_KEY = os.environ.get('FINGERPRINT_KEY', 'dev-key')


def xor_decrypt(ciphertext_b64: str, key: str) -> str:
    """
    Decrypt an XOR-encrypted, base64-encoded string.
    
    Args:
        ciphertext_b64: Base64-encoded encrypted data
        key: The encryption key (must match the key used for encryption)
    
    Returns:
        Decrypted string
    """
    # Decode from base64
    encrypted = base64.b64decode(ciphertext_b64)
    key_bytes = key.encode('utf-8')
    
    # XOR decrypt
    decrypted = bytearray(len(encrypted))
    for i in range(len(encrypted)):
        decrypted[i] = encrypted[i] ^ key_bytes[i % len(key_bytes)]
    
    return decrypted.decode('utf-8')


def decrypt_fingerprint(encrypted_fingerprint: str) -> dict:
    """
    Decrypt and parse a fingerprint payload.
    
    Args:
        encrypted_fingerprint: The encrypted fingerprint from the client
    
    Returns:
        Parsed fingerprint dictionary
    """
    decrypted_json = xor_decrypt(encrypted_fingerprint, ENCRYPTION_KEY)
    parsed = json.loads(decrypted_json)
    # Handle double-JSON-encoding (string containing JSON)
    if isinstance(parsed, str):
        parsed = json.loads(parsed)
    return parsed


class FingerprintHandler(SimpleHTTPRequestHandler):
    """HTTP request handler for the fingerprint demo."""
    
    def __init__(self, *args, **kwargs):
        # Set the directory to serve static files from
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)
    
    def do_POST(self):
        """Handle POST requests (fingerprint submission)."""
        if self.path == '/api/fingerprint':
            try:
                # Read the request body
                content_length = int(self.headers['Content-Length'])
                body = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(body)
                
                encrypted_fingerprint = data.get('fingerprint')
                if not encrypted_fingerprint:
                    raise ValueError('No fingerprint provided')
                
                # Decrypt the fingerprint
                fingerprint = decrypt_fingerprint(encrypted_fingerprint)
                
                # Log the decrypted fingerprint
                print('\n' + '=' * 60)
                print('📥 Received fingerprint from client')
                print('=' * 60)
                print('\n🔓 Decrypted fingerprint:')
                print(json.dumps(fingerprint, indent=2))
                print('\n📊 Summary:')
                print(f"   FSID: {fingerprint['fsid']}")
                print(f"   Platform: {fingerprint['signals']['device']['platform']}")
                print(f"   User Agent: {fingerprint['signals']['browser']['userAgent'][:50]}...")
                print(f"   CPU Count: {fingerprint['signals']['device']['cpuCount']}")
                print(f"   Memory: {fingerprint['signals']['device']['memory']} GB")
                screen = fingerprint['signals']['device']['screenResolution']
                print(f"   Screen: {screen['width']}x{screen['height']}")
                bot_status = '⚠️  SUSPICIOUS' if fingerprint['fastBotDetection'] else '✓ OK'
                print(f'   Bot Detection: {bot_status}')
                print('=' * 60 + '\n')
                
                # Send response with full fingerprint
                response = {
                    'success': True,
                    'fingerprint': fingerprint
                }
                self._send_json(200, response)
                
            except Exception as e:
                print(f'❌ Error processing fingerprint: {e}')
                self._send_json(400, {'success': False, 'error': str(e)})
        else:
            self.send_error(404, 'Not Found')
    
    def do_GET(self):
        """Handle GET requests (serve static files)."""
        parsed = urlparse(self.path)
        path = parsed.path
        
        # Serve index.html for root
        if path == '/' or path == '/index.html':
            self.path = '/index.html'
            return super().do_GET()
        
        # Serve files from fpscanner root (for dist folder access)
        if path.startswith('/dist/'):
            # Construct path relative to fpscanner root
            file_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                '../..',
                path.lstrip('/')
            )
            if os.path.exists(file_path):
                self.send_response(200)
                if path.endswith('.js'):
                    self.send_header('Content-Type', 'application/javascript')
                else:
                    self.send_header('Content-Type', 'application/octet-stream')
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
        
        return super().do_GET()
    
    def _send_json(self, status: int, data: dict):
        """Send a JSON response."""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Suppress default logging for cleaner output."""
        if 'POST /api/fingerprint' not in format % args:
            # Only log non-fingerprint requests
            pass


def main():
    server = HTTPServer(('', PORT), FingerprintHandler)
    print(f'''
╔════════════════════════════════════════════════════════╗
║          FPScanner Demo Server (Python)                ║
╠════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:{PORT}              ║
║  Open this URL in your browser to test                 ║
╚════════════════════════════════════════════════════════╝
''')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')


if __name__ == '__main__':
    main()
