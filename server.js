const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// load sessions from disk or initialize
let sessions = {};
try {
  if (fs.existsSync(SESSIONS_FILE)) {
    sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
  }
} catch (e) {
  console.error('Failed to read sessions.json', e);
  sessions = {};
}

function saveSessions() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (e) {
    console.error('Failed to write sessions.json', e);
  }
}

function generatePairCode() {
  // human-friendly pairing code: 6 chars alphanumeric uppercase
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random()*chars.length)];
  return code;
}

// Create a new pairing entry
app.get('/pair', (req, res) => {
  const pairId = nanoid(8);
  const code = generatePairCode();
  const sessionName = '𝐃𝐀𝐌𝐎𝐍';
  const createdAt = new Date().toISOString();
  const entry = {
    pairId,
    code,
    sessionName,
    status: 'pending', // pending | ready | expired
    createdAt,
    expiresAt: new Date(Date.now() + 5*60*1000).toISOString() // 5 minutes
  };
  sessions[pairId] = entry;
  saveSessions();
  res.json(entry);
});

// Get status of a pairId
app.get('/pair/:pairId', (req, res) => {
  const { pairId } = req.params;
  const entry = sessions[pairId];
  if (!entry) return res.status(404).json({ error: 'pairId not found' });
  // expire if past time
  if (new Date(entry.expiresAt) < new Date() && entry.status === 'pending') {
    entry.status = 'expired';
    saveSessions();
  }
  res.json(entry);
});

// Confirm pairing by code (used by bot to confirm)
app.post('/pair/confirm', (req, res) => {
  // expects { pairId, code }
  const { pairId, code } = req.body || {};
  if (!pairId || !code) return res.status(400).json({ error: 'pairId and code required' });
  const entry = sessions[pairId];
  if (!entry) return res.status(404).json({ error: 'pairId not found' });
  if (entry.code !== code) return res.status(400).json({ error: 'invalid code' });
  entry.status = 'ready';
  entry.confirmedAt = new Date().toISOString();
  saveSessions();
  res.json({ success: true, entry });
});

// Simple ping
app.get('/', (req, res) => res.send('Pairing-code API running. Use GET /pair'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
