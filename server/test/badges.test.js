process.env.USE_LOCAL_STORE = 'true';
const request = require('supertest');
const app = require('../index');
const { test } = require('node:test');
const assert = require('node:assert/strict');

test('returns badges list', async () => {
  const res = await request(app).get('/api/badges');
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
  assert.ok(res.body[0].id);
});
