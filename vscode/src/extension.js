'use strict';

const vscode = require('vscode');
const { execFile } = require('node:child_process');
const { createContextQuickPickItems, parseContexts } = require('./context');
const { terminalEnvironment, terminalLaunch } = require('./terminal');

const messages = {
  en: {
    local: 'Local',
    remote: 'Remote',
    context: 'Search local or remote Kubernetes contexts',
    current: 'current context',
    noServer: 'API server not declared',
    noContexts: 'No Kubernetes contexts were found. Configure kubectl or set jaewonK9s.kubeconfig.',
    readError: 'Unable to read Kubernetes contexts',
    k9sError: 'K9s could not be started from',
    installK9s: 'Install K9s or set jaewonK9s.k9sPath.',
    zoomError: 'Open a K9s terminal before using terminal zoom commands.'
  },
  ko: {
    local: '로컬',
    remote: '원격',
    context: '로컬·원격 Kubernetes 컨텍스트 검색',
    current: '현재 컨텍스트',
    noServer: 'API 서버 주소 없음',
    noContexts: 'Kubernetes 컨텍스트가 없습니다. kubectl을 구성하거나 jaewonK9s.kubeconfig를 설정하세요.',
    readError: 'Kubernetes 컨텍스트를 읽을 수 없습니다',
    k9sError: 'K9s를 시작할 수 없습니다:',
    installK9s: 'K9s를 설치하거나 jaewonK9s.k9sPath를 설정하세요.',
    zoomError: '터미널 확대/축소 명령을 사용하기 전에 K9s 터미널을 여세요.'
  },
  ja: {
    local: 'ローカル',
    remote: 'リモート',
    context: 'ローカル・リモート Kubernetes コンテキストを検索',
    current: '現在のコンテキスト',
    noServer: 'API サーバーが未指定',
    noContexts: 'Kubernetes コンテキストがありません。kubectl または jaewonK9s.kubeconfig を設定してください。',
    readError: 'Kubernetes コンテキストを読み込めません',
    k9sError: 'K9s を起動できません:',
    installK9s: 'K9s をインストールするか jaewonK9s.k9sPath を設定してください。',
    zoomError: 'ターミナルのズームコマンドを使う前に K9s ターミナルを開いてください。'
  },
  'zh-cn': {
    local: '本地',
    remote: '远程',
    context: '搜索本地或远程 Kubernetes 上下文',
    current: '当前上下文',
    noServer: '未声明 API 服务器',
    noContexts: '未找到 Kubernetes 上下文。请配置 kubectl 或 jaewonK9s.kubeconfig。',
    readError: '无法读取 Kubernetes 上下文',
    k9sError: '无法从以下路径启动 K9s：',
    installK9s: '请安装 K9s 或设置 jaewonK9s.k9sPath。',
    zoomError: '请先打开 K9s 终端，再使用终端缩放命令。'
  }
};

function localizedMessages() {
  const locale = vscode.env.language.toLowerCase();
  if (locale.startsWith('ko')) return messages.ko;
  if (locale.startsWith('ja')) return messages.ja;
  if (locale === 'zh-cn' || locale.startsWith('zh-hans')) return messages['zh-cn'];
  return messages.en;
}

function execute(file, args, timeout) {
  return new Promise((resolve, reject) => {
    execFile(file, args, {
      encoding: 'utf8',
      timeout,
      maxBuffer: 1024 * 1024,
      windowsHide: true
    }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || error.message).trim();
        reject(new Error(detail));
        return;
      }
      resolve(stdout);
    });
  });
}

async function listContexts(config) {
  const kubectlPath = config.get('kubectlPath', 'kubectl');
  const kubeconfig = config.get('kubeconfig', '').trim();
  const args = ['config', 'view', '-o', 'json'];
  if (kubeconfig) args.push('--kubeconfig', kubeconfig);
  return parseContexts(await execute(kubectlPath, args, config.get('commandTimeout', 15000)));
}

async function openK9s() {
  const config = vscode.workspace.getConfiguration('jaewonK9s');
  const text = localizedMessages();
  let contexts;
  try {
    contexts = await listContexts(config);
  } catch (error) {
    throw new Error(`${text.readError}: ${error.message}`);
  }
  if (contexts.length === 0) throw new Error(text.noContexts);

  const selected = await vscode.window.showQuickPick(createContextQuickPickItems(contexts, text), {
    placeHolder: text.context,
    matchOnDescription: true,
    matchOnDetail: true
  });
  if (!selected) return;

  const k9sPath = config.get('k9sPath', 'k9s');
  try {
    await execute(k9sPath, ['version'], config.get('commandTimeout', 15000));
  } catch (error) {
    throw new Error(`${text.k9sError} "${k9sPath}": ${error.message}. ${text.installK9s}`);
  }

  const kubeconfig = config.get('kubeconfig', '').trim();
  const terminal = vscode.window.createTerminal({
    name: `Jaewon K9s: ${selected.context.name}`,
    ...terminalLaunch(process.platform, k9sPath, selected.context.name),
    env: terminalEnvironment(process.platform, config.get('windowsConsoleCompatibility', false), kubeconfig)
  });
  terminal.show();
}

async function terminalZoom(command) {
  if (!vscode.window.activeTerminal) {
    throw new Error(localizedMessages().zoomError);
  }
  await vscode.commands.executeCommand(command);
}

function activate(context) {
  const report = fn => async () => {
    try {
      await fn();
    } catch (error) {
      void vscode.window.showErrorMessage(`Jaewon K9s: ${error.message}`);
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('jaewonK9s.open', report(openK9s)),
    vscode.commands.registerCommand('jaewonK9s.zoomIn', report(() => terminalZoom('workbench.action.terminal.fontZoomIn'))),
    vscode.commands.registerCommand('jaewonK9s.zoomOut', report(() => terminalZoom('workbench.action.terminal.fontZoomOut'))),
    vscode.commands.registerCommand('jaewonK9s.zoomReset', report(() => terminalZoom('workbench.action.terminal.fontZoomReset')))
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
