const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const firestore = require('./firebase');

const useLocalStore = process.env.USE_LOCAL_STORE === 'true';

function logEnvVars() {
  const keys = [
    'FIREBASE_SERVICE_ACCOUNT',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'USE_LOCAL_STORE',
    'NODE_ENV',
  ];
  console.log('Loaded environment variables:');
  keys.forEach(key => {
    const val = process.env[key];
    if (val) {
      const display = val.length > 100 ? val.slice(0, 100) + '...' : val;
      console.log(`  ${key}=${display}`);
    } else {
      console.log(`  ${key} is not set`);
    }
  });
}

function ensureFirestore(res) {
  if (!firestore) {
    if (!useLocalStore) {
      res
        .status(503)
        .json({
          error: 'Firestore unavailable. Set USE_LOCAL_STORE=true to use the local in-memory store.',
        });
      return false;
    }
    return true;
  }
  return true;
}

function createLocalScoresStore() {
  const store = {};
  return {
    doc(id) {
      return {
        async get() {
          return { exists: !!store[id], data: () => store[id] || { entries: [] } };
        },
        async set(data) {
          store[id] = data;
        },
      };
    },
    async get() {
      return {
        forEach(cb) {
          for (const [id, val] of Object.entries(store)) {
            cb({ id, data: () => val });
          }
        },
      };
    },
  };
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const DARTS_FILE = path.join(__dirname, 'darts.json');

// Collection references
const posts = firestore ? firestore.collection('posts') : null;
const prompts = firestore ? firestore.collection('prompts') : null;
const pairs = firestore ? firestore.collection('pairs') : null;
const views = firestore ? firestore.collection('views') : null;
const scores = firestore
  ? firestore.collection('scores')
  : useLocalStore
  ? createLocalScoresStore()
  : null;
const userDoc = firestore ? firestore.collection('config').doc('user') : null;
const BADGES = require('./badges.json');

async function loadData() {
  const userSnap = await userDoc.get();
  const user = userSnap.exists
    ? userSnap.data()
    : { id: '', name: null, age: null, badges: [], points: { darts: 0 } };
  const scoresSnap = await scores.get();
  const scoreData = {};
  scoresSnap.forEach(doc => (scoreData[doc.id] = doc.data().entries || []));
  const postsSnap = await posts.get();
  const postData = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const viewsSnap = await views.get();
  const viewData = viewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const pairsSnap = await pairs.get();
  const pairData = pairsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  return { user, scores: scoreData, posts: postData, views: viewData, promptPairs: pairData };
}

async function saveData(data) {
  await userDoc.set(data.user);
  for (const [game, entries] of Object.entries(data.scores || {})) {
    await scores.doc(game).set({ entries });
  }
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
            content: 'Return only a number between -1 and 1 indicating how positive the sentiment is.',
          },
          { role: 'user', content: text.slice(0, 200) },
        ],
        max_tokens: 1,
      }),
    });
    const data = await resp.json();
    const val = parseFloat(data?.choices?.[0]?.message?.content?.trim().split(/\s+/)[0] || '0');
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
            content: 'Remove names, ages and personal identifiers from the text. Provide a short friendly alias summarizing the tone. Respond only in JSON with keys "sanitized" and "alias".',
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

async function moderatePrompt(text) {
  if (!OPENAI_API_KEY) {
    return { flagged: false, category: 'general' };
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
              'Classify the text into a short category and indicate if it violates content policies. Respond only in JSON with keys "flagged" and "category".',
          },
          { role: 'user', content: text.slice(0, 300) },
        ],
        max_tokens: 20,
        temperature: 0,
      }),
    });
    const data = await resp.json();
    let result = { flagged: false, category: 'general' };
    try {
      result = JSON.parse(data?.choices?.[0]?.message?.content || '');
    } catch {}
    if (!result.category) result.category = 'general';
    return result;
  } catch (err) {
    console.error('Moderation request failed', err);
    return { flagged: false, category: 'general' };
  }
}

app.post('/api/sentiment', async (req, res) => {
  const text = req.body.text || '';
  const score = await analyzeSentiment(text);
  res.json({ score });
});

app.get('/api/user', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const snap = await userDoc.get();
  res.json(
    snap.exists ? snap.data() : { id: '', name: null, age: null, badges: [], points: { darts: 0 } }
  );
});

app.post('/api/user', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const snap = await userDoc.get();
  const user = { ...(snap.exists ? snap.data() : {}), ...req.body };
  await userDoc.set(user);
  res.json(user);
});

app.get('/api/progress', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const snap = await userDoc.get();
  const data = snap.exists ? snap.data() : { points: {}, badges: [] };
  const totalPoints = Object.values(data.points || {}).reduce(
    (a, b) => a + b,
    0,
  );
  res.json({ totalPoints, badges: data.badges || [] });
});

app.get('/api/posts', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const snap = await posts.where('status', '==', 'approved').get();
  const list = [];
  snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
  res.json(list);
});

app.post('/api/posts', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const content = req.body.content || '';
  const score = await analyzeSentiment(content);
  if (score < -0.1) {
    res.status(400).json({ error: 'Only positive feedback is allowed.' });
    return;
  }
  const { sanitized, alias } = await sanitizeComment(content);
  const status = score <= 0.2 ? 'pending' : 'approved';
  const now = new Date().toISOString();
  const docRef = await posts.add({
    author: alias,
    content: sanitized,
    date: now,
    sentiment: score,
    status,
  });
  const post = { id: docRef.id, author: alias, content: sanitized, date: now, sentiment: score, status };
  res.status(status === 'approved' ? 201 : 202).json(post);
});

app.post('/api/posts/:id/flag', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const id = req.params.id;
  const ref = posts.doc(id);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.update({ flagged: true });
    res.json({ id, ...snap.data(), flagged: true });
  } else {
    res.status(404).end();
  }
});

app.get('/api/prompts', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const snap = await prompts.where('flagged', '==', false).get();
  const list = [];
  snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
  res.json(list);
});

app.post('/api/prompts', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const text = req.body.text || '';
  const { sanitized } = await sanitizeComment(text);
  const { flagged, category } = await moderatePrompt(sanitized);
  if (flagged) {
    res.status(400).json({ error: 'Prompt rejected due to policy violation.' });
    return;
  }
  const created = new Date().toISOString();
  const ref = await prompts.add({ text: sanitized, category, created, flagged });
  res.status(201).json({ id: ref.id, text: sanitized, category, created, flagged });
});

app.get('/api/pairs', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const snap = await pairs.get();
  const list = [];
  snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
  res.json(list);
});

app.post('/api/pairs', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const pair = { bad: req.body.bad || '', good: req.body.good || '' };
  const ref = await pairs.add(pair);
  res.status(201).json({ id: ref.id, ...pair });
});

app.get('/api/darts', (req, res) => {
  const rounds = loadDartRounds();
  res.json(rounds);
});

app.get('/api/badges', (req, res) => {
  res.json(BADGES);
});

app.get('/api/views', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const snap = await views.get();
  const list = [];
  snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
  res.json(list);
});

app.post('/api/views', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const view = {
    visitorId: req.body.visitorId || null,
    user: req.body.user || null,
    path: req.body.path || '',
    referrer: req.body.referrer || req.headers.referer || '',
    agent: req.body.agent || req.headers['user-agent'] || '',
    ip: req.ip,
    start: new Date().toISOString(),
  };
  const ref = await views.add(view);
  res.status(201).json({ id: ref.id, ...view });
});

app.post('/api/views/:id/end', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const ref = views.doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) {
    res.status(404).end();
    return;
  }
  const view = snap.data();
  const end = new Date().toISOString();
  const duration = Number(view.duration || Date.now() - new Date(view.start).getTime());
  await ref.update({ end, duration });
  res.json({ id: ref.id, ...view, end, duration });
});

app.get('/api/scores', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const snap = await scores.get();
  const data = {};
  snap.forEach(doc => (data[doc.id] = doc.data().entries || []));
  // Ensure all known games exist in the response
  const allGames = ['tone', 'quiz', 'darts', 'recipe', 'escape', 'compose'];
  allGames.forEach(g => {
    if (!data[g]) data[g] = [];
  });
  res.json(data);
});

app.post('/api/scores/:game', async (req, res) => {
  if (!ensureFirestore(res)) return;
  const game = req.params.game;
  const score = Number(req.body.score);
  if (!Number.isFinite(score) || score < 0) {
    res.status(400).json({ error: 'Invalid score' });
    return;
  }
  const docRef = scores.doc(game);
  const snap = await docRef.get();
  let entries = snap.exists ? snap.data().entries || [] : [];
  const name = req.body.name || 'Anonymous';
  const id = req.body.id || '';
  const existingIndex = entries.findIndex(e => e.id === id);

  if (existingIndex === -1) {
    entries.push({ id, name, score });
  } else if (score > entries[existingIndex].score) {
    entries[existingIndex].score = score;
  }

  entries.sort((a, b) => b.score - a.score);
  entries = entries.slice(0, 10);

  await docRef.set({ entries });
  res.json(entries);
});

if (require.main === module) {
  logEnvVars();
  const next = require('next');
  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = next({ dev, dir: path.join(__dirname, '../nextjs-app') });
  const handle = nextApp.getRequestHandler();

  nextApp.prepare().then(() => {
    app.all('*', (req, res) => handle(req, res));
    app.listen(PORT, () => {
      console.log(`Server and Next.js listening on port ${PORT}`);
    });
  });
} else {
  // Serve a friendly 404 page for any unknown route when running only the API
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
  });
}

module.exports = app;
