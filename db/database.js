const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_DIR  = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'pm_dashboard.db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

function initDB() {
  db.exec('CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT DEFAULT "General", status TEXT DEFAULT "Initiating", description TEXT, sponsor TEXT, client TEXT, pm_name TEXT, start_date TEXT, end_date TEXT, budget REAL DEFAULT 0, currency TEXT DEFAULT "USD", location TEXT, phase TEXT DEFAULT "Initiating", pmbok_stage INTEGER DEFAULT 0, pmbok_complete INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime("now")), updated_at TEXT DEFAULT (datetime("now")))');

  db.exec('CREATE TABLE IF NOT EXISTS pmbok_stages (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, stage_num INTEGER NOT NULL, stage_key TEXT NOT NULL, stage_name TEXT NOT NULL, data TEXT DEFAULT "{}", completed INTEGER DEFAULT 0, completed_at TEXT, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE, UNIQUE(project_id, stage_num))');

  db.exec('CREATE TABLE IF NOT EXISTS stakeholders (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, organisation TEXT, role TEXT, email TEXT, phone TEXT, power TEXT DEFAULT "Low", interest TEXT DEFAULT "Low", engagement TEXT DEFAULT "Neutral", notes TEXT, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  db.exec('CREATE TABLE IF NOT EXISTS wbs_items (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, parent_id TEXT, code TEXT, name TEXT NOT NULL, description TEXT, level INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  db.exec('CREATE TABLE IF NOT EXISTS milestones (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL, due_date TEXT, status TEXT DEFAULT "Pending", description TEXT, deliverable TEXT, sort_order INTEGER DEFAULT 0, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  db.exec('CREATE TABLE IF NOT EXISTS risks (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT, category TEXT DEFAULT "Technical", probability INTEGER DEFAULT 3, impact INTEGER DEFAULT 3, score INTEGER DEFAULT 9, severity TEXT DEFAULT "Medium", response TEXT DEFAULT "Mitigate", mitigation TEXT, owner TEXT, status TEXT DEFAULT "Open", FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  db.exec('CREATE TABLE IF NOT EXISTS budget_items (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, wbs_id TEXT, category TEXT NOT NULL, description TEXT, estimated REAL DEFAULT 0, actual REAL DEFAULT 0, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  db.exec('CREATE TABLE IF NOT EXISTS team_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, email TEXT, allocation INTEGER DEFAULT 100, is_external INTEGER DEFAULT 0, skills TEXT, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  db.exec('CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, project_id TEXT, name TEXT NOT NULL, original_name TEXT, category TEXT DEFAULT "General", file_path TEXT NOT NULL, file_size INTEGER DEFAULT 0, mime_type TEXT, pmbok_stage INTEGER, description TEXT, uploaded_at TEXT DEFAULT (datetime("now")), FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  db.exec('CREATE TABLE IF NOT EXISTS comms_plan (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, stakeholder_id TEXT, stakeholder_name TEXT, information TEXT, frequency TEXT, method TEXT, responsible TEXT, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  db.exec('CREATE TABLE IF NOT EXISTS quality_items (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, standard TEXT, metric TEXT, target TEXT, method TEXT, responsible TEXT, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  db.exec('CREATE TABLE IF NOT EXISTS procurement_items (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, description TEXT NOT NULL, category TEXT, contract_type TEXT, vendor TEXT, estimated_cost REAL DEFAULT 0, status TEXT DEFAULT "Planned", FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)');

  console.log('Database ready:', DB_PATH);
}

module.exports = { db, initDB };
