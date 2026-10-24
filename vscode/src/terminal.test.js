'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { terminalEnvironment, terminalLaunch } = require('./terminal');

test('Windows compatibility output preserves the selected kubeconfig', () => {
  assert.deepEqual(terminalEnvironment('win32', true, 'C:\\cluster configs\\prod.yaml'), {
    TCELL_TRUECOLOR: 'disable', RUNEWIDTH_EASTASIAN: '0', KUBECONFIG: 'C:\\cluster configs\\prod.yaml'
  });
});

test('other platforms preserve color settings and Windows full color overrides inherited disable', () => {
  assert.deepEqual(terminalEnvironment('linux', true, ''), {});
  assert.deepEqual(terminalEnvironment('darwin', true, ''), {});
  assert.deepEqual(terminalEnvironment('win32', false, ''), { TCELL_TRUECOLOR: 'enable', RUNEWIDTH_EASTASIAN: '0' });
});

test('Windows launch selects UTF-8 before K9s and treats paths and contexts as literal arguments', () => {
  const launch = terminalLaunch('win32', "C:\\한글 폴더\\it's\\k9s.exe", "ctx'; $(exit); 'x", 'C:\\Windows');
  const script = Buffer.from(launch.shellArgs[3], 'base64').toString('utf16le');
  assert.equal(launch.shellPath, 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe');
  assert.ok(script.indexOf('[Console]::OutputEncoding = $utf8') < script.indexOf('& '));
  assert.ok(script.includes("& 'C:\\한글 폴더\\it''s\\k9s.exe' '--context' 'ctx''; $(exit); ''x'"));
  assert.ok(script.endsWith('exit $LASTEXITCODE'));
});

test('non-Windows launch executes K9s directly', () => {
  assert.deepEqual(terminalLaunch('linux', '/usr/bin/k9s', 'production'), {
    shellPath: '/usr/bin/k9s', shellArgs: ['--context', 'production']
  });
});
