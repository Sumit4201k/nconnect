export const DURATION = 20_000;
export const THEMES = ['sage', 'lilac', 'peach'];
export const PHASES = [
  { start: 0, end: 3000, stage: 'plan', task: 0, nodes: [0, 1], title: 'Shaping the idea', state: 'A LITTLE DIRECTION', message: 'A calm place for your little wins. A weekly view. And room to feel good about showing up.', note: 'OpenDots · turning the idea into a brief' },
  { start: 3000, end: 7000, stage: 'design', task: 1, nodes: [1, 2], title: 'Designing the everyday', state: 'MEET THE DESIGN', message: 'This is the Stitch design step: warm colors, thoughtful details, and a clear space for every habit.', note: 'Stitch · an illustrated design step' },
  { start: 7000, end: 11000, stage: 'handoff', task: 2, nodes: [2, 3], title: 'From canvas to code', state: 'CONNECTING THE DOTS', message: 'The design becomes the coding brief. The layout, the colors, the little interactions — all in one handoff.', note: 'Design handoff · one idea, kept intact' },
  { start: 11000, end: 16000, stage: 'build', task: 3, nodes: [3, 5], title: 'Open models. Open possibilities.', state: 'THE NCONNECT MOMENT', message: 'The harness does the coding. NConnect connects it to open-model inference. Same workflow, a different engine.', note: 'NConnect · connecting the harness to open models' },
  { start: 16000, end: DURATION, stage: 'preview', task: 4, nodes: [1, 4], title: 'Your little idea, brought to life', state: 'YOUR TURN NOW', message: 'There it is. A little more everyday joy. Check a habit, watch your progress change, and make this look your own.', note: 'The result · a frontend you can actually play with' },
];

export function phaseAt(ms) {
  const safe = Number.isFinite(ms) ? Math.max(0, Math.min(ms, DURATION)) : 0;
  return PHASES.find(phase => safe < phase.end) || PHASES.at(-1);
}
export function themeFromQuery(search) {
  const theme = new URLSearchParams(search).get('theme');
  return THEMES.includes(theme) ? theme : 'sage';
}
export function completionPercent(habits) {
  // Historical example data: 15 of 20 opportunities, plus today's four.
  return Math.round((15 + habits.filter(Boolean).length) / 24 * 100);
}
export class DemoClock {
  elapsed = 0;
  running = false;
  anchor = 0;
  play(now) {
    if (this.running) return;
    if (this.elapsed >= DURATION) this.elapsed = 0;
    this.anchor = now - this.elapsed;
    this.running = true;
  }
  tick(now) {
    if (this.running) {
      this.elapsed = Math.max(0, Math.min(DURATION, now - this.anchor));
      if (this.elapsed === DURATION) this.running = false;
    }
    return this.elapsed;
  }
  pause(now) { this.tick(now); this.running = false; }
  seek(ms, now) {
    if (!Number.isFinite(ms)) throw new TypeError('Timeline position must be finite.');
    this.elapsed = Math.max(0, Math.min(DURATION, ms));
    this.anchor = now - this.elapsed;
    if (this.elapsed === DURATION) this.running = false;
  }
  restart(now) { this.elapsed = 0; this.running = false; this.play(now); }
}
