const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

// PMBOK stage definitions
const PMBOK_STAGES = [
  { num: 1,  key: 'initiation',      name: 'Project Initiation',        group: 'Initiating' },
  { num: 2,  key: 'charter',         name: 'Project Charter',           group: 'Initiating' },
  { num: 3,  key: 'stakeholders',    name: 'Stakeholder Register',      group: 'Initiating' },
  { num: 4,  key: 'scope',           name: 'Scope Management',          group: 'Planning' },
  { num: 5,  key: 'wbs',             name: 'Work Breakdown Structure',  group: 'Planning' },
  { num: 6,  key: 'schedule',        name: 'Schedule Management',       group: 'Planning' },
  { num: 7,  key: 'cost',            name: 'Cost Management',           group: 'Planning' },
  { num: 8,  key: 'risk',            name: 'Risk Management',           group: 'Planning' },
  { num: 9,  key: 'resources',       name: 'Resource Management',       group: 'Planning' },
  { num: 10, key: 'communications',  name: 'Communications Plan',       group: 'Planning' },
  { num: 11, key: 'quality',         name: 'Quality Management',        group: 'Planning' },
  { num: 12, key: 'procurement',     name: 'Procurement Management',    group: 'Planning' },
  { num: 13, key: 'kickoff',         name: 'Execution Kickoff',         group: 'Executing' },
];

// GET stage definitions
router.get('/stages', (req, res) => {
  res.json(PMBOK_STAGES);
});

// GET all stages for a project
router.get('/project/:projectId', (req, res) => {
  try {
    const stages = db.prepare('SELECT * FROM pmbok_stages WHERE project_id=? ORDER BY stage_num').all(req.params.projectId);
    res.json(stages);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST save/update a stage
router.post('/project/:projectId/stage/:stageNum', (req, res) => {
  try {
    const { projectId, stageNum } = req.params;
    const { data, completed } = req.body;
    const num = parseInt(stageNum);
    const stageDef = PMBOK_STAGES.find(s => s.num === num);
    if (!stageDef) return res.status(404).json({ error: 'Stage not found' });

    const existing = db.prepare('SELECT id FROM pmbok_stages WHERE project_id=? AND stage_num=?').get(projectId, num);
    const dataStr = JSON.stringify(data || {});
    const isComplete = completed ? 1 : 0;
    const completedAt = completed ? new Date().toISOString() : null;

    if (existing) {
      db.prepare(`UPDATE pmbok_stages SET data=?, completed=?, completed_at=? WHERE id=?`)
        .run(dataStr, isComplete, completedAt, existing.id);
    } else {
      const id = uuidv4();
      db.prepare(`INSERT INTO pmbok_stages (id, project_id, stage_num, stage_key, stage_name, data, completed, completed_at)
        VALUES (?,?,?,?,?,?,?,?)`)
        .run(id, projectId, num, stageDef.key, stageDef.name, dataStr, isComplete, completedAt);
    }

    // Update project's current stage
    if (completed) {
      const completedCount = db.prepare('SELECT COUNT(*) as c FROM pmbok_stages WHERE project_id=? AND completed=1').get(projectId);
      const allComplete = completedCount.c >= PMBOK_STAGES.length;
      db.prepare('UPDATE projects SET pmbok_stage=?, pmbok_complete=? WHERE id=?')
        .run(num, allComplete ? 1 : 0, projectId);
      if (allComplete) {
        db.prepare("UPDATE projects SET phase='Executing', status='Active' WHERE id=?").run(projectId);
      }
    }

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST apply stage data to relational tables (called when completing a stage)
router.post('/project/:projectId/apply/:stageKey', (req, res) => {
  try {
    const { projectId, stageKey } = req.params;
    const { data } = req.body;

    switch (stageKey) {
      case 'initiation':
      case 'charter': {
        const fields = {};
        if (data.name)        fields.name = data.name;
        if (data.type)        fields.type = data.type;
        if (data.description) fields.description = data.description;
        if (data.sponsor)     fields.sponsor = data.sponsor;
        if (data.client)      fields.client = data.client;
        if (data.pm_name)     fields.pm_name = data.pm_name;
        if (data.start_date)  fields.start_date = data.start_date;
        if (data.end_date)    fields.end_date = data.end_date;
        if (data.budget)      fields.budget = parseFloat(data.budget) || 0;
        if (data.currency)    fields.currency = data.currency;
        if (data.location)    fields.location = data.location;
        if (Object.keys(fields).length > 0) {
          const sets = Object.keys(fields).map(k => `${k}=?`).join(', ');
          db.prepare(`UPDATE projects SET ${sets} WHERE id=?`).run(...Object.values(fields), projectId);
        }
        break;
      }

      case 'stakeholders': {
        if (data.stakeholders && Array.isArray(data.stakeholders)) {
          // Clear existing and re-insert
          db.prepare('DELETE FROM stakeholders WHERE project_id=?').run(projectId);
          for (const s of data.stakeholders) {
            const id = uuidv4();
            db.prepare(`INSERT INTO stakeholders (id, project_id, name, organisation, role, email, phone, power, interest, engagement, notes)
              VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
              .run(id, projectId, s.name||'', s.organisation||'', s.role||'', s.email||'', s.phone||'', s.power||'Low', s.interest||'Low', s.engagement||'Neutral', s.notes||'');
          }
        }
        break;
      }

      case 'wbs': {
        if (data.wbs && Array.isArray(data.wbs)) {
          db.prepare('DELETE FROM wbs_items WHERE project_id=?').run(projectId);
          for (let i = 0; i < data.wbs.length; i++) {
            const w = data.wbs[i];
            const id = uuidv4();
            db.prepare(`INSERT INTO wbs_items (id, project_id, parent_id, code, name, description, level, sort_order)
              VALUES (?,?,?,?,?,?,?,?)`)
              .run(id, projectId, w.parent_id||null, w.code||'', w.name||'', w.description||'', w.level||1, i);
          }
        }
        break;
      }

      case 'schedule': {
        if (data.milestones && Array.isArray(data.milestones)) {
          db.prepare('DELETE FROM milestones WHERE project_id=?').run(projectId);
          for (let i = 0; i < data.milestones.length; i++) {
            const m = data.milestones[i];
            const id = uuidv4();
            db.prepare(`INSERT INTO milestones (id, project_id, title, due_date, status, description, deliverable, sort_order)
              VALUES (?,?,?,?,?,?,?,?)`)
              .run(id, projectId, m.title||'', m.due_date||'', 'Pending', m.description||'', m.deliverable||'', i);
          }
        }
        break;
      }

      case 'cost': {
        if (data.budget_items && Array.isArray(data.budget_items)) {
          db.prepare('DELETE FROM budget_items WHERE project_id=?').run(projectId);
          let total = 0;
          for (const b of data.budget_items) {
            const id = uuidv4();
            const est = parseFloat(b.estimated) || 0;
            total += est;
            db.prepare(`INSERT INTO budget_items (id, project_id, category, description, estimated, actual)
              VALUES (?,?,?,?,?,?)`)
              .run(id, projectId, b.category||'General', b.description||'', est, 0);
          }
          db.prepare('UPDATE projects SET budget=? WHERE id=?').run(total, projectId);
        }
        break;
      }

      case 'risk': {
        if (data.risks && Array.isArray(data.risks)) {
          db.prepare('DELETE FROM risks WHERE project_id=?').run(projectId);
          for (const r of data.risks) {
            const id = uuidv4();
            const p = parseInt(r.probability) || 3;
            const i2 = parseInt(r.impact) || 3;
            const score = p * i2;
            const severity = score >= 15 ? 'Critical' : score >= 9 ? 'High' : score >= 5 ? 'Medium' : 'Low';
            db.prepare(`INSERT INTO risks (id, project_id, title, description, category, probability, impact, score, severity, response, mitigation, owner)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
              .run(id, projectId, r.title||'', r.description||'', r.category||'Technical', p, i2, score, severity, r.response||'Mitigate', r.mitigation||'', r.owner||'');
          }
        }
        break;
      }

      case 'resources': {
        if (data.team && Array.isArray(data.team)) {
          db.prepare('DELETE FROM team_members WHERE project_id=?').run(projectId);
          for (const t of data.team) {
            const id = uuidv4();
            db.prepare(`INSERT INTO team_members (id, project_id, name, role, email, allocation, is_external, skills)
              VALUES (?,?,?,?,?,?,?,?)`)
              .run(id, projectId, t.name||'', t.role||'', t.email||'', t.allocation||100, t.is_external?1:0, t.skills||'');
          }
        }
        break;
      }

      case 'communications': {
        if (data.comms && Array.isArray(data.comms)) {
          db.prepare('DELETE FROM comms_plan WHERE project_id=?').run(projectId);
          for (const c of data.comms) {
            const id = uuidv4();
            db.prepare(`INSERT INTO comms_plan (id, project_id, stakeholder_name, information, frequency, method, responsible)
              VALUES (?,?,?,?,?,?,?)`)
              .run(id, projectId, c.stakeholder_name||'', c.information||'', c.frequency||'Monthly', c.method||'Email', c.responsible||'');
          }
        }
        break;
      }

      case 'quality': {
        if (data.quality && Array.isArray(data.quality)) {
          db.prepare('DELETE FROM quality_items WHERE project_id=?').run(projectId);
          for (const q of data.quality) {
            const id = uuidv4();
            db.prepare(`INSERT INTO quality_items (id, project_id, standard, metric, target, method, responsible)
              VALUES (?,?,?,?,?,?,?)`)
              .run(id, projectId, q.standard||'', q.metric||'', q.target||'', q.method||'', q.responsible||'');
          }
        }
        break;
      }

      case 'procurement': {
        if (data.procurement && Array.isArray(data.procurement)) {
          db.prepare('DELETE FROM procurement_items WHERE project_id=?').run(projectId);
          for (const p of data.procurement) {
            const id = uuidv4();
            db.prepare(`INSERT INTO procurement_items (id, project_id, description, category, contract_type, vendor, estimated_cost, status)
              VALUES (?,?,?,?,?,?,?,?)`)
              .run(id, projectId, p.description||'', p.category||'', p.contract_type||'Fixed Price', p.vendor||'', parseFloat(p.estimated_cost)||0, 'Planned');
          }
        }
        break;
      }
    }

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
