const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
require('dotenv').config?.();

const applicantsHandler = require('./api/applicants');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API Requests (/api/applicants)
  if (pathname === '/api/applicants' || pathname.startsWith('/api/applicants/')) {
    // Collect body for POST/PATCH/DELETE
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });

    req.on('end', async () => {
      if (bodyData) {
        try {
          req.body = JSON.parse(bodyData);
        } catch (e) {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      req.query = parsedUrl.query;

      // Enhance res with status and json helpers
      res.status = function(code) {
        this.statusCode = code;
        return this;
      };
      res.json = function(data) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
      };

      try {
        await applicantsHandler(req, res);
      } catch (err) {
        console.error('API Error in server:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Handle /admin route -> serve index.html
  let filePath = pathname === '/' || pathname === '/admin' 
    ? path.join(__dirname, 'index.html') 
    : path.join(__dirname, pathname);

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routes
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Error loading file: ' + readErr.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🛡️  ALWAR POLICE CYBER INTERNSHIP PORTAL IS LIVE`);
  console.log(`🌐  Local URL:  http://localhost:${PORT}`);
  console.log(`🔒  Admin URL:  http://localhost:${PORT}/#admin`);
  console.log(`⚡  Connected:  Neon PostgreSQL Cloud Database`);
  console.log(`==================================================\n`);
});
