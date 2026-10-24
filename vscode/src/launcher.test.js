'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

test('launcher serializes wheel steps, validates input and respects workspace settings', async () => {
  let size = 14, receive, dispose;
  const writes = [], messages = [], commands = [];
  const config = {
    get: () => size,
    inspect: () => ({ workspaceValue: size }),
    update: async (key, value, target) => { await new Promise(resolve => setImmediate(resolve)); size = value; writes.push({ key, value, target }); }
  };
  const vscode = {
    env: { language: 'ko' },
    workspace: { getConfiguration: () => config, onDidChangeConfiguration: () => ({ dispose() {} }) },
    ConfigurationTarget: { Global: 1, Workspace: 2, WorkspaceFolder: 3 },
    commands: { executeCommand: async name => commands.push(name) }
  };
  const mod = { exports: {} };
  const localRequire = name => name === 'vscode' ? vscode : name === './zoom' ? require('./zoom') : require(name);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'launcher.js'), 'utf8'), { require: localRequire, module: mod });
  const view = { webview: {
    postMessage: message => messages.push(message),
    onDidReceiveMessage: handler => { receive = handler; return { dispose() {} }; }
  }, onDidDispose: handler => { dispose = handler; } };
  mod.exports.launcherProvider(fn => fn).resolveWebviewView(view);
  assert.match(view.webview.html, /Content-Security-Policy/);
  assert.match(view.webview.html, /passive:false/);
  receive({ type: 'ready' });
  receive({ type: 'step', value: 1 });
  receive({ type: 'step', value: 1 });
  receive({ type: 'step', value: 30 });
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.deepEqual(writes.map(w => w.value), [15, 16]);
  assert.ok(writes.every(w => w.target === 2));
  receive({ type: 'size', value: 1000 });
  receive({ type: 'size', value: 7.5 });
  receive({ type: 'open' });
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(size, 100);
  assert.equal(writes.length, 3);
  assert.deepEqual(commands, ['jaewonK9s.open']);
  assert.equal(messages.at(-1).value, 100);
  dispose();
});
