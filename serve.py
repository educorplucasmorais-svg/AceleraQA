#!/usr/bin/env python3
"""
Servidor local da Plataforma ACELERA
Uso: python serve.py
Acesse: http://localhost:3000
"""
import http.server
import socketserver
import os

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"  \033[36m{self.address_string()}\033[0m - {format % args}")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"\n  \033[1;34m🚀 Plataforma ACELERA\033[0m — Servidor local iniciado")
    print(f"  \033[32m➜  Local:\033[0m   http://localhost:{PORT}")
    print(f"  \033[32m➜  Login:\033[0m   http://localhost:{PORT}/login.html")
    print(f"\n  Pressione Ctrl+C para parar.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n  Servidor encerrado.")
