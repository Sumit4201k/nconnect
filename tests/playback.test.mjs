import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoClock, phaseAt, themeFromQuery, completionPercent } from '../dist/model.js';

test('playback lasts exactly 20 seconds regardless of frame cadence', () => {
  const clock = new DemoClock(); clock.play(700);
  clock.tick(1731); clock.tick(15029); clock.tick(20700);
  assert.equal(clock.elapsed, 20000); assert.equal(clock.running, false);
  clock.tick(50000); assert.equal(clock.elapsed, 20000);
});
test('pause freezes playback; resume excludes time spent paused', () => {
  const clock = new DemoClock(); clock.play(1000); clock.pause(5500);
  clock.tick(50000); assert.equal(clock.elapsed, 4500);
  clock.play(50000); clock.tick(52000); assert.equal(clock.elapsed, 6500);
});
test('seeking during playback retains its running state and new position', () => {
  const clock = new DemoClock(); clock.play(0); clock.seek(12000, 1000);
  clock.tick(2000); assert.equal(clock.elapsed, 13000);
  clock.seek(20000, 2000); assert.equal(clock.running, false);
  clock.play(9000); assert.equal(clock.elapsed, 0);
  clock.tick(10000); assert.equal(clock.elapsed, 1000);
});
test('phase transitions expose design before build and result after build', () => {
  assert.equal(phaseAt(0).stage, 'plan');
  assert.equal(phaseAt(3000).stage, 'design');
  assert.equal(phaseAt(7000).stage, 'handoff');
  assert.equal(phaseAt(11000).stage, 'build');
  assert.equal(phaseAt(16000).stage, 'preview');
  assert.equal(phaseAt(20000).stage, 'preview');
});
test('untrusted recipe themes fall back to safe defaults', () => {
  assert.equal(themeFromQuery('?theme=lilac'), 'lilac');
  assert.equal(themeFromQuery('?theme=%3Cscript%3E'), 'sage');
  assert.equal(themeFromQuery('?theme=unknown'), 'sage');
  assert.equal(themeFromQuery(''), 'sage');
});
test('habit progress responds consistently to every toggle', () => {
  assert.equal(completionPercent([true, true, false, false]), 71);
  assert.equal(completionPercent([true, true, true, false]), 75);
  assert.equal(completionPercent([true, true, true, true]), 79);
  assert.equal(completionPercent([false, false, false, false]), 63);
});
