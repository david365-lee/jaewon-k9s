'use strict';

const path = require('node:path');

function terminalEnvironment(platform, compatibilityMode, kubeconfig) {
  const env = {};
  // K9s 0.51's derailed/tcell Windows backend selects console API output
  // instead of VT cursor/color output when truecolor is disabled.
  if (platform === 'win32') {
    env.TCELL_TRUECOLOR = compatibilityMode ? 'disable' : 'enable';
    env.RUNEWIDTH_EASTASIAN = '0';
  }
  if (kubeconfig) env.KUBECONFIG = kubeconfig;
  return env;
}

function terminalLaunch(platform, k9sPath, contextName, systemRoot = process.env.SystemRoot || 'C:\\Windows') {
  const args = ['--context', contextName];
  if (platform !== 'win32') return { shellPath: k9sPath, shellArgs: args };

  // TERM does not change the Windows console code page. CP949 can treat box
  // drawing characters as double-width while tcell places them one cell apart.
  const literal = value => "'" + value.replace(/'/g, "''") + "'";
  const script = [
    '$utf8 = New-Object System.Text.UTF8Encoding($false)',
    '[Console]::InputEncoding = $utf8',
    '[Console]::OutputEncoding = $utf8',
    `& ${[k9sPath, ...args].map(literal).join(' ')}`,
    'exit $LASTEXITCODE'
  ].join('\r\n');
  return {
    shellPath: path.win32.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'),
    shellArgs: ['-NoLogo', '-NoProfile', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')]
  };
}

module.exports = { terminalEnvironment, terminalLaunch };
