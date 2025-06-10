process.env.USE_LOCAL_STORE = 'false';
const request = require('supertest');
const app = require('../index');
const { test } = require('node:test');
const assert = require('node:assert/strict');

test('returns 503 when firestore missing and local store disabled', async () => {
  const res = await request(app).get('/api/user');
  assert.equal(res.statusCode, 503);
});
