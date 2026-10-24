'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createContextQuickPickItems, isLocalContext, parseContexts } = require('./context');

test('classifies known local context names and loopback API endpoints', () => {
  assert.equal(isLocalContext('docker-desktop', 'https://kubernetes.docker.internal:6443'), true);
  assert.equal(isLocalContext('kind-dev', 'https://127.0.0.1:53421'), true);
  assert.equal(isLocalContext('prod', 'https://api.example.net:6443'), false);
});

test('parses contexts, server endpoints, and the active context', () => {
  const contexts = parseContexts(JSON.stringify({
    'current-context': 'docker-desktop',
    clusters: [
      { name: 'local', cluster: { server: 'https://localhost:6443' } },
      { name: 'prod', cluster: { server: 'https://api.example.net' } }
    ],
    contexts: [
      { name: 'docker-desktop', context: { cluster: 'local' } },
      { name: 'production', context: { cluster: 'prod' } }
    ]
  }));

  assert.deepEqual(contexts.map(item => [item.name, item.local, item.current]), [
    ['docker-desktop', true, true],
    ['production', false, false]
  ]);
});

test('reports invalid kubeconfig JSON instead of silently returning no contexts', () => {
  assert.throws(() => parseContexts('{'), /invalid JSON/);
  assert.throws(() => parseContexts('{}'), /valid contexts and clusters/);
});

test('builds one searchable picker entry for each local and remote context', () => {
  const contexts = [
    { name: 'docker-desktop', cluster: 'local', server: 'https://localhost:6443', local: true, current: true },
    { name: 'production', cluster: 'prod', server: 'https://api.example.net', local: false, current: false }
  ];

  const items = createContextQuickPickItems(contexts, {
    local: 'Local',
    remote: 'Remote',
    current: 'Current context',
    noServer: 'API server not declared'
  });

  assert.equal(items.length, 2);
  assert.match(items[0].label, /docker-desktop/);
  assert.equal(items[0].description, 'Local · Current context');
  assert.equal(items[0].detail, 'https://localhost:6443');
  assert.match(items[1].label, /production/);
  assert.equal(items[1].description, 'Remote · prod');
  assert.equal(items[1].detail, 'https://api.example.net');
});
