#!/usr/bin/env python3
"""
Simple CORS proxy for CLSI
Run with: python3 clsi-proxy.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.parse
import urllib.error
import json

CLSI_URL = 'http://localhost:3013'
PROXY_PORT = 3014

class CORSProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()
    
    def do_POST(self):
        """Proxy POST requests to CLSI"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Forward request to CLSI
            url = f"{CLSI_URL}{self.path}"
            req = urllib.request.Request(url, data=body, method='POST')
            
            # Forward headers
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'connection']:
                    req.add_header(header, value)
            
            # Make request to CLSI
            with urllib.request.urlopen(req, timeout=120) as response:
                # Read response
                response_data = response.read()
                
                # Send CORS headers and response
                self.send_response(response.getcode())
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
                self.send_header('Content-Type', response.headers.get('Content-Type', 'application/json'))
                self.end_headers()
                self.wfile.write(response_data)
                
        except urllib.error.HTTPError as e:
            # Forward HTTP errors (4xx, 5xx) from CLSI
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
            self.send_header('Content-Type', e.headers.get('Content-Type', 'application/json'))
            self.end_headers()
            self.wfile.write(e.read())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = json.dumps({'error': str(e)}).encode()
            self.wfile.write(error_response)
            print(f"Error: {e}")
    
    def do_GET(self):
        """Proxy GET requests to CLSI"""
        try:
            url = f"{CLSI_URL}{self.path}"
            req = urllib.request.Request(url, method='GET')
            
            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = response.read()
                
                self.send_response(response.getcode())
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Content-Type', response.headers.get('Content-Type', 'text/plain'))
                self.end_headers()
                self.wfile.write(response_data)
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Content-Type', e.headers.get('Content-Type', 'text/plain'))
            self.end_headers()
            self.wfile.write(e.read())

        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = json.dumps({'error': str(e)}).encode()
            self.wfile.write(error_response)
            print(f"Error: {e}")
    
    def log_message(self, format, *args):
        """Override to reduce logging noise"""
        pass

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PROXY_PORT), CORSProxyHandler)
    print(f"CLSI CORS proxy running on http://localhost:{PROXY_PORT}")
    print(f"Proxying to CLSI at {CLSI_URL}")
    print("Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping proxy...")
        server.shutdown()

