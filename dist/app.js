import { DURATION, THEMES, DemoClock, phaseAt, themeFromQuery, completionPercent } from './model.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const clock = new DemoClock();
const stage = $('#preview-stage');
const timeline = $('#timeline');
const playButton = $('#play-button');
const dialog = $('#share-dialog');
const habits = [true, true, false, false];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let started = false;
let before = false;
let theme = themeFromQuery(location.search);
let frame = 0;
let previousStage = '';
let toastTimer;

const nodeDetails = [
  ['Every creation starts with an idea.', 'Our example: a habit tracker that makes small wins feel good. This is a scripted frontend concept, not an AI generation request.'],
  ['OpenDots is the coworker at the center.', 'Its workspace idea brings the brief, tools, and project together. Here, Dot’s conversation is an illustrative sequence.', 'https://github.com/CopilotKit/OpenDots', 'Explore OpenDots'],
  ['Stitch is the design step.', 'The canvas illustrates a possible Stitch handoff. No Stitch service is connected; copy the brief from “Share the idea” to try it yourself.', 'https://stitch.withgoogle.com/', 'Explore Stitch'],
  ['Your coding harness builds the interface.', 'It uses the design as context, writes frontend code, and runs tools. The build shown here is a visual sequence.'],
  ['An idea you can interact with.', 'This frontend is real: check a habit, update the weekly progress, or remix the colors. Example data stays in this page.'],
  ['NConnect connects the coding harness to open models.', 'It routes supported harnesses to Nebius inference. Tool execution stays with the harness; Stitch uses its own design service.', 'https://nconnect.sh/', 'Try NConnect'],
];

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4200);
}
function scrollToDemo() {
  $('#demo').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
}
function setBefore(value) {
  before = value;
  stage.classList.toggle('show-before', value);
  $('#tab-before').classList.toggle('active', value);
  $('#tab-result').classList.toggle('active', !value);
  $('#tab-before').setAttribute('aria-pressed', String(value));
  $('#tab-result').setAttribute('aria-pressed', String(!value));
  render();
}
function render() {
  const phase = phaseAt(clock.elapsed);
  const finished = started && clock.elapsed >= DURATION;
  const stageName = !started ? 'ready' : finished ? 'complete' : phase.stage;
  stage.dataset.stage = stageName;
  stage.style.setProperty('--build-progress', String(Math.min(1, Math.max(0, (clock.elapsed - 11000) / 5000))));
  timeline.value = String(clock.elapsed / 1000);
  timeline.style.setProperty('--progress', `${clock.elapsed / DURATION * 100}%`);
  timeline.setAttribute('aria-valuetext', `${(clock.elapsed / 1000).toFixed(1)} seconds of 20`);
  $('#time-current').textContent = `0:${String(Math.floor(clock.elapsed / 1000)).padStart(2, '0')}`;
  playButton.setAttribute('aria-label', clock.running ? 'Pause demo' : finished ? 'Replay workflow' : 'Play workflow');
  playButton.innerHTML = clock.running ? '<svg class="icon filled" viewBox="0 0 24 24"><rect x="7" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : '<svg class="icon filled"><use href="#i-play"/></svg>';
  $('#playback-label').textContent = !started ? 'An idea in motion' : finished ? 'Your turn. Make it yours.' : clock.running ? phase.title : 'Paused · take your time';
  $('#preview-caption').textContent = before ? 'Before: one blank canvas' : !started ? 'A glimpse of what’s possible' : finished ? 'Try it. It’s interactive.' : phase.title;
  const interactive = !before && (!started || clock.elapsed >= 16000);
  $('#habit-app').inert = !interactive;
  $('#habit-app').setAttribute('aria-hidden', String(before || stageName === 'plan'));
  if (previousStage !== stageName) {
    previousStage = stageName;
    if (started) {
      $('#dot-state').textContent = phase.state;
      $('#dot-message').textContent = phase.message;
      $('#phase-note-text').textContent = phase.note;
      $$('#task-list > div').forEach((item, index) => {
        const done = finished || index < phase.task;
        item.classList.toggle('done', done);
        item.classList.toggle('active', !finished && index === phase.task);
        item.querySelector('.task-indicator').textContent = done ? '✓' : String(index + 1);
      });
      $$('[data-node]').forEach(node => node.classList.toggle('active', phase.nodes.includes(Number(node.dataset.node))));
    }
    if (finished) toast('Your idea is ready. Check a habit or remix the look.');
  }
}
function animate(now) {
  clock.tick(now);
  render();
  if (clock.running) frame = requestAnimationFrame(animate);
}
function play({ restart = false } = {}) {
  cancelAnimationFrame(frame);
  started = true;
  setBefore(false);
  if (restart) clock.restart(performance.now());
  else clock.play(performance.now());
  render();
  frame = requestAnimationFrame(animate);
}
function pause() {
  cancelAnimationFrame(frame);
  clock.pause(performance.now());
  render();
}
function seek(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 20) throw new Error('Choose a position from 0 to 20 seconds.');
  started = true;
  clock.seek(seconds * 1000, performance.now());
  setBefore(false);
}

playButton.addEventListener('click', () => clock.running ? pause() : play());
$('#replay-button').addEventListener('click', () => play({ restart: true }));
timeline.addEventListener('input', event => seek(Number(event.target.value)));
$('#tab-before').addEventListener('click', () => { if (clock.running) pause(); setBefore(true); });
$('#tab-result').addEventListener('click', () => setBefore(false));
document.addEventListener('visibilitychange', () => { if (document.hidden && clock.running) pause(); });

function updateHabits() {
  $$('.habit-row').forEach((row, index) => {
    row.classList.toggle('checked', habits[index]);
    row.setAttribute('aria-pressed', String(habits[index]));
    row.querySelector('.habit-check').textContent = habits[index] ? '✓' : '';
  });
  const count = habits.filter(Boolean).length;
  $('#habit-count').textContent = `${count} / 4`;
  $('#week-score').innerHTML = `${completionPercent(habits)}<span>%</span>`;
  $('#today-bar').style.setProperty('--bar', `${count / 4 * 100}%`);
  $('.bar-chart').setAttribute('aria-label', `Example weekly completion: ${completionPercent(habits)} percent. Today: ${count} of 4 habits.`);
}
$$('.habit-row').forEach((row, index) => row.addEventListener('click', () => {
  habits[index] = !habits[index];
  updateHabits();
  if (habits.every(Boolean)) toast('Four little wins. That’s a good day.');
}));
$('#try-habits').addEventListener('click', () => {
  const next = $$('.habit-row').find(row => row.getAttribute('aria-pressed') === 'false') || $('.habit-row');
  next.focus();
  toast('Check a habit to see your weekly progress change.');
});

function describeNode(index) {
  const detail = nodeDetails[index];
  if (!detail) return;
  const p = $('#node-description p');
  p.replaceChildren();
  const strong = document.createElement('strong'); strong.textContent = detail[0];
  p.append(strong, ` ${detail[1]} `);
  if (detail[2]) {
    const link = document.createElement('a');
    link.href = detail[2]; link.target = '_blank'; link.rel = 'noreferrer';
    link.textContent = `${detail[3]} ↗`; link.style.textDecoration = 'underline';
    p.append(link);
  }
  $$('[data-node]').forEach(node => {
    const selected = Number(node.dataset.node) === index;
    node.classList.toggle('selected', selected);
    node.setAttribute('aria-pressed', String(selected));
  });
}
$$('[data-node]').forEach(node => node.addEventListener('click', () => describeNode(Number(node.dataset.node))));

function setExpanded(expanded) {
  $('#studio').classList.toggle('expanded', expanded);
  document.body.classList.toggle('demo-expanded', expanded);
  $('#expand').setAttribute('aria-label', expanded ? 'Exit expanded demo' : 'Expand demo');
  $('#expand').setAttribute('aria-pressed', String(expanded));
}
$('#expand').addEventListener('click', () => setExpanded(!$('#studio').classList.contains('expanded')));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dialog.open) setExpanded(false);
});

function setTheme(next) {
  if (!THEMES.includes(next)) throw new Error('Unknown theme. Choose sage, lilac, or peach.');
  theme = next;
  $('#habit-app').dataset.theme = theme;
  const url = new URL(location.href);
  url.searchParams.set('theme', theme);
  history.replaceState(null, '', url);
}
$('#remix-button').addEventListener('click', () => {
  pause();
  seek(20);
  setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]);
  scrollToDemo();
  toast(`A little ${theme} remix. Same idea, a new feeling.`);
});

function shareUrl() {
  const url = new URL(location.origin + location.pathname);
  url.searchParams.set('theme', theme);
  url.hash = 'demo';
  return url.href;
}
function isLocalPreview() { return ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.protocol === 'file:'; }
$('#share-button').addEventListener('click', () => {
  if (clock.running) pause();
  $('#share-local-note').textContent = isLocalPreview() ? 'This is a local preview. Its link works on this computer; download the card to share anywhere.' : 'Your share link preserves the color remix. No accounts, private data, or automatic posting.';
  dialog.showModal();
});
$('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
async function copyText(text, successMessage) {
  try {
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard unavailable')), 1200)),
    ]);
    toast(successMessage);
  }
  catch {
    const field = document.createElement('textarea'); field.value = text;
    field.setAttribute('aria-label', 'Text to copy'); field.style.cssText = 'position:fixed;left:0;top:0;opacity:0';
    (dialog.open ? dialog : document.body).append(field); field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* Manual copy remains available below. */ }
    field.remove();
    if (copied) toast(successMessage);
    else {
      const manual = document.createElement('textarea'); manual.value = text;
      manual.setAttribute('aria-label', 'Select and copy this text');
      manual.style.cssText = 'width:100%;min-height:85px;margin-top:15px;padding:10px;border:1px solid #cad5b6;border-radius:6px';
      $('#share-local-note').replaceChildren(document.createTextNode('Select and copy below. Local links work on this computer.'), manual);
      manual.focus(); manual.select();
    }
  }
}
$('#copy-link').addEventListener('click', () => copyText(shareUrl(), isLocalPreview() ? 'Local preview link copied.' : 'Demo link copied. Pass it on.'));
$('#copy-recipe').addEventListener('click', () => copyText(`OpenDots × NConnect — Idea to interface\n\nFrontend concept demo: ${shareUrl()}\n\nStitch design brief:\nCreate a calm habit tracker called habitual. Use a ${theme} palette, warm off-white surfaces, thoughtful typography, a daily habit checklist, and a weekly progress chart. Show four habits: A moment outside, Drink more water, Read a few pages, and Move a little. Include responsive mobile and desktop views.\n\nWorkflow concept: OpenDots prepares the brief → Stitch provides the design → a coding harness uses NConnect for open-model inference → interactive frontend.\n\nThis is an illustrative frontend demo, not a recorded or live integration.\nExplore NConnect: https://nconnect.sh/\nExplore OpenDots: https://github.com/CopilotKit/OpenDots`, 'Idea and Stitch brief copied.'));

function roundRect(ctx, x, y, width, height, radius, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.fill();
}
function downloadCard() {
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) { toast('Your browser could not create the image. Try copying the demo link.'); return; }
  const colors = { sage: ['#e3ebcf', '#758760'], lilac: ['#eee5f4', '#947ba7'], peach: ['#f4e5d5', '#be8e69'] }[theme];
  ctx.fillStyle = '#f7f8f2'; ctx.fillRect(0, 0, 1200, 630);
  roundRect(ctx, 36, 36, 1128, 558, 26, colors[0]);
  ctx.fillStyle = '#31432f'; ctx.font = 'bold 17px sans-serif'; ctx.fillText('OPENDOTS  ×  NCONNECT', 78, 90);
  ctx.font = 'bold 54px sans-serif'; ctx.fillText('One idea.', 78, 193); ctx.fillText('Your AI coworker', 78, 258);
  ctx.fillStyle = colors[1]; ctx.font = 'italic 58px Georgia'; ctx.fillText('brings it to life.', 78, 326);
  ctx.fillStyle = '#738164'; ctx.font = '18px sans-serif'; ctx.fillText('OpenDots coordinates. Stitch designs.', 80, 391); ctx.fillText('NConnect connects open models.', 80, 418);
  roundRect(ctx, 701, 113, 403, 363, 18, '#fffdf7');
  ctx.fillStyle = '#374733'; ctx.font = 'bold 23px sans-serif'; ctx.fillText('✳ habitual.', 726, 158);
  ctx.font = '28px Georgia'; ctx.fillText('Make room for better days.', 726, 209);
  const labels = ['A moment outside', 'Drink more water', 'Read a few pages', 'Move a little'];
  labels.forEach((label, i) => {
    roundRect(ctx, 725, 234 + i * 49, 353, 39, 8, i < 2 ? colors[0] : '#f5f6ef');
    ctx.fillStyle = '#536347'; ctx.font = '15px sans-serif'; ctx.fillText(label, 743, 259 + i * 49);
    ctx.beginPath(); ctx.arc(1055, 254 + i * 49, 9, 0, Math.PI * 2); ctx.strokeStyle = colors[1]; ctx.stroke();
    if (habits[i]) { ctx.fillStyle = colors[1]; ctx.fill(); ctx.fillStyle = 'white'; ctx.font = '12px sans-serif'; ctx.fillText('✓', 1050, 258 + i * 49); }
  });
  ctx.strokeStyle = '#75876040'; ctx.beginPath(); ctx.moveTo(78, 518); ctx.lineTo(1120, 518); ctx.stroke();
  ctx.fillStyle = '#697957'; ctx.font = '14px sans-serif'; ctx.fillText('FRONTEND CONCEPT  ·  REMIX THE POSSIBILITY', 78, 557);
  ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = '#31432f'; ctx.fillText('nconnect.sh ↗', 950, 558);
  canvas.toBlob(blob => {
    if (!blob) { toast('Image export failed. Please try again.'); return; }
    const previousLink = $('#save-card-link');
    if (previousLink) { URL.revokeObjectURL(previousLink.href); previousLink.remove(); }
    const url = URL.createObjectURL(blob);
    const previewImage = document.createElement('img');
    previewImage.src = url; previewImage.alt = `OpenDots and NConnect concept share card in ${theme}`;
    previewImage.style.cssText = 'display:block;width:100%;height:auto;border-radius:8px';
    $('.share-preview').replaceChildren(previewImage);
    $('.share-preview').style.cssText = 'padding:0;background:transparent;aspect-ratio:auto';
    const link = document.createElement('a'); link.id = 'save-card-link'; link.href = url;
    link.download = `opendots-nconnect-${theme}.png`; link.className = 'button button-light';
    link.textContent = 'Save PNG ↓'; link.style.cssText = 'width:100%;margin-top:12px';
    $('.dialog-actions').after(link);
    link.focus();
    toast('Your card is ready. Choose Save PNG.');
  }, 'image/png');
}
$('#download-card').addEventListener('click', downloadCard);

function stateSnapshot() { return { elapsedSeconds: Number((clock.elapsed / 1000).toFixed(2)), durationSeconds: 20, playing: clock.running, stage: stage.dataset.stage, theme, completedHabits: habits.filter(Boolean).length, mode: 'frontend-concept' }; }
function registerTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const tools = [
    { name: 'read_demo_state', title: 'Read demo state', description: 'Read the visible OpenDots concept demo playback and color state.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: () => stateSnapshot() },
    { name: 'control_demo', title: 'Control demo playback', description: 'Play, pause, restart, or seek the visible 20-second frontend concept. Does not call an AI service.', inputSchema: { type: 'object', properties: { action: { type: 'string', enum: ['play', 'pause', 'restart', 'seek'] }, seconds: { type: 'number', minimum: 0, maximum: 20 } }, required: ['action'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: input => {
      if (!input || typeof input !== 'object' || !['play', 'pause', 'restart', 'seek'].includes(input.action)) throw new Error('Invalid playback action.');
      if (Object.keys(input).some(key => !['action', 'seconds'].includes(key))) throw new Error('Unknown parameter.');
      if (input.action === 'seek') { if (typeof input.seconds !== 'number' || input.seconds < 0 || input.seconds > 20 || !Number.isFinite(input.seconds)) throw new Error('Seek requires seconds from 0 to 20.'); seek(input.seconds); }
      else if (input.action === 'pause') pause();
      else play({ restart: input.action === 'restart' });
      return stateSnapshot();
    } },
  ];
  for (const tool of tools) {
    try { Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); }
    catch { /* Optional browser capability; the visible controls remain available. */ }
  }
  addEventListener('pagehide', () => lifecycle.abort(), { once: true });
}

$('#habit-app').dataset.theme = theme;
updateHabits();
render();
registerTools();

// Start the workflow once when the viewer reaches it. Respect reduced motion.
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      if (!started) play({ restart: true });
      reveal.disconnect();
    }
  }, { threshold: 0.35 });
  reveal.observe($('#preview-stage'));
}
