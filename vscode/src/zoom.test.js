'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createWheelZoom } = require('./zoom');

test('small trackpad deltas accumulate before changing font size', () => {
  const wheel = createWheelZoom();
  for (let i = 0; i < 11; i++) assert.equal(wheel(-10, 0, i * 10), 0);
  assert.equal(wheel(-10, 0, 110), 1);
});
test('large deltas and momentum cannot skip multiple sizes', () => {
  const wheel = createWheelZoom();
  assert.equal(wheel(1200, 0, 0), -1);
  assert.equal(wheel(1200, 0, 50), 0);
  assert.equal(wheel(1200, 0, 179), 0);
  assert.equal(wheel(120, 0, 180), -1);
});
test('direction changes and idle gaps discard leftover deltas', () => {
  const wheel = createWheelZoom();
  assert.equal(wheel(-100, 0, 0), 0);
  assert.equal(wheel(30, 0, 10), 0);
  assert.equal(wheel(90, 0, 20), -1);
  assert.equal(wheel(-100, 0, 500), 0);
  assert.equal(wheel(-30, 0, 800), 0);
});
test('line and page deltas normalize to pixels', () => {
  assert.equal(createWheelZoom()(-8, 1, 0), 1);
  assert.equal(createWheelZoom()(1, 2, 0), -1);
  assert.equal(createWheelZoom()(NaN, 0, 0), 0);
});
