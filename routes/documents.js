const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

module.exports = function(upload) {
  const router = express.Router();

  // GET all documents (optionally filtered by project)
  router.get('/', (req, res) => {
    try {
      const { project_id } = req.query;
      const docs = project_id
        ? db.prepare('SELECT * FROM documents WHERE project_id=? ORDER BY uploaded_at DESC').all(project_id)
        : db.prepare('SELECT * FROM documents ORDER BY uploaded_at DESC').all();
      res.json(docs);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // POST upload document
  router.post('/upload', upload.array('files', 20), (req, res) => {
    try {
      const { project_id, category, pmbok_stage, description } = req.body;
      const inserted = [];

      for (const file of req.files) {
        const id = uuidv4();
        const now = new Date().toISOString();
        db.prepare(`INSERT INTO documents (id, project_id, name, original_name, category, file_path, file_size, mime_type, pmbok_stage, description, uploaded_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
          .run(id, project_id||null, file.originalname, file.originalname, category||'General',
               '/uploads/' + file.filename, file.size, file.mimetype,
               pmbok_stage ? parseInt(pmbok_stage) : null, description||'', now);
        inserted.push({ id, name: file.originalname, size: file.size, path: '/uploads/' + file.filename });
      }
      res.json({ uploaded: inserted });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // PATCH update document metadata
  router.patch('/:id', (req, res) => {
    try {
      const { name, category, description } = req.body;
      db.prepare('UPDATE documents SET name=?, category=?, description=? WHERE id=?')
        .run(name, category, description||'', req.params.id);
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // DELETE document
  router.delete('/:id', (req, res) => {
    try {
      const doc = db.prepare('SELECT * FROM documents WHERE id=?').get(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });

      // Delete physical file
      const filePath = path.join(__dirname, '..', doc.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      db.prepare('DELETE FROM documents WHERE id=?').run(req.params.id);
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // GET document categories summary
  router.get('/summary', (req, res) => {
    try {
      const { project_id } = req.query;
      const rows = project_id
        ? db.prepare('SELECT category, COUNT(*) as count, SUM(file_size) as total_size FROM documents WHERE project_id=? GROUP BY category').all(project_id)
        : db.prepare('SELECT category, COUNT(*) as count, SUM(file_size) as total_size FROM documents GROUP BY category').all();
      res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  return router;
};
