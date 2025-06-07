const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const DB_FILE = path.join(__dirname, 'db.json');

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return {
      user: { name: null, age: null, badges: [], scores: { darts: 0 } },
      posts: [],
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
  res.json(data.posts);
});

app.post('/api/posts', (req, res) => {
  const author = req.body.author || 'Anonymous';
  if (data.posts.some((p) => p.author === author)) {
    res.status(400).json({ error: 'Limit reached: only one post per user' });
    return;
  }
  const post = {
    id: Date.now(),
    author,
    content: req.body.content || '',
    date: new Date().toISOString(),
  };
  data.posts.push(post);
  saveData(data);
  res.status(201).json(post);
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
