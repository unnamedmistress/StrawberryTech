const request = require('supertest');
const app = require('../index');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

beforeEach(() => {
  // no-op; express app uses in-memory store when firestore is disabled
});

test('accepts valid score', async () => {
  const res = await request(app)
    .post('/api/scores/test')
    .send({ id: 'alice-id', name: 'Alice', score: 5 });
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body[0].score, 5);
});

test('rejects invalid score', async () => {
  const res = await request(app)
    .post('/api/scores/test')
    .send({ id: 'bob', name: 'Bob', score: -1 });
  assert.equal(res.statusCode, 400);
});
