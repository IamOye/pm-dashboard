# EVD PM Dashboard — Deployment Guide

## What You're Deploying

A self-hosted Node.js web server with:
- **Dashboard** (`/`) — The full PM monitoring dashboard
- **PMBOK Wizard** (`/wizard`) — Guided project setup (12 PMBOK stages)
- **REST API** (`/api`) — Projects, documents, risks, budget, team, etc.
- **File uploads** — Documents, drawings, PDFs, DWGs up to 100MB
- **Database** — SQLite (single file, no installation needed)

---

## Prerequisites

Install Node.js (v18+) from https://nodejs.org — use the LTS version.

Verify it's installed:
```bash
node --version   # should print v18.x.x or higher
npm --version
```

---

## Quick Start (Local / Your Own PC)

```bash
# 1. Go to the project folder
cd "C:\Users\HP\Claude_Projects\pm-dashboard"

# 2. Install dependencies (one-time setup, ~30 seconds)
npm install

# 3. Start the server
node server.js
```

Open your browser at: **http://localhost:3000**

The wizard is at: **http://localhost:3000/wizard**

---

## Running on a Server / VPS (Ubuntu/Debian)

### 1. Copy files to your server
```bash
# From your PC, zip and copy (or use git clone)
git clone https://github.com/IamOye/pm-dashboard.git
cd pm-dashboard
npm install
```

### 2. Install PM2 (keeps the server running permanently)
```bash
npm install -g pm2
pm2 start server.js --name "pm-dashboard"
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

### 3. (Optional) Use Nginx as a reverse proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 100M;
    }
}
```

---

## Accessing on Your Local Network (LAN)

Once the server is running, find your PC's IP address:
- Windows: run `ipconfig` → look for IPv4 Address (e.g. `192.168.1.105`)
- Other people on the same WiFi/LAN can access: `http://192.168.1.105:3000`

---

## File Structure

```
pm-dashboard/
├── server.js           ← Main server (run this)
├── package.json        ← Dependencies
├── db/
│   └── database.js     ← SQLite schema & connection
├── routes/
│   ├── projects.js     ← All project API routes
│   ├── documents.js    ← File upload routes
│   └── pmbok.js        ← PMBOK wizard state routes
├── public/
│   ├── index.html      ← Main dashboard (served at /)
│   └── wizard.html     ← PMBOK Setup Wizard (served at /wizard)
├── uploads/            ← Uploaded files are stored here
│   └── (auto-created)
└── data/
    └── pm_dashboard.db ← SQLite database (auto-created)
```

---

## Adding AI Document Intelligence (Future)

The wizard is pre-wired for AI integration. To enable:

1. Get a Claude API key from https://console.anthropic.com
2. Add to a `.env` file:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. In `routes/documents.js`, uncomment the AI parsing section (to be added)

This will allow uploaded PDFs and drawings to be automatically parsed, with the wizard pre-filling fields from the document content.

---

## Backup

Your data lives in `data/pm_dashboard.db`. Back it up regularly:
```bash
# Copy the database file
cp data/pm_dashboard.db data/backup_$(date +%Y%m%d).db
```

---

## Stopping the Server

- Local: press `Ctrl+C` in the terminal
- PM2: `pm2 stop pm-dashboard`
