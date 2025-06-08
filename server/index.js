const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const DB_FILE = path.join(__dirname, 'db.json');
const DARTS_FILE = path.join(__dirname, 'darts.json');

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return {
      user: { name: null, age: null, badges: [], scores: { darts: 0 } },
      posts: [
        {
          id: 1,
          author: 'Admin',
          content: 'Welcome to the new message board!',
          date: '2025-01-01T00:00:00Z',
          sentiment: 1,
          status: 'approved',
        },
      ],
      views: [],
      scores: { darts: [] },
      sessions: [],
      promptPairs: [],
    };
  }
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function loadDartRounds() {
  try {
    const rounds = JSON.parse(fs.readFileSync(DARTS_FILE, 'utf8'));
    for (let i = rounds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rounds[i], rounds[j]] = [rounds[j], rounds[i]];
    }
    return rounds;
  } catch {
    return [];
  }
}

async function analyzeSentiment(text) {
  if (!OPENAI_API_KEY) return 0;
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Return only a number between -1 and 1 indicating how positive the sentiment is.',
          },
          { role: 'user', content: text.slice(0, 200) },
        ],
        max_tokens: 1,
      }),
    });
    const data = await resp.json();
    const val = parseFloat(
      data?.choices?.[0]?.message?.content?.trim().split(/\s+/)[0] || '0'
    );
    return Number.isNaN(val) ? 0 : val;
  } catch (err) {
    console.error('Sentiment request failed', err);
    return 0;
  }
}

// Remove personal details and generate an alias for anonymous posting
async function sanitizeComment(text) {
  if (!OPENAI_API_KEY) {
    const withoutAge = text.replace(/\b\d{1,3}\b/g, '');
    return { sanitized: withoutAge.trim(), alias: 'Guest' };
  }
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Remove names, ages and personal identifiers from the text. Provide a short friendly alias summarizing the tone. Respond only in JSON with keys "sanitized" and "alias".',
          },
          { role: 'user', content: text.slice(0, 300) },
        ],
        max_tokens: 60,
        temperature: 0.4,
      }),
    });
    const data = await resp.json();
    let result = { sanitized: text, alias: 'Guest' };
    try {
      result = JSON.parse(data?.choices?.[0]?.message?.content || '');
    } catch {}
    if (!result.sanitized) result.sanitized = text;
    if (!result.alias) result.alias = 'Guest';
    return result;
  } catch (err) {
    console.error('Sanitize request failed', err);
    return { sanitized: text, alias: 'Guest' };
  }
}

app.post('/api/sentiment', async (req, res) => {
  const text = req.body.text || '';
  const score = await analyzeSentiment(text);
  res.json({ score });
});

let data = loadData();
if (!data.views) data.views = [];
if (!data.scores) data.scores = { darts: [] };
if (!data.scores.darts) data.scores.darts = [];
if (!data.user) data.user = { name: null, age: null, badges: [], scores: { darts: 0 } };
if (!data.user.badges) data.user.badges = [];
if (!data.user.scores) data.user.scores = { darts: 0 };
if (data.user.scores.darts === undefined) data.user.scores.darts = 0;
if (!data.sessions) data.sessions = [];
if (!data.promptPairs) data.promptPairs = [];

app.get('/api/user', (req, res) => {
  res.json(data.user);
});

app.post('/api/user', (req, res) => {
  data.user = { ...data.user, ...req.body };
  saveData(data);
  res.json(data.user);
});

app.get('/api/posts', (req, res) => {
  const approved = data.posts.filter(p => p.status === 'approved');
  res.json(approved);
});

app.post('/api/posts', async (req, res) => {
  const content = req.body.content || '';
  const score = await analyzeSentiment(content);
  if (score < -0.1) {
    res.status(400).json({ error: 'Only positive feedback is allowed.' });
    return;
  }
  const { sanitized, alias } = await sanitizeComment(content);
  const status = score <= 0.2 ? 'pending' : 'approved';
  const post = {
    id: Date.now(),
    author: alias,
    content: sanitized,
    date: new Date().toISOString(),
    sentiment: score,
    status,
  };
  data.posts.push(post);
  saveData(data);
  res.status(status === 'approved' ? 201 : 202).json(post);
});

app.post('/api/posts/:id/flag', (req, res) => {
  const id = Number(req.params.id);
  const post = data.posts.find((p) => p.id === id);
  if (post) {
    post.flagged = true;
    saveData(data);
    res.json(post);
  } else {
    res.status(404).end();
  }
});

app.get('/api/pairs', (req, res) => {
  res.json(data.promptPairs);
});

app.post('/api/pairs', (req, res) => {
  const pair = {
    id: Date.now(),
    bad: req.body.bad || '',
    good: req.body.good || '',
  };
  data.promptPairs.push(pair);
  saveData(data);
  res.status(201).json(pair);
});

app.get('/api/darts', (req, res) => {
  const rounds = loadDartRounds();
  res.json(rounds);
});

app.get('/api/views', (req, res) => {
  res.json(data.views);
});

app.post('/api/views', (req, res) => {
  const view = {
    id: Date.now(),
    visitorId: req.body.visitorId || null,
    user: req.body.user || null,
    path: req.body.path || '',
    referrer: req.body.referrer || req.headers.referer || '',
    agent: req.body.agent || req.headers['user-agent'] || '',
    ip: req.ip,
    start: new Date().toISOString(),
  };
  data.views.push(view);
  saveData(data);
  res.status(201).json(view);
});

app.post('/api/views/:id/end', (req, res) => {
  const id = Number(req.params.id);
  const view = data.views.find((v) => v.id === id);
  if (!view) {
    res.status(404).end();
    return;
  }
  view.end = new Date().toISOString();
  view.duration = Number(view.duration || Date.now() - new Date(view.start).getTime());
  saveData(data);
  res.json(view);
});

app.get('/api/scores', (req, res) => {
  res.json(data.scores);
});

app.post('/api/scores/:game', (req, res) => {
  const game = req.params.game;
  const entry = { name: req.body.name || 'Anonymous', score: Number(req.body.score) || 0 };
  if (!data.scores[game]) data.scores[game] = [];
  data.scores[game].push(entry);
  data.scores[game].sort((a, b) => b.score - a.score);
  data.scores[game] = data.scores[game].slice(0, 10);
  saveData(data);
  res.json(data.scores[game]);
});

// Serve a friendly 404 page for any unknown route
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
