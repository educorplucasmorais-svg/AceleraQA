// Servidor local da Plataforma ACELERA
// Uso: node serve.js
// Acesse: http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.md':   'text/plain',
};

http.createServer((req, res) => {
  let url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(ROOT, url.split('?')[0]);
  const ext = path.extname(filePath);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not found: ' + url); return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'text/plain',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('\n  \x1b[1;34m🚀 Plataforma ACELERA\x1b[0m — Servidor local iniciado');
  console.log(`  \x1b[32m➜  Local:\x1b[0m   http://localhost:${PORT}`);
  console.log(`  \x1b[32m➜  Login:\x1b[0m   http://localhost:${PORT}/login.html`);
  console.log('\n  Pressione Ctrl+C para parar.\n');
});
