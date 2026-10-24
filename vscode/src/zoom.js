'use strict';

// Shared by the webview and tests. A burst can change only one font-size step;
// discard momentum during the cooldown instead of replaying it later.
function createWheelZoom() {
  let accumulated = 0;
  let previousTime = -Infinity;
  let lastStepTime = -Infinity;
  return (deltaY, deltaMode, now) => {
    if (!Number.isFinite(deltaY) || deltaY === 0) return 0;
    const delta = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 120 : 1);
    if (now - previousTime > 250 || Math.sign(delta) !== Math.sign(accumulated)) accumulated = 0;
    previousTime = now;
    if (now - lastStepTime < 180) return 0;
    accumulated += delta;
    if (Math.abs(accumulated) < 120) return 0;
    const step = accumulated < 0 ? 1 : -1;
    accumulated = 0;
    lastStepTime = now;
    return step;
  };
}

module.exports = { createWheelZoom };
