'use strict';

const vscode = require('vscode');
const { execFile } = require('node:child_process');
const { parseContexts } = require('./context');

const messages = {
  en: {
    local: '$(device-desktop) Local cluster',
    localDescription: 'Docker Desktop, Kind, Minikube, localhost API endpoints',
    remote: '$(cloud) Remote / other context',
    remoteDescription: 'Contexts from the host kubeconfig that are not classified as local',
    all: '$(list-unordered) Show all contexts',
    allDescription: 'Choose any context without local/remote filtering',
    mode: 'Choose a local or remote Kubernetes context type',
    context: 'Select a Kubernetes context',
    current: 'current context',
    noContexts: 'No Kubernetes contexts were found. Configure kubectl or set jaewonK9s.kubeconfig.',
    emptyLocal: 'No local contexts were detected. Choose “Show all contexts” or update your kubeconfig.',
    emptyRemote: 'No remote contexts were detected. Choose “Show all contexts” or update your kubeconfig.',
    readError: 'Unable to read Kubernetes contexts',
    k9sError: 'K9s could not be started from',
    installK9s: 'Install K9s or set jaewonK9s.k9sPath.',
    zoomError: 'Open a K9s terminal before using terminal zoom commands.'
  },
  ko: {
    local: '$(device-desktop) 로컬 클러스터',
    localDescription: 'Docker Desktop, Kind, Minikube, localhost API 주소',
    remote: '$(cloud) 원격 / 기타 컨텍스트',
    remoteDescription: '로컬로 분류되지 않은 호스트 kubeconfig 컨텍스트',
    all: '$(list-unordered) 모든 컨텍스트 보기',
    allDescription: '로컬/원격 구분 없이 컨텍스트 선택',
    mode: '로컬 또는 원격 Kubernetes 컨텍스트 유형을 선택하세요',
    context: 'Kubernetes 컨텍스트 선택',
    current: '현재 컨텍스트',
    noContexts: 'Kubernetes 컨텍스트가 없습니다. kubectl을 구성하거나 jaewonK9s.kubeconfig를 설정하세요.',
    emptyLocal: '로컬 컨텍스트가 없습니다. 모든 컨텍스트를 보거나 kubeconfig를 확인하세요.',
    emptyRemote: '원격 컨텍스트가 없습니다. 모든 컨텍스트를 보거나 kubeconfig를 확인하세요.',
    readError: 'Kubernetes 컨텍스트를 읽을 수 없습니다',
    k9sError: 'K9s를 시작할 수 없습니다:',
    installK9s: 'K9s를 설치하거나 jaewonK9s.k9sPath를 설정하세요.',
    zoomError: '터미널 확대/축소 명령을 사용하기 전에 K9s 터미널을 여세요.'
  },
  ja: {
    local: '$(device-desktop) ローカルクラスター',
    localDescription: 'Docker Desktop、Kind、Minikube、localhost API アドレス',
    remote: '$(cloud) リモート / その他のコンテキスト',
    remoteDescription: 'ローカルに分類されないホスト kubeconfig のコンテキスト',
    all: '$(list-unordered) すべてのコンテキストを表示',
    allDescription: 'ローカル/リモートで絞り込まずに選択',
    mode: 'ローカルまたはリモートの Kubernetes コンテキストを選択',
    context: 'Kubernetes コンテキストを選択',
    current: '現在のコンテキスト',
    noContexts: 'Kubernetes コンテキストがありません。kubectl または jaewonK9s.kubeconfig を設定してください。',
    emptyLocal: 'ローカルコンテキストがありません。すべてのコンテキストを表示するか kubeconfig を確認してください。',
    emptyRemote: 'リモートコンテキストがありません。すべてのコンテキストを表示するか kubeconfig を確認してください。',
    readError: 'Kubernetes コンテキストを読み込めません',
    k9sError: 'K9s を起動できません:',
    installK9s: 'K9s をインストールするか jaewonK9s.k9sPath を設定してください。',
    zoomError: 'ターミナルのズームコマンドを使う前に K9s ターミナルを開いてください。'
  },
  'zh-cn': {
    local: '$(device-desktop) 本地集群',
    localDescription: 'Docker Desktop、Kind、Minikube、localhost API 地址',
    remote: '$(cloud) 远程 / 其他上下文',
    remoteDescription: '主机 kubeconfig 中未归类为本地的上下文',
    all: '$(list-unordered) 显示所有上下文',
    allDescription: '不按本地/远程筛选，选择任意上下文',
    mode: '选择本地或远程 Kubernetes 上下文类型',
    context: '选择 Kubernetes 上下文',
    current: '当前上下文',
    noContexts: '未找到 Kubernetes 上下文。请配置 kubectl 或 jaewonK9s.kubeconfig。',
    emptyLocal: '未检测到本地上下文。请显示所有上下文或检查 kubeconfig。',
    emptyRemote: '未检测到远程上下文。请显示所有上下文或检查 kubeconfig。',
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

  const mode = await vscode.window.showQuickPick([
    { label: text.local, description: text.localDescription, value: 'local' },
    { label: text.remote, description: text.remoteDescription, value: 'remote' },
    { label: text.all, description: text.allDescription, value: 'all' }
  ], { placeHolder: text.mode });
  if (!mode) return;

  const filtered = mode.value === 'all' ? contexts : contexts.filter(context => context.local === (mode.value === 'local'));
  if (filtered.length === 0) throw new Error(mode.value === 'local' ? text.emptyLocal : text.emptyRemote);

  const selected = await vscode.window.showQuickPick(filtered.map(context => ({
    label: context.name,
    description: context.current ? text.current : context.cluster,
    detail: context.server || 'API server not declared',
    context
  })), { placeHolder: text.context });
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
    shellPath: k9sPath,
    shellArgs: ['--context', selected.context.name],
    env: kubeconfig ? { KUBECONFIG: kubeconfig } : undefined
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
