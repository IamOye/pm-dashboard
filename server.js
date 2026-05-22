/**
 * EVD PM Dashboard — Self-Hosted Server
 * Node.js + Express + SQLite
 * Run: node server.js
 * Access: http://localhost:3000
 */

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { initDB } = require('./db/database');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

// ─────────────────────────────────────────────────────────
// MULTER (file upload)
// ─────────────────────────────────────────────────────────
const ALLOWED_EXT = new Set([
  '.pdf', '.docx', '.doc', '.xlsx', '.xls',
  '.pptx', '.ppt', '.png', '.jpg', '.jpeg',
  '.gif', '.webp', '.dwg', '.dxf', '.ifc',
  '.csv', '.txt', '.zip', '.rar', '.7z'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, Date.now() + '_' + safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ALLOWED_EXT.has(ext) ? cb(null, true) : cb(new Error('File type not allowed: ' + ext));
  }
});

// ─────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────
app.use('/api/projects',  require('./routes/projects'));
app.use('/api/documents', require('./routes/documents')(upload));
app.use('/api/pmbok',     require('./routes/pmbok'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', time: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────
// SPA FALLBACK — serve index.html for all non-API routes
// ─────────────────────────────────────────────────────────
app.get(/^(?!\/api).*/, (req, res) => {
  // Serve wizard.html for /wizard route, otherwise index.html
  if (req.path.startsWith('/wizard')) {
    return res.sendFile(path.join(__dirname, 'public', 'wizard.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// ─────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────
initDB();
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │  EVD PM Dashboard Server                    │');
  console.log('  │  http://localhost:' + PORT + '                       │');
  console.log('  │  Dashboard : http://localhost:' + PORT + '           │');
  console.log('  │  Wizard    : http://localhost:' + PORT + '/wizard    │');
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
});
