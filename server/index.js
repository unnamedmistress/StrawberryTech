const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { user: { name: null, age: null }, posts: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let data = loadData();

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
  const post = {
    id: Date.now(),
    author: req.body.author || 'Anonymous',
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
