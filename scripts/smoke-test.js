const assert = require('node:assert/strict');
const base = process.env.STAGING_URL || 'http://127.0.0.1:8080';
async function request(path, options) {
  const response = await fetch(base + path, options);
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return response;
}
async function main() {
  const health = await (await request('/health')).json();
  assert.equal(health.status, 'ok');
  const version = await (await request('/version')).json();
  assert.equal(version.environment, 'staging');
  assert.equal(version.commit, process.env.GIT_COMMIT);
  const html = await (await request('/')).text();
  assert.match(html, /Task Manager/);
  const bundle = html.match(/src="([^"]+\.js)"/);
  assert.ok(bundle, 'Frontend must serve a compiled JavaScript bundle');
  assert.doesNotMatch(html, /src\/main\.jsx/);
  await request(bundle[1]);
  const initial = await (await request('/api/tasks')).json();
  assert.ok(Array.isArray(initial.data));
  let id;
  try {
    const created = await (await request('/api/tasks', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({title: 'CI staging smoke test', status: 'todo', priority: 'low'})
    })).json();
    id = created.data.id;
    const updated = await (await request(`/api/tasks/${id}`, {
      method: 'PATCH', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status: 'done'})
    })).json();
    assert.equal(updated.data.status, 'done');
    const read = await (await request(`/api/tasks/${id}`)).json();
    assert.equal(read.data.status, 'done');
  } finally {
    if (id !== undefined) await request(`/api/tasks/${id}`, {method: 'DELETE'});
  }
  console.log('PASS staging: health, deployed commit, compiled frontend, bundle, API and CRUD');
}
main().catch(error => {console.error(error); process.exitCode = 1;});
