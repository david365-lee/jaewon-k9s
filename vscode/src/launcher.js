'use strict';
const vscode = require('vscode');
const { randomBytes } = require('node:crypto');
const { createWheelZoom } = require('./zoom');

function launcherProvider(report) {
  return {
    resolveWebviewView(view) {
      const ko = vscode.env.language.startsWith('ko');
      const nonce = randomBytes(16).toString('hex');
      view.webview.options = { enableScripts: true };
      view.webview.html = `<!doctype html><html lang="${ko ? 'ko' : 'en'}"><head>
      <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
      <style nonce="${nonce}">
      body{padding:12px;font-family:var(--vscode-font-family);color:var(--vscode-foreground)}
      button,input{font:inherit}button{cursor:pointer;color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0;padding:6px 10px}
      button:hover{background:var(--vscode-button-hoverBackground)}
      :focus-visible{outline:1px solid var(--vscode-focusBorder);outline-offset:2px}
      #open{width:100%}fieldset{margin:16px 0 0;padding:12px 8px;border:1px solid var(--vscode-panel-border)}
      .row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}input{width:54px;padding:5px;color:var(--vscode-input-foreground);background:var(--vscode-input-background);border:1px solid var(--vscode-input-border,transparent)}
      p{font-size:12px;line-height:1.5;color:var(--vscode-descriptionForeground)}
      </style></head><body>
      <button id="open">${ko ? 'K9s 열기' : 'Open K9s'}</button>
      <fieldset id="zoom" tabindex="0"><legend>${ko ? '터미널 정밀 확대·축소' : 'Precise terminal zoom'}</legend>
      <div class="row"><button id="minus" aria-label="${ko ? '1px 축소' : 'Decrease by 1px'}">−</button>
      <label><input id="size" type="number" min="6" max="100" step="1" aria-label="${ko ? '터미널 글꼴 크기' : 'Terminal font size'}"> px</label>
      <button id="plus" aria-label="${ko ? '1px 확대' : 'Increase by 1px'}">+</button>
      <button id="reset">${ko ? '초기화' : 'Reset'}</button></div>
      <p>${ko ? '이 영역에서 휠을 움직이면 1px씩 조절됩니다. 작은 입력을 누적하고 연속 입력 속도를 제한합니다. 숫자를 입력해 크기를 지정할 수도 있습니다.' : 'Scroll here to adjust by 1px. Small deltas accumulate and rapid bursts are limited. Enter an exact size in the number field.'}</p>
      <p>${ko ? '크기는 VS Code의 모든 통합 터미널에 적용됩니다.' : 'Font size applies to all VS Code integrated terminals.'}</p></fieldset>
      <script nonce="${nonce}">
      const api=acquireVsCodeApi();const wheel=(${createWheelZoom.toString()})();
      const send=(type,value)=>api.postMessage({type,value});
      document.getElementById('open').onclick=()=>send('open');
      document.getElementById('minus').onclick=()=>send('step',-1);
      document.getElementById('plus').onclick=()=>send('step',1);
      document.getElementById('reset').onclick=()=>send('reset');
      const size=document.getElementById('size');
      size.onchange=()=>send('size',Number(size.value));
      // Prevent the number input's native wheel behavior from bypassing the limiter.
      document.getElementById('zoom').addEventListener('wheel',e=>{
        e.preventDefault();e.stopPropagation();
        const step=wheel(e.deltaY,e.deltaMode,performance.now());if(step)send('step',step);
      },{passive:false});
      window.addEventListener('message',e=>{if(e.data.type==='size')size.value=e.data.value;});
      send('ready');
      </script></body></html>`;

      const config = () => vscode.workspace.getConfiguration('terminal.integrated');
      const refresh = () => view.webview.postMessage({ type: 'size', value: config().get('fontSize', 14) });
      let queue = Promise.resolve();
      const messages = view.webview.onDidReceiveMessage(message => {
        if (!message || typeof message !== 'object') return;
        // Serialize font writes so simultaneous messages do not lose steps.
        queue = queue.then(report(async () => {
          if (message.type === 'open') return vscode.commands.executeCommand('jaewonK9s.open');
          if (message.type === 'ready') return refresh();
          if (message.type === 'reset') {
            await vscode.commands.executeCommand('workbench.action.terminal.fontZoomReset');
          } else {
            let size;
            if (message.type === 'step' && [1, -1].includes(message.value)) size = config().get('fontSize', 14) + message.value;
            else if (message.type === 'size' && Number.isInteger(message.value)) size = message.value;
            else return;
            const setting = config().inspect('fontSize');
            const target = setting?.workspaceFolderValue !== undefined ? vscode.ConfigurationTarget.WorkspaceFolder
              : setting?.workspaceValue !== undefined ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
            await config().update('fontSize', Math.max(6, Math.min(100, size)), target);
          }
          await refresh();
        }));
      });
      const changes = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('terminal.integrated.fontSize')) void refresh();
      });
      view.onDidDispose(() => { messages.dispose(); changes.dispose(); });
    }
  };
}

module.exports = { launcherProvider };
