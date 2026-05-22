const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

// GET all projects
router.get('/', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    // Attach summary counts
    const enriched = projects.map(p => {
      const risks     = db.prepare('SELECT COUNT(*) as c FROM risks WHERE project_id=?').get(p.id);
      const docs      = db.prepare('SELECT COUNT(*) as c FROM documents WHERE project_id=?').get(p.id);
      const miles     = db.prepare('SELECT COUNT(*) as c FROM milestones WHERE project_id=?').get(p.id);
      const milesDone = db.prepare("SELECT COUNT(*) as c FROM milestones WHERE project_id=? AND status='Completed'").get(p.id);
      const budget    = db.prepare('SELECT SUM(estimated) as est, SUM(actual) as act FROM budget_items WHERE project_id=?').get(p.id);
      return {
        ...p,
        risk_count:       risks.c,
        doc_count:        docs.c,
        milestone_count:  miles.c,
        milestone_done:   milesDone.c,
        budget_estimated: budget.est || p.budget || 0,
        budget_actual:    budget.act || 0,
      };
    });
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET single project with full detail
router.get('/:id', (req, res) => {
  try {
    const p = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });

    const stakeholders = db.prepare('SELECT * FROM stakeholders WHERE project_id=?').all(p.id);
    const wbs          = db.prepare('SELECT * FROM wbs_items WHERE project_id=? ORDER BY level, sort_order').all(p.id);
    const milestones   = db.prepare('SELECT * FROM milestones WHERE project_id=? ORDER BY sort_order').all(p.id);
    const risks        = db.prepare('SELECT * FROM risks WHERE project_id=?').all(p.id);
    const budgetItems  = db.prepare('SELECT * FROM budget_items WHERE project_id=?').all(p.id);
    const team         = db.prepare('SELECT * FROM team_members WHERE project_id=?').all(p.id);
    const documents    = db.prepare('SELECT * FROM documents WHERE project_id=? ORDER BY uploaded_at DESC').all(p.id);
    const comms        = db.prepare('SELECT * FROM comms_plan WHERE project_id=?').all(p.id);
    const quality      = db.prepare('SELECT * FROM quality_items WHERE project_id=?').all(p.id);
    const procurement  = db.prepare('SELECT * FROM procurement_items WHERE project_id=?').all(p.id);
    const pmbokStages  = db.prepare('SELECT * FROM pmbok_stages WHERE project_id=? ORDER BY stage_num').all(p.id);

    res.json({ ...p, stakeholders, wbs, milestones, risks, budgetItems, team, documents, comms, quality, procurement, pmbokStages });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create project (minimal — wizard fills the rest)
router.post('/', (req, res) => {
  try {
    const id = uuidv4();
    const {
      name, type, description, sponsor, client, pm_name,
      start_date, end_date, budget, currency, location
    } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name required' });

    db.prepare(`INSERT INTO projects (id, name, type, description, sponsor, client, pm_name, start_date, end_date, budget, currency, location)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, name, type||'General', description||'', sponsor||'', client||'', pm_name||'', start_date||'', end_date||'', budget||0, currency||'USD', location||'');

    res.json({ id, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH update project fields
router.patch('/:id', (req, res) => {
  try {
    const fields = req.body;
    fields.updated_at = new Date().toISOString();
    const sets = Object.keys(fields).map(k => `${k}=?`).join(', ');
    const vals = [...Object.values(fields), req.params.id];
    db.prepare(`UPDATE projects SET ${sets} WHERE id=?`).run(...vals);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE project
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ──────────────────────────────────────────────────────────
// SUB-RESOURCE ROUTES
// ──────────────────────────────────────────────────────────

// Stakeholders
router.post('/:id/stakeholders', (req, res) => {
  try {
    const id = uuidv4();
    const { name, organisation, role, email, phone, power, interest, engagement, notes } = req.body;
    db.prepare(`INSERT INTO stakeholders (id, project_id, name, organisation, role, email, phone, power, interest, engagement, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, req.params.id, name, organisation||'', role||'', email||'', phone||'', power||'Low', interest||'Low', engagement||'Neutral', notes||'');
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/stakeholders/:sid', (req, res) => {
  try {
    db.prepare('DELETE FROM stakeholders WHERE id=? AND project_id=?').run(req.params.sid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// WBS
router.post('/:id/wbs', (req, res) => {
  try {
    const id = uuidv4();
    const { parent_id, code, name, description, level, sort_order } = req.body;
    db.prepare(`INSERT INTO wbs_items (id, project_id, parent_id, code, name, description, level, sort_order) VALUES (?,?,?,?,?,?,?,?)`)
      .run(id, req.params.id, parent_id||null, code||'', name, description||'', level||1, sort_order||0);
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/wbs/:wid', (req, res) => {
  try {
    const { name, description, code } = req.body;
    db.prepare('UPDATE wbs_items SET name=?, description=?, code=? WHERE id=? AND project_id=?')
      .run(name, description||'', code||'', req.params.wid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/wbs/:wid', (req, res) => {
  try {
    db.prepare('DELETE FROM wbs_items WHERE id=? AND project_id=?').run(req.params.wid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Milestones
router.post('/:id/milestones', (req, res) => {
  try {
    const id = uuidv4();
    const { title, due_date, status, description, deliverable, sort_order } = req.body;
    db.prepare(`INSERT INTO milestones (id, project_id, title, due_date, status, description, deliverable, sort_order) VALUES (?,?,?,?,?,?,?,?)`)
      .run(id, req.params.id, title, due_date||'', status||'Pending', description||'', deliverable||'', sort_order||0);
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/milestones/:mid', (req, res) => {
  try {
    const fields = req.body;
    const sets = Object.keys(fields).map(k => `${k}=?`).join(', ');
    db.prepare(`UPDATE milestones SET ${sets} WHERE id=? AND project_id=?`).run(...Object.values(fields), req.params.mid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/milestones/:mid', (req, res) => {
  try {
    db.prepare('DELETE FROM milestones WHERE id=? AND project_id=?').run(req.params.mid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Risks
router.post('/:id/risks', (req, res) => {
  try {
    const id = uuidv4();
    const { title, description, category, probability, impact, response, mitigation, owner } = req.body;
    const p = probability || 3;
    const i = impact || 3;
    const score = p * i;
    const severity = score >= 15 ? 'Critical' : score >= 9 ? 'High' : score >= 5 ? 'Medium' : 'Low';
    db.prepare(`INSERT INTO risks (id, project_id, title, description, category, probability, impact, score, severity, response, mitigation, owner) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, req.params.id, title, description||'', category||'Technical', p, i, score, severity, response||'Mitigate', mitigation||'', owner||'');
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/risks/:rid', (req, res) => {
  try {
    const fields = req.body;
    if (fields.probability && fields.impact) {
      fields.score = fields.probability * fields.impact;
      fields.severity = fields.score >= 15 ? 'Critical' : fields.score >= 9 ? 'High' : fields.score >= 5 ? 'Medium' : 'Low';
    }
    const sets = Object.keys(fields).map(k => `${k}=?`).join(', ');
    db.prepare(`UPDATE risks SET ${sets} WHERE id=? AND project_id=?`).run(...Object.values(fields), req.params.rid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/risks/:rid', (req, res) => {
  try {
    db.prepare('DELETE FROM risks WHERE id=? AND project_id=?').run(req.params.rid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Budget Items
router.post('/:id/budget', (req, res) => {
  try {
    const id = uuidv4();
    const { category, description, estimated, actual, wbs_id } = req.body;
    db.prepare(`INSERT INTO budget_items (id, project_id, category, description, estimated, actual, wbs_id) VALUES (?,?,?,?,?,?,?)`)
      .run(id, req.params.id, category||'General', description||'', estimated||0, actual||0, wbs_id||null);
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/budget/:bid', (req, res) => {
  try {
    db.prepare('DELETE FROM budget_items WHERE id=? AND project_id=?').run(req.params.bid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Team Members
router.post('/:id/team', (req, res) => {
  try {
    const id = uuidv4();
    const { name, role, email, allocation, is_external, skills } = req.body;
    db.prepare(`INSERT INTO team_members (id, project_id, name, role, email, allocation, is_external, skills) VALUES (?,?,?,?,?,?,?,?)`)
      .run(id, req.params.id, name, role||'', email||'', allocation||100, is_external?1:0, skills||'');
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/team/:tid', (req, res) => {
  try {
    db.prepare('DELETE FROM team_members WHERE id=? AND project_id=?').run(req.params.tid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Communications Plan
router.post('/:id/comms', (req, res) => {
  try {
    const id = uuidv4();
    const { stakeholder_name, information, frequency, method, responsible } = req.body;
    db.prepare(`INSERT INTO comms_plan (id, project_id, stakeholder_name, information, frequency, method, responsible) VALUES (?,?,?,?,?,?,?)`)
      .run(id, req.params.id, stakeholder_name||'', information||'', frequency||'Monthly', method||'Email', responsible||'');
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/comms/:cid', (req, res) => {
  try {
    db.prepare('DELETE FROM comms_plan WHERE id=? AND project_id=?').run(req.params.cid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Quality Items
router.post('/:id/quality', (req, res) => {
  try {
    const id = uuidv4();
    const { standard, metric, target, method, responsible } = req.body;
    db.prepare(`INSERT INTO quality_items (id, project_id, standard, metric, target, method, responsible) VALUES (?,?,?,?,?,?,?)`)
      .run(id, req.params.id, standard||'', metric||'', target||'', method||'', responsible||'');
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/quality/:qid', (req, res) => {
  try {
    db.prepare('DELETE FROM quality_items WHERE id=? AND project_id=?').run(req.params.qid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Procurement
router.post('/:id/procurement', (req, res) => {
  try {
    const id = uuidv4();
    const { description, category, contract_type, vendor, estimated_cost, status } = req.body;
    db.prepare(`INSERT INTO procurement_items (id, project_id, description, category, contract_type, vendor, estimated_cost, status) VALUES (?,?,?,?,?,?,?,?)`)
      .run(id, req.params.id, description||'', category||'', contract_type||'Fixed Price', vendor||'', estimated_cost||0, status||'Planned');
    res.json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/procurement/:pid', (req, res) => {
  try {
    db.prepare('DELETE FROM procurement_items WHERE id=? AND project_id=?').run(req.params.pid, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
