import { C, UI, text, textCenter, textWidth, tinyText, hatSprite, wingSprite, keySprite, potionSprite, wrap, box, blob, glow, glyphDots, drawCard, makeScroll, charSprite, drawTile, drawOver, flame, makeCanvas, hash, shade, VALUE_LABEL } from './art.js';
import { MAPS, LOOKS, NPCS, SCRIPT, cardName, decodeWord, VALUE_GRID, CHASED, CLASSES, SKINS, HAIRS, OUCH, GRUDGE, KONAMI, EGG, squawk, QUEST } from './data.js';
import * as Audio from './audio.js';

// The game draws at a low resolution that follows the screen's shape: VW x VH game pixels.
let VW = 160, VH = 144;
// UIB: bottom of the part of the screen that the touch controls don't cover.
let UIB = 144;
// UIX0..UIX1: the free strip between the controls when they sit beside the text box.
let UIX0 = 0, UIX1 = 160;
const screen = document.getElementById('screen');
const ctx = screen.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ================================================================ state
const G = {
  armed: { v: null, s: null }, locked: false, // locked = card came from the URL
  name: '', hero: null, flags: {}, time: 0, fade: null, scene: null,
};
if (window.__force) { G.armed = { ...window.__force }; G.locked = true; }
if (window.__forceWord) { const w = decodeWord(window.__forceWord); if (w) { G.armed = { v: null, s: null, word: w }; G.locked = true; } }
const armedCard = () => ({ v: G.armed.v || 1, s: G.armed.s || 'S' });
const fill = s => s.replace(/\{N\}/g, G.name || 'HERO');

let parts = [];
function setScene(s, ...args) {
  parts = []; G.scene = s;
  // the on-screen controls are used from the name screen onwards
  document.body.classList.toggle('playing', s === Play || s === NameEntry || s === ClassScene);
  measureUI();
  if (s.enter) s.enter(...args);
}
function fadeTo(fn, dur = 0.25) { if (!G.fade) G.fade = { t: 0, dur, out: true, fn }; }

// ================================================================ input
const held = { up: false, down: false, left: false, right: false };
let dirStack = [];
const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
function dirDown(d) {
  if (held[d]) return;
  held[d] = true; dirStack = dirStack.filter(x => x !== d); dirStack.push(d);
  if (!G.fade && G.scene.onDir) G.scene.onDir(d);
}
function dirUp(d) { held[d] = false; dirStack = dirStack.filter(x => x !== d); }
const heldDir = () => dirStack[dirStack.length - 1] || null;
function pressA() { Audio.unlock(); if (!G.fade && G.scene.onA) G.scene.onA(); }
function pressB() { Audio.unlock(); if (!G.fade && G.scene.onB) G.scene.onB(); }

// Keyboard: WASD or arrows to walk; P is A, O is B (Enter and Space also work as A).
const KEY_A = 'p', KEY_B = 'o';
const KEYDIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  Audio.unlock();
  if (G.scene.onKey && !G.fade && G.scene.onKey(e)) { e.preventDefault(); return; }
  const d = KEYDIR[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (d) { e.preventDefault(); if (!e.repeat) dirDown(d); return; }
  if ([KEY_A, ' ', 'enter'].includes(e.key.toLowerCase())) { e.preventDefault(); if (!e.repeat) pressA(); }
  if (e.key.toLowerCase() === KEY_B) { e.preventDefault(); if (!e.repeat) pressB(); }
});
addEventListener('keyup', e => {
  const d = KEYDIR[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (d) dirUp(d);
});
addEventListener('blur', () => { for (const d in held) dirUp(d); });

const pad = document.getElementById('dpad');
let padCur = null;
function padDir(e) {
  const r = pad.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  if (Math.hypot(dx, dy) < r.width * 0.1) return padCur;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}
function setPad(d) {
  if (d === padCur) return;
  if (padCur) dirUp(padCur);
  padCur = d;
  pad.dataset.dir = d || '';
  if (d) dirDown(d);
}
pad.addEventListener('pointerdown', e => { e.preventDefault(); Audio.unlock(); pad.setPointerCapture(e.pointerId); setPad(padDir(e)); });
pad.addEventListener('pointermove', e => { if (padCur) setPad(padDir(e)); });
for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(ev, () => setPad(null));

const btnA = document.getElementById('btnA');
btnA.addEventListener('pointerdown', e => { e.preventDefault(); btnA.classList.add('down'); pressA(); });
for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) btnA.addEventListener(ev, () => btnA.classList.remove('down'));
const btnB = document.getElementById('btnB');
btnA.querySelector('.key').textContent = KEY_A.toUpperCase(); btnB.querySelector('.key').textContent = KEY_B.toUpperCase();
btnA.setAttribute('aria-label', `A button (${KEY_A.toUpperCase()} key)`); btnB.setAttribute('aria-label', `B button (${KEY_B.toUpperCase()} key)`);
btnB.addEventListener('pointerdown', e => { e.preventDefault(); btnB.classList.add('down'); pressB(); });
for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) btnB.addEventListener(ev, () => btnB.classList.remove('down'));

const muteBtn = document.getElementById('mute');
const showMute = () => { muteBtn.classList.toggle('off', Audio.isMuted()); muteBtn.setAttribute('aria-pressed', Audio.isMuted()); };
muteBtn.addEventListener('pointerdown', e => { e.preventDefault(); Audio.unlock(); Audio.toggleMute(); showMute(); });
showMute();

screen.addEventListener('pointerdown', e => {
  e.preventDefault();
  Audio.unlock();
  const r = screen.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * VW, y = (e.clientY - r.top) / r.height * VH;
  if (!G.fade && G.scene.onTap) G.scene.onTap(x, y);
});
document.addEventListener('contextmenu', e => e.preventDefault());
// iOS only counts some events as a gesture that may start audio.
for (const ev of ['touchend', 'click']) document.addEventListener(ev, () => Audio.unlock(), { passive: true });

// Full screen: a whole number of device pixels per game pixel keeps the art crisp,
// with at least 160 game pixels across the short side of the screen.
function layout() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;
  const k = Math.max(1, Math.floor(Math.min(w, h) * dpr / 160));
  VW = Math.ceil(w * dpr / k); VH = Math.ceil(h * dpr / k);
  if (screen.width !== VW || screen.height !== VH) { screen.width = VW; screen.height = VH; }
  ctx.imageSmoothingEnabled = false;
  screen.style.width = (VW * k / dpr) + 'px';
  screen.style.height = (VH * k / dpr) + 'px';
  measureUI();
}
// When the controls sit under the text box (portrait), keep the camera and the
// text box in the space above them.
function measureUI() {
  UIB = VH; UIX0 = 0; UIX1 = VW;
  if (!document.body.classList.contains('playing')) return;
  const a = pad.getBoundingClientRect(), b = btnA.getBoundingClientRect(), bb = btnB.getBoundingClientRect();
  const s = VW / screen.getBoundingClientRect().width;
  if (!a.height) return;
  const x0 = Math.ceil(a.right * s) + 3, x1 = Math.floor(Math.min(b.left, bb.left) * s) - 3;
  if (x1 - x0 >= 170) { UIX0 = x0; UIX1 = x1; } // text box fits between the controls
  else UIB = Math.floor(Math.min(a.top, b.top, bb.top) * s) - 4;
}
addEventListener('resize', layout);
if (window.visualViewport) window.visualViewport.addEventListener('resize', layout);
layout();

// ================================================================ particles
function spark(x, y, n = 6, col = C.gold, world = false) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 20 + Math.random() * 40;
    parts.push({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.4, col, world });
  }
}
function updateParts(dt) {
  for (const p of parts) {
    if (p.k === 'pix' && (p.hold -= dt) <= 0) {
      const a = Math.random() * Math.PI * 2, v = 12 + Math.random() * 30;
      Object.assign(p, { k: 'spark', vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.2 + Math.random() * 0.3, col: '#ffe9a0', world: false });
    }
    p.life -= dt; p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt;
    if (p.k === 'spark') { p.vx *= 0.92; p.vy *= 0.92; }
    if (p.k === 'z' || p.k === 'note') p.x += Math.sin(p.life * 5) * 0.3;
    if (p.k === 'say') { p.vy = (p.vy || -18) * 0.9; }
    if (p.k === 'mote') p.x += Math.sin(p.life * 1.7 + p.p) * 0.15;
  }
  parts = parts.filter(p => p.life > 0);
}
function drawParts(cx = 0, cy = 0) {
  for (const p of parts) {
    const x = Math.round(p.x - (p.world ? cx : 0)), y = Math.round(p.y - (p.world ? cy : 0));
    if (p.k === 'spark') {
      ctx.fillStyle = p.life > 0.25 ? p.col : C.white;
      ctx.fillRect(x, y, 1, 1);
      if (p.life > 0.4) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); }
    } else if (p.k === 'z') text(ctx, 'Z', x, y, C.white);
    else if (p.k === 'note') text(ctx, '♪', x, y, '#ffe9a0');
    else if (p.k === 'wind') { ctx.fillStyle = p.col || 'rgba(255,255,255,0.7)'; ctx.fillRect(x, y, p.len, 1); }
    else if (p.k === 'mote') {
      const b = Math.sin(p.life * 5 + p.p);
      if (b > -0.3) {
        ctx.globalCompositeOperation = 'lighter';
        if (b > 0.5) ctx.drawImage(glow(4, p.col), x - 4, y - 4);
        ctx.fillStyle = p.col; ctx.fillRect(x, y, 1, 1);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    else if (p.k === 'pix') { ctx.fillStyle = '#ffe9a0'; ctx.fillRect(x, y, 1, 1); }
    else if (p.k === 'say') {
      ctx.globalAlpha = Math.min(1, p.life / 0.4);
      tinyText(ctx, p.text, x, y);
      ctx.globalAlpha = 1;
    }
    else if (p.k === 'ring') {
      const r = (1 - p.life / 0.45) * 30;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#ffd27a';
      for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2 + r * 0.05; ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 1, 1); }
      ctx.globalCompositeOperation = 'source-over';
    }
    else if (p.k === 'leaf') { ctx.fillStyle = p.col; ctx.fillRect(x, y, 2, 1); ctx.fillRect(x + (p.life * 4 % 2 > 1 ? 1 : 0), y + 1, 1, 1); }
  }
}

function mote(x, y, world = false) {
  parts.push({ k: 'mote', x, y, vx: (Math.random() - 0.5) * 4, vy: -3 - Math.random() * 5, life: 3 + Math.random() * 3, p: Math.random() * 6, col: Math.random() < 0.55 ? '#7ae0ff' : '#ffd27a', world });
}
// A sky tap: sparkle dots that sit in the number's shape for a split second, then fall
// apart into ordinary tap sparkles (the same as a tap on the grass).
function numberBurst(x, y, v) {
  const dots = glyphDots(String(v)), w = String(v).length * 6 - 1;
  for (const [i, j] of dots) parts.push({ k: 'pix', x: x + (i - w / 2) * 2, y: y + (j - 3.5) * 2, hold: 0.09, life: 1 });
}
// Darkened corners, cached per screen size.
let vig = null;
function drawVignette() {
  if (!vig || vig.width !== VW || vig.height !== VH) {
    const [c, x] = makeCanvas(VW, VH);
    const img = x.createImageData(VW, VH), d = img.data;
    for (let j = 0; j < VH; j++) for (let i = 0; i < VW; i++) {
      const nx = (i + 0.5 - VW / 2) / (VW / 2), ny = (j + 0.5 - VH / 2) / (VH / 2);
      const lvl = Math.max(0, Math.min(4, Math.floor((Math.hypot(nx * 0.85, ny * 0.7) - 0.74) / 0.1) + 1));
      const k = (j * VW + i) * 4;
      d[k] = 8; d[k + 1] = 4; d[k + 2] = 18; d[k + 3] = lvl * 22;
    }
    x.putImageData(img, 0, 0); vig = c;
  }
  ctx.drawImage(vig, 0, 0);
}

// ================================================================ dialog
const D = { active: false, q: [], page: null, shown: 0, t: 0, choice: 0, low: false, onEnd: null, pos: 'auto', name: null };
function dialogW() { return Math.min(UIX1 - UIX0 - 6, 236); }
const dialogX = () => Math.round((UIX0 + UIX1 - dialogW()) / 2);
const dialogChars = () => Math.floor((dialogW() - 16) / 6);
function say(entries, opts = {}) {
  D.q = entries.slice(); D.onEnd = opts.onEnd || null; D.low = !!opts.low; D.pos = opts.pos || 'auto'; D.name = opts.name || null;
  D.active = true; nextPage();
}
function nextPage() {
  D.page = null;
  while (D.q.length && !D.page) {
    const e = D.q.shift();
    if (typeof e === 'string') {
      const lines = wrap(fill(e), dialogChars());
      const pages = [];
      for (let i = 0; i < lines.length; i += 3) pages.push({ lines: lines.slice(i, i + 3) });
      D.page = pages.shift(); D.q.unshift(...pages);
    } else if (e.lines) D.page = e;
    else if (e.ask) { D.page = { lines: wrap(fill(e.ask), dialogChars()).slice(0, 3), ask: e }; D.choice = 0; }
    else if (e.do) e.do();
  }
  if (!D.page) { D.active = false; const f = D.onEnd; D.onEnd = null; if (f) f(); return; }
  D.shown = 0; D.t = 0; D.total = D.page.lines.join('').length;
}
function dialogUpdate(dt) {
  if (!D.active || D.shown >= D.total) return;
  D.t += dt;
  const n = Math.min(D.total, Math.floor(D.t * 48));
  if (Math.floor(n / 2) > Math.floor(D.shown / 2)) Audio.blip(D.low);
  D.shown = n;
}
function dialogA() {
  if (D.shown < D.total) { D.shown = D.total; D.t = 99; return; }
  if (D.page.ask) { answer(D.choice); return; }
  nextPage();
}
function answer(i) {
  Audio.sfx('select');
  const a = D.page.ask, br = i === 0 ? a.yes : a.no;
  D.q.unshift(...(typeof br === 'function' ? br() : br || []));
  nextPage();
}
function dialogDir(d) {
  if (D.page && D.page.ask && D.shown >= D.total && (d === 'up' || d === 'down')) { D.choice = 1 - D.choice; Audio.sfx('move'); }
}
function dialogBoxY(playerScreenY) {
  const bottom = UIB - 46, top = D.name ? 16 : 4;
  if (D.pos === 'bottom') return bottom;
  if (D.pos === 'top') return top;
  return playerScreenY + 10 > bottom ? top : bottom;
}
function choiceBox(by) {
  const w = dialogW(), bx = dialogX();
  return [bx + w - 46, by > VH / 3 ? by - 30 : by + 46];
}
function dialogTap(x, y, by) {
  if (D.page && D.page.ask && D.shown >= D.total) {
    const [cx, cy] = choiceBox(by);
    if (x >= cx && x < cx + 44 && y >= cy && y < cy + 28) { answer(y < cy + 14 ? 0 : 1); return; }
  }
  dialogA();
}
function drawDialog(by) {
  if (!D.active || !D.page) return;
  const w = dialogW(), bx = dialogX();
  if (D.name) { box(ctx, bx + 6, by - 13, textWidth(D.name) + 14, 16, '#9a643e'); text(ctx, D.name, bx + 13, by - 9, '#fff6dc'); }
  box(ctx, bx, by, w, 44);
  let left = D.shown;
  D.page.lines.forEach((ln, i) => {
    const part = ln.slice(0, Math.max(0, left)); left -= ln.length;
    text(ctx, part, bx + 8, by + 8 + i * 11, UI.text);
  });
  if (D.shown >= D.total) {
    if (D.page.ask) {
      const [cx, cy] = choiceBox(by);
      box(ctx, cx, cy, 44, 28);
      text(ctx, 'YES', cx + 16, cy + 7, UI.text); text(ctx, 'NO', cx + 16, cy + 17, UI.text);
      text(ctx, '▶', cx + 8, cy + 7 + D.choice * 10, UI.accent);
    } else if (Math.floor(G.time * 3) % 2) text(ctx, '▼', bx + w - 13, by + 34, UI.accent);
  }
}

// ================================================================ backdrop (title / end)
const STARS = Array.from({ length: 60 }, (_, i) => ({ x: hash(i, 1), y: hash(i, 2), p: hash(i, 3) * 6 }));
let deco = null;
const SKY = { bh: 30, H: 150 };
function backdropArt() {
  if (deco) return deco;
  // long thin dusk clouds
  const cloud = (top, body) => {
    const [c, x] = makeCanvas(60, 8);
    for (const [a, b, w] of [[10, 1, 26], [0, 3, 50], [18, 5, 40]]) { x.fillStyle = body; x.fillRect(a, b, w, 2); x.fillStyle = top; x.fillRect(a + 2, b, w - 4, 1); }
    return c;
  };
  const fir = (h, col) => {
    const [c, x] = makeCanvas(16, h + 2);
    x.fillStyle = col;
    for (let j = 0; j < h; j++) { const w = 1 + Math.floor(j * 7 / h) - (j % 4 === 3 ? 1 : 0); x.fillRect(8 - w, j, w * 2, 1); }
    x.fillRect(7, h, 2, 2);
    return c;
  };
  // stone castle, slate spires, glowing windows
  const [cs, x] = makeCanvas(76, 60);
  const S = { o: '#16121c', b: '#5e5a66', l: '#7a7682', d: '#46424e' };
  const wallC = (ox, oy, w, h) => { x.fillStyle = S.o; x.fillRect(ox, oy, w, h); x.fillStyle = S.b; x.fillRect(ox + 1, oy + 1, w - 2, h - 1); x.fillStyle = S.l; x.fillRect(ox + 1, oy + 1, 2, h - 1); x.fillStyle = S.d; x.fillRect(ox + w - 3, oy + 1, 2, h - 1); for (let j = oy + 4; j < oy + h; j += 4) { x.fillStyle = S.d; x.fillRect(ox + 3, j, w - 6, 1); } };
  const spire = (cx, top, half, h) => {
    for (let j = 0; j < h; j++) { const hw = Math.round(1 + j * (half - 1) / (h - 1)); for (let i = -hw; i < hw; i++) { x.fillStyle = (i === -hw || i === hw - 1 || j === h - 1) ? '#14161c' : i < -hw / 3 ? '#5a6274' : '#3e4454'; x.fillRect(cx + i, top + j, 1, 1); } }
    x.fillStyle = S.o; x.fillRect(cx, top - 7, 1, 7); x.fillStyle = C.purple; x.fillRect(cx + 1, top - 7, 5, 3); x.fillStyle = C.gold; x.fillRect(cx + 2, top - 6, 1, 1);
  };
  wallC(15, 32, 46, 28);
  for (let i = 15; i < 61; i += 6) { x.fillStyle = S.o; x.fillRect(i, 29, 4, 4); x.fillStyle = S.b; x.fillRect(i + 1, 30, 2, 3); }
  wallC(31, 18, 14, 42); spire(38, 4, 9, 15);
  wallC(6, 26, 12, 34); spire(12, 14, 8, 13);
  wallC(58, 26, 12, 34); spire(64, 14, 8, 13);
  x.fillStyle = S.o; x.fillRect(33, 46, 10, 14); x.fillStyle = '#e89a3a'; x.fillRect(34, 48, 8, 12); x.fillStyle = '#ffd27a'; x.fillRect(36, 51, 4, 9);
  const wins = [[37, 24], [11, 34], [63, 34], [21, 40], [53, 40], [37, 34]];
  for (const [a, b] of wins) { x.fillStyle = S.o; x.fillRect(a - 1, b - 1, 4, 6); x.fillStyle = C.glass; x.fillRect(a, b, 2, 4); }
  deco = {
    cloud: cloud('#b06a6a', '#5a3a5a'), cloudN: cloud('#4a4a7a', '#2a2a48'), castle: cs, wins,
    firs: [fir(22, '#121a18'), fir(30, '#121a18'), fir(18, '#18221e')],
  };
  return deco;
}
const grassTop = (x, H) => H + Math.round(Math.sin(x / 31 + 1) * 3);
function drawBackdrop(t, night = false) {
  const art = backdropArt();
  const H = Math.round(VH * 0.62);
  const sky = night ? ['#0c0a1c', '#141228', '#1c1834', '#261e40', '#32264a'] : ['#16132e', '#241c46', '#3e2a58', '#6e3e5e', '#b0624e'];
  // Five equal colour bands. The value taps use them: see skyValue().
  const bh = Math.ceil(H / sky.length), edges = [0, bh, 2 * bh, 3 * bh, 4 * bh, H];
  SKY.bh = bh; SKY.H = H;
  for (let i = 0; i < sky.length; i++) {
    ctx.fillStyle = sky[i]; ctx.fillRect(0, edges[i], VW, edges[i + 1] - edges[i] + 1);
    if (i) { ctx.fillStyle = sky[i - 1]; for (let x = 0; x < VW; x += 2) { ctx.fillRect(x + (i % 2), edges[i], 1, 1); ctx.fillRect(x, edges[i] + 2, 1, 1); } }
  }
  for (const s of STARS) {
    if (!night && s.y > 0.55) continue;
    const b = Math.sin(t * 2 + s.p), sx = (s.x * VW) | 0, sy = (s.y * H * 0.85) | 0;
    if (b > -0.3) { ctx.fillStyle = b > 0.7 ? '#f4ecd8' : '#9a90b8'; ctx.fillRect(sx, sy, 1, 1); if (b > 0.95) { ctx.fillRect(sx - 1, sy, 3, 1); ctx.fillRect(sx, sy - 1, 1, 3); } }
  }
  // crescent moon
  const mx = Math.round(VW * 0.8), my = Math.round(H * 0.2);
  ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow(14, '#6a6ab0'), mx - 14, my - 14); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#efe6c8'; ctx.fillRect(mx - 4, my - 5, 9, 11); ctx.fillRect(mx - 5, my - 4, 11, 9);
  ctx.fillStyle = sky[1]; ctx.fillRect(mx - 1, my - 6, 8, 10); ctx.fillRect(mx, my - 4, 7, 9);
  for (let i = 0; i < 3; i++) {
    const span = VW + 70, x = ((hash(i, 5) * span + t * (2 + i)) % span) - 60, y = Math.round(H * (0.3 + i * 0.16));
    ctx.drawImage(night ? art.cloudN : art.cloud, Math.round(x), y);
  }
  // far mountains
  ctx.fillStyle = night ? '#1a1830' : '#2c2244';
  for (let x = 0; x < VW; x++) {
    const u = x / VW, h = H - 18 - Math.round(Math.abs(((u * 5.3) % 1) - 0.5) * 22 + Math.sin(u * 23) * 2);
    ctx.fillRect(x, h, 1, VH - h);
  }
  ctx.fillStyle = night ? '#141228' : '#221a36';
  for (let x = 0; x < VW; x++) { const u = x / VW, h = H - 8 - Math.round(Math.abs(((u * 3.1 + 0.4) % 1) - 0.5) * 14); ctx.fillRect(x, h, 1, VH - h); }
  const cx0 = Math.round(VW / 2 - 38), cy0 = H - 54;
  ctx.drawImage(art.castle, cx0, cy0);
  ctx.globalCompositeOperation = 'lighter';
  for (const [a, b] of art.wins) ctx.drawImage(glow(7, '#c87a2a'), cx0 + a - 6, cy0 + b - 5);
  ctx.globalCompositeOperation = 'source-over';
  // dark meadow and fir woods
  for (let x = 0; x < VW; x++) {
    const h = grassTop(x, H);
    ctx.fillStyle = night ? '#24301e' : '#3e5030'; ctx.fillRect(x, h, 1, 2);
    ctx.fillStyle = night ? '#1a2416' : '#2e3e24'; ctx.fillRect(x, h + 2, 1, VH - h);
  }
  for (let i = 0; i < 24; i++) {
    const a = (hash(i, 31) * VW) | 0, b = H + 6 + ((hash(i, 32) * (VH - H - 8)) | 0);
    ctx.fillStyle = '#1e2a18'; ctx.fillRect(a, b + 1, 1, 1); ctx.fillRect(a + 1, b, 1, 2); ctx.fillRect(a + 3, b, 1, 2); ctx.fillRect(a + 4, b + 1, 1, 1);
  }
  const firs = [[0.0, 1], [0.06, 0], [0.13, 2], [0.2, 0], [0.8, 2], [0.87, 0], [0.93, 1], [0.99, 2]];
  for (const [fx, k] of firs) {
    const f = art.firs[k];
    ctx.drawImage(f, Math.round(fx * VW) - 8, H + 2 - f.height + 2);
  }
}
// Draw a fixed 160x144 layout in the middle of the screen; returns the offset.
function centre() { return [Math.round((UIX0 + UIX1 - 160) / 2), Math.max(0, Math.round((UIB - 144) / 2))]; }

// ================================================================ title
// Value taps follow the five sky colour bands. The four purple bands are the rows, three
// across: 1-3, 4-6, 7-9, 10-12. The orange band, with the mountains, trees and castle in
// it, is 13, down to the top edge of the grass. Taps on the grass don't change anything.
function skyValue(x, y) {
  if (y < 4 * SKY.bh) return VALUE_GRID[Math.max(0, Math.floor(y / SKY.bh))][Math.max(0, Math.min(2, Math.floor(x / (VW / 3))))];
  return y < grassTop(Math.round(x), SKY.H) + 2 ? 13 : null;
}
// START sits on the meadow. Everything above it is the secret value grid.
function startBox() {
  const w = 104, h = 24;
  return { x: Math.round((VW - w) / 2), y: Math.min(VH - 44, Math.round(VH * 0.74)), w, h };
}
const Title = {
  enter() {
    this.t = 0; this.cheat = false; this.go = false; this.credit = [];
    G.name = ''; // a fresh spectator each time
    Audio.music('title');
  },
  update(dt) {
    this.t += dt;
    if (Math.random() < dt * 4) mote(Math.random() * VW, VH * (0.55 + Math.random() * 0.45));
  },
  draw() {
    drawBackdrop(this.t);
    const bob = Math.round(Math.sin(this.t * 1.5)), cx = VW / 2, ly = Math.round(VH * 0.12);
    textCenter(ctx, 'ODDPAQ', cx + 2, ly + 3 + bob, '#2a1a3a', 3);
    textCenter(ctx, 'ODDPAQ', cx, ly + bob, C.gold, 3, C.ink);
    ctx.fillStyle = '#fff6b0'; ctx.fillRect(Math.round(cx - 50), ly + bob + 3, 2, 2);
    textCenter(ctx, 'WINDS OF WONDER', cx, ly + 28, '#e9dcb8', 1, C.ink);
    const S = startBox();
    box(ctx, S.x, S.y, S.w, S.h, this.go ? '#f4d48a' : UI.paper);
    // the 2nd and 4th quarters (Hearts, Diamonds) are a shade darker
    ctx.fillStyle = 'rgba(120,80,30,0.08)';
    for (const q of [1, 3]) { const a = Math.max(S.x + 4, Math.round(S.x + q * S.w / 4)), b = Math.min(S.x + S.w - 4, Math.round(S.x + (q + 1) * S.w / 4)); ctx.fillRect(a, S.y + 4, b - a, S.h - 8); }
    if (!this.go || Math.floor(this.t * 12) % 2) textCenter(ctx, 'START', cx, S.y + 9, UI.text);
    if (!this.go && (this.t % 1.1) < 0.7) { text(ctx, '▶', S.x - 9, S.y + 9, C.gold); }
    drawParts();
    drawVignette();
    if (this.cheat) drawCheat();
  },
  onTap(x, y) {
    if (this.go) return;
    if (this.cheat) { this.cheat = false; return; }
    // performer cheat sheet: triple-tap the empty grass at the bottom middle
    if (y >= VH - 20 && Math.abs(x - VW / 2) < 28) {
      const now = this.t; this.credit = this.credit.filter(c => now - c < 0.9); this.credit.push(now);
      if (this.credit.length >= 3) { this.cheat = true; this.credit = []; }
      return;
    }
    const S = startBox();
    if (x >= S.x && x < S.x + S.w && y >= S.y - 3 && y < S.y + S.h + 3) {
      if (!G.locked) G.armed.s = CHASED[Math.max(0, Math.min(3, Math.floor((x - S.x) / (S.w / 4))))];
      this.begin();
      return;
    }
    const v = !G.locked && y < S.y - 4 ? skyValue(x, y) : null;
    if (v) { G.armed.v = v; numberBurst(x, y, v); }
    else spark(x, y, 5, '#ffe9a0');
  },
  onA() { if (!this.cheat) this.begin(); else this.cheat = false; },
  begin() {
    if (this.go) return;
    this.go = true; Audio.sfx('start');
    const S = startBox();
    spark(VW / 2, S.y + 12, 12, C.gold);
    setTimeout(() => fadeTo(() => setScene(NameEntry), 0.3), 450);
  },
};
function drawCheat() {
  ctx.fillStyle = 'rgba(30,20,40,0.5)'; ctx.fillRect(0, 0, VW, VH);
  const [ox, oy] = centre();
  ctx.save(); ctx.translate(ox, oy);
  box(ctx, 6, 6, 148, 132);
  textCenter(ctx, 'CHEAT SHEET', 80, 13, UI.accent);
  const gx = 22, gy = 22, cw = 39, ch = 11;
  VALUE_GRID.forEach((row, j) => row.forEach((v, i) => {
    ctx.fillStyle = UI.paperD; ctx.fillRect(gx + i * cw, gy + j * ch, cw - 2, ch - 2);
    textCenter(ctx, String(v), gx + i * cw + cw / 2 - 1, gy + j * ch + 1, UI.text);
  }));
  ctx.fillStyle = UI.paperD; ctx.fillRect(gx, gy + 4 * ch, cw * 3 - 2, ch - 2);
  textCenter(ctx, '13', gx + cw * 1.5 - 1, gy + 4 * ch + 1, UI.text);
  textCenter(ctx, 'PURPLE 1-12. ORANGE 13', 80, 79, UI.dim);
  ['C', 'H', 'S', 'D'].forEach((s, i) => {
    ctx.fillStyle = '#ecc890'; ctx.fillRect(32 + i * 24, 90, 22, 12);
    textCenter(ctx, s, 43 + i * 24, 93, s === 'H' || s === 'D' ? C.red : UI.text);
  });
  text(ctx, 'START = SUIT', 44, 105, UI.dim);
  const a = G.armed;
  const lab = a.v || a.s ? `${a.v ? a.v : '?'}${a.s ? { C: '♣', H: '♥', S: '♠', D: '♦' }[a.s] : '?'}` : '--';
  textCenter(ctx, a.word ? 'WORD: ' + a.word.slice(0, 16) : 'ARMED: ' + lab + (G.locked ? ' (URL)' : ''), 80, 116, UI.accent);
  textCenter(ctx, 'TAP TO CLOSE', 80, 126, UI.dim);
  ctx.restore();
}

// ================================================================ name entry
// A QWERTY keyboard, driven by the D-pad and A (B deletes). Typing works on a computer.
const QWERTY = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const KEYS = [];
QWERTY.forEach((row, r) => [...row].forEach((ch, c) => KEYS.push({ r, label: ch, x: 6 + [0, 7, 22][r] + c * 15, y: 52 + r * 16, w: 13, h: 13 })));
KEYS.push({ r: 3, label: 'DEL', x: 22, y: 104, w: 48, h: 13 }, { r: 3, label: 'NEXT', x: 90, y: 104, w: 48, h: 13 });
const NameEntry = {
  enter() { this.name = G.name || ''; this.k = 0; this.t = 0; },
  update(dt) { this.t += dt; },
  draw() {
    drawBackdrop(this.t);
    const [ox, oy] = centre();
    ctx.save(); ctx.translate(ox, oy);
    box(ctx, 0, 0, 160, 128);
    textCenter(ctx, 'WHAT IS YOUR NAME?', 80, 8, UI.accent);
    box(ctx, 22, 20, 116, 24, '#f4ead0');
    for (let i = 0; i < 8; i++) {
      const ch = this.name[i];
      if (ch) text(ctx, ch, 32 + i * 12, 25, UI.text, 2);
      else if (i === this.name.length && Math.floor(this.t * 3) % 2) { ctx.fillStyle = UI.accent; ctx.fillRect(32 + i * 12, 38, 10, 2); }
      else { ctx.fillStyle = UI.paperD; ctx.fillRect(32 + i * 12, 38, 10, 1); }
    }
    KEYS.forEach((b, i) => {
      const sel = i === this.k;
      ctx.fillStyle = sel ? '#f4d48a' : '#e2d2aa'; ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = sel ? UI.accent : UI.paperD; ctx.fillRect(b.x, b.y + b.h - 1, b.w, 1);
      textCenter(ctx, b.label, b.x + b.w / 2, b.y + 3, sel ? UI.accent : UI.text);
    });
    drawParts();
    ctx.restore();
  },
  onDir(d) {
    Audio.sfx('move');
    const cur = KEYS[this.k], cx = cur.x + cur.w / 2;
    if (d === 'left' || d === 'right') {
      const row = KEYS.map((k, i) => i).filter(i => KEYS[i].r === cur.r), j = row.indexOf(this.k);
      this.k = row[(j + (d === 'left' ? row.length - 1 : 1)) % row.length];
    } else {
      const r = (cur.r + (d === 'up' ? 3 : 1)) % 4;
      let best = 0, bd = 1e9;
      KEYS.forEach((k, i) => { if (k.r === r) { const dd = Math.abs(k.x + k.w / 2 - cx); if (dd < bd) { bd = dd; best = i; } } });
      this.k = best;
    }
  },
  pick() {
    const lab = KEYS[this.k].label;
    if (lab === 'DEL') this.del(); else if (lab === 'NEXT') this.done(); else this.add(lab);
  },
  add(ch) { if (this.name.length < 8) { this.name += ch; Audio.sfx('select'); } else Audio.sfx('bump'); },
  del() { if (this.name.length) { this.name = this.name.slice(0, -1); Audio.sfx('move'); } },
  done() {
    if (!this.name) { Audio.sfx('bump'); return; }
    G.name = this.name; Audio.sfx('start');
    fadeTo(() => setScene(ClassScene), 0.3);
  },
  onA() { this.pick(); },
  onB() { this.del(); },
  onKey(e) {
    const k = e.key;
    if (/^[a-z]$/i.test(k)) { this.add(k.toUpperCase()); return true; }
    if (k === 'Backspace') { this.del(); return true; }
    if (k === 'Enter') { this.done(); return true; }
    return false;
  },
};

// ================================================================ hero
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function makeHero(name, ci) {
  let h = 2166136261;
  for (const ch of name) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const r = rng(h), pick = a => a[Math.floor(r() * a.length)];
  const cls = CLASSES[ci];
  const look = { kind: 'person', key: 'hero:' + name + ':' + cls.id, skin: pick(SKINS), hair: pick(HAIRS), long: r() < 0.4, boots: '#3e2a1a', ...cls.look };
  return { look, cls: cls.name, id: cls.id, def: cls, hp: cls.hp, mp: cls.mp };
}
// Pick a path: four heroes side by side, each with their own weapon.
const ClassScene = {
  enter() { this.t = 0; this.i = 0; this.heroes = CLASSES.map((c, i) => makeHero(G.name, i)); },
  update(dt) { this.t += dt; },
  draw() {
    drawBackdrop(this.t);
    const [ox, oy] = centre();
    ctx.save(); ctx.translate(ox, oy);
    textCenter(ctx, 'CHOOSE YOUR PATH', 80, 3, C.gold, 1, C.ink);
    this.heroes.forEach((h, i) => {
      const x = 1 + i * 40, sel = i === this.i;
      box(ctx, x, 13, 38, 44, sel ? '#f4d48a' : UI.paper);
      const frame = sel ? [0, 1, 0, 2][Math.floor(this.t * 6) % 4] : 0;
      ctx.drawImage(charSprite(h.look, 'down', frame), x + 3, 19, 32, 32);
      textCenter(ctx, h.cls, x + 19, 60, sel ? C.gold : '#e9dcb8', 1, C.ink);
    });
    const c = this.heroes[this.i].def;
    box(ctx, 6, 70, 148, 40);
    text(ctx, c.name, 14, 77, UI.accent);
    text(ctx, `WEAPON: ${c.weapon}`, 14, 87, UI.text);
    text(ctx, `HP ${c.hp}  MP ${c.mp}`, 14, 97, UI.text);
    box(ctx, 48, 113, 64, 19);
    textCenter(ctx, 'CHOOSE', 80, 119, UI.text);
    if ((this.t % 1.1) < 0.7) text(ctx, '▶', 40, 119, C.gold);
    drawParts();
    ctx.restore();
  },
  onDir(d) {
    if (d === 'left' || d === 'right') { this.i = (this.i + (d === 'left' ? 3 : 1)) % 4; Audio.sfx('move'); }
  },
  onA() { this.choose(); },
  onB() { Audio.sfx('move'); fadeTo(() => setScene(NameEntry), 0.2); },
  choose() {
    if (G.fade) return;
    G.hero = this.heroes[this.i];
    Audio.sfx('start'); spark(20 + this.i * 40, 34, 12, C.gold);
    fadeTo(() => { setScene(Play); Play.start(); }, 0.4);
  },
};

// ================================================================ play
const mapCache = {};
function loadMap(name) {
  if (mapCache[name]) return mapCache[name];
  const def = MAPS[name], rows = def.rows, w = rows[0].length, h = rows.length;
  const tiles = rows.map(r => [...r].map(ch => def.legend[ch] || ['grass']));
  const m = {
    name, def, w, h,
    kind(tx, ty) { return tx < 0 || ty < 0 || tx >= w || ty >= h ? null : tiles[ty][tx][0]; },
    solid(tx, ty) { return tx < 0 || ty < 0 || tx >= w || ty >= h ? true : !!tiles[ty][tx][1]; },
  };
  m.water = rows.some(r => r.includes('~'));
  m.canvas = [];
  for (let f = 0; f < (m.water ? 2 : 1); f++) {
    const [c, x] = makeCanvas(w * 16, h * 16);
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) drawTile(x, tiles[ty][tx][0], tx * 16, ty * 16, m, tx, ty, f);
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) drawOver(x, tiles[ty][tx][0], tx * 16, ty * 16, m, tx, ty);
    m.canvas.push(c);
  }
  m.flames = []; m.lights = []; m.bubbles = [];
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    const k = tiles[ty][tx][0];
    if (k === 'torch') m.flames.push({ x: tx * 16 + 8, y: ty * 16 + 7, big: false });
    if (k === 'hearth') m.flames.push({ x: tx * 16 + 8, y: ty * 16 + 15, big: true });
    if (k === 'cauldron') m.bubbles.push({ x: tx * 16, y: ty * 16 });
    const L = LIGHTS[k];
    if (L) m.lights.push({ x: tx * 16 + L[0], y: ty * 16 + L[1], r: L[2], col: L[3] });
    if (k === 'tower' && m.kind(tx, ty - 1) !== 'tower') m.lights.push({ x: tx * 16 + 8, y: ty * 16 + 6, r: 10, col: '#c87a2a' });
  }
  return (mapCache[name] = m);
}

// Light sources by tile: [x, y, radius, colour]. Drawn additively over a dusk tint.
const LIGHTS = {
  lamp: [8, 1, 30, '#d88a30'], hwin: [8, 6, 16, '#d88a30'], cwin: [8, 8, 14, '#d88a30'], gate: [8, 10, 18, '#d88a30'],
  torch: [8, 4, 36, '#e07a2a'], hearth: [8, 12, 46, '#e07a2a'], runestone: [8, 8, 22, '#3ab8e0'],
  hwindow: [8, 6, 12, '#5a5aa0'], cauldron: [8, 4, 24, '#4ae84a'],
};
const TINT = { world: 'rgba(28,18,66,0.28)', home: 'rgba(34,18,10,0.26)', witches: 'rgba(30,14,40,0.3)', castle: 'rgba(16,10,44,0.3)' };
const SPEED = 5, NPC_SPEED = 2.6;
const Play = {
  start() {
    G.flags = {};
    this.npcs = NPCS.map(n => ({
      ...n, look: LOOKS[n.look], dir: n.dir || 'down', px: n.x * 16, py: n.y * 16, home: { x: n.x, y: n.y },
      moving: false, t: 0, timer: 1 + Math.random() * 2, frame: 0, anim: Math.random() * 3, talked: 0,
    }));
    this.load('home', 2, 3, 'right');
    const wake = SCRIPT.wake.slice(), keys = !window.matchMedia('(pointer: coarse)').matches;
    if (keys) wake[2] = `USE WASD OR THE ARROW KEYS TO WALK. PRESS ${KEY_A.toUpperCase()} TO TALK OR LOOK.`;
    this.shots = []; this.cool = 0; this.swing = null; this.code = []; this.visitor = null; this.items = [];
    this.run(function* () { yield wait(0.7); yield* talk(wake); });
  },
  load(mapName, x, y, dir) {
    this.map = loadMap(mapName);
    this.p = { x, y, px: x * 16, py: y * 16, dir, moving: false, t: 0, anim: 0 };
    this.prop = null;
    this.time = this.time || 0; this.fx = { dark: 0, flash: 0 }; this.card = null; this.bumpT = 0; this.shots = []; this.swing = null;
    parts = [];
    this.flies = [];
    if (mapName === 'world') for (let i = 0; i < 7; i++) {
      const spots = [[10, 24], [20, 30], [6, 35], [14, 36], [22, 23], [4, 31], [24, 12]];
      this.flies.push({ x: spots[i][0] * 16, y: spots[i][1] * 16, p: Math.random() * 9, col: ['#ffffff', '#f3e04a', '#f08aa8'][i % 3] });
    }
    Audio.music(this.map.def.music);
    if (mapName === 'world' && G.flags.wingsDue && !G.flags.wings) this.run(wingsScene);
  },
  run(gen) { this.script = gen.call(this); this.waitFn = null; },
  npcsHere() { return this.npcs.filter(n => n.map === this.map.name); },
  npcAt(x, y) { return this.npcsHere().find(n => (n.x === x && n.y === y) || (n.moving && n.tx === x && n.ty === y)); },
  npc(id) { return this.npcs.find(n => n.id === id); },
  // First step of the shortest walk from o to a tile where isGoal(x, y). With
  // `through`, people in the way are ignored (they'll be shoved).
  bfsDir(o, isGoal, through = false) {
    const key = (x, y) => x + ',' + y, start = key(o.x, o.y), prev = new Map([[start, null]]), q = [[o.x, o.y]];
    while (q.length) {
      const [x, y] = q.shift();
      if (isGoal(x, y) && key(x, y) !== start) {
        let k = key(x, y);
        while (prev.get(k).from !== start) k = prev.get(k).from;
        return prev.get(k).dir;
      }
      for (const d of ['up', 'down', 'left', 'right']) {
        const [dx, dy] = DIRV[d], nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (prev.has(k) || this.map.solid(nx, ny) || Math.abs(nx - o.x) + Math.abs(ny - o.y) > 14) continue;
        if (!through && ((this.p.x === nx && this.p.y === ny) || (this.npcAt(nx, ny) && this.npcAt(nx, ny) !== o))) continue;
        prev.set(k, { from: key(x, y), dir: d }); q.push([nx, ny]);
      }
    }
    return null;
  },
  // Push someone one tile out of the way (straight on if possible, else to a side).
  shove(o, d) {
    for (const dd of [d, ...(d === 'up' || d === 'down' ? ['left', 'right'] : ['up', 'down'])]) {
      const [dx, dy] = DIRV[dd];
      if (this.free(o.x + dx, o.y + dy, o)) { this.move(o, dd, o === this.p ? SPEED : NPC_SPEED * 2); o.t = 0; if (o !== this.p) o.faceAfter = OPP[dd]; return true; }
    }
    return false;
  },
  // Is the bridge guard standing on the bridge, or at either end of it?
  guardBlocking(g) {
    const k = (x, y) => this.map.kind(x, y);
    return g.map === 'world' && this.map.name === 'world' && (k(g.x, g.y) === 'bridge' || k(g.x, g.y - 1) === 'bridge' || k(g.x, g.y + 1) === 'bridge');
  },
  // The frog coughs up the witches' key onto a free tile next to it (once).
  // It lands on the nearest open ground you can walk to: never water, trees, rocks
  // or a doorway. Nearest to the frog first, then nearest to you.
  dropKey(n, dir) {
    if (G.flags.keyDropped) return;
    const OPEN = new Set(['grass', 'grass2', 'flowers', 'tall', 'path', 'rubble']), m = this.map, p = this.p;
    const reach = new Set([p.x + ',' + p.y]), q = [[p.x, p.y]];
    while (q.length && reach.size < 900) {
      const [x, y] = q.shift();
      for (const [dx, dy] of Object.values(DIRV)) { const k = (x + dx) + ',' + (y + dy); if (!reach.has(k) && !m.solid(x + dx, y + dy)) { reach.add(k); q.push([x + dx, y + dy]); } }
    }
    const ok = (x, y) => reach.has(x + ',' + y) && OPEN.has(m.kind(x, y)) && !m.def.warps[x + ',' + y] && !this.npcAt(x, y) && !(p.x === x && p.y === y);
    let best = null;
    for (let d = 1; d <= 8 && !best; d++) {
      let bd = 1e9;
      for (let dx = -d; dx <= d; dx++) for (const dy of [d - Math.abs(dx), -(d - Math.abs(dx))]) {
        const x = n.x + dx, y = n.y + dy;
        if (!ok(x, y)) continue;
        const toYou = Math.abs(x - p.x) + Math.abs(y - p.y);
        if (toYou < bd) { bd = toYou; best = [x, y]; }
      }
    }
    const [x, y] = best || [p.x, p.y];
    G.flags.keyDropped = 1;
    this.items.push({ map: this.map.name, x, y, kind: 'key' });
    spark(x * 16 + 8, y * 16 + 8, 10, '#e8b84a', true);
    this.run(function* () { yield wait(0.5); yield* talk(QUEST.frogKey); });
  },
  enterWitches() {
    Audio.sfx('door');
    fadeTo(() => this.load('witches', 4, 6, 'up'), 0.25);
  },
  free(x, y, who) {
    if (this.map.solid(x, y) || this.map.def.warps[`${x},${y}`] && who !== this.p) return false;
    const p = this.p;
    if (who !== p && ((p.x === x && p.y === y) || (p.moving && p.tx === x && p.ty === y))) return false;
    if (who !== p && this.items && this.items.some(i => i.map === this.map.name && i.x === x && i.y === y)) return false; // keep the key clear
    const n = this.npcAt(x, y);
    return !n || n === who;
  },
  move(o, d, speed) {
    o.dir = d; const [dx, dy] = DIRV[d];
    o.fx = o.x; o.fy = o.y; o.tx = o.x + dx; o.ty = o.y + dy; o.moving = true; o.speed = speed;
  },
  step(o, dt) {
    o.t += dt * o.speed;
    if (o.t >= 1) { o.t -= 1; o.x = o.tx; o.y = o.ty; o.moving = false; o.px = o.x * 16; o.py = o.y * 16; return true; }
    o.px = Math.round((o.fx + (o.tx - o.fx) * o.t) * 16); o.py = Math.round((o.fy + (o.ty - o.fy) * o.t) * 16);
    return false;
  },
  update(dt) {
    this.time += dt;
    const busy = D.active || this.script || G.fade;
    // npcs
    for (const n of this.npcsHere()) {
      n.anim += dt;
      if (n.hitT > 0) n.hitT -= dt;
      if (n.recheck > 0 && (n.recheck -= dt) <= 0) {
        if (busy || n.moving) n.recheck = 0.3;
        else if (G.flags.guard && this.guardBlocking(n)) this.run(guardStepAside);
      }
      if (n.moving) { if (this.step(n, dt)) { n.t = 0; if (n.faceAfter) { n.dir = n.faceAfter; n.faceAfter = null; } } n.frame = [0, 1, 0, 2][Math.floor(n.anim * 7) % 4]; continue; }
      n.frame = n.look.kind === 'person' ? 0 : Math.floor(n.anim * (n.look.kind === 'chicken' ? 3 : 1.5)) % 2;
      if (n.wander && !busy) {
        n.timer -= dt;
        if (n.timer <= 0) {
          n.timer = (1 + Math.random() * 2.5) * (n.slow ? 1.8 : 1);
          const d = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
          const [dx, dy] = DIRV[d], nx = n.x + dx, ny = n.y + dy;
          n.dir = d;
          if (Math.abs(nx - n.home.x) <= n.wander && Math.abs(ny - n.home.y) <= n.wander && this.free(nx, ny, n)) { this.move(n, d, NPC_SPEED); n.t = 0; }
        }
      }
      if (n.sleep && Math.random() < dt * 0.8) parts.push({ k: 'z', x: n.px + 10, y: n.py - 2, vy: -8, life: 1.6, world: true });
      if (n.notes && Math.random() < dt * 0.7) parts.push({ k: 'note', x: n.px + 6, y: n.py - 4, vy: -10, life: 1.4, world: true });
    }
    // drifting magic in the air
    if (this.cam && this.map.name !== 'home' && Math.random() < dt * 3) mote(this.cam[0] + Math.random() * VW, this.cam[1] + Math.random() * VH, true);
    // script
    if (this.script && !G.fade) {
      if (!this.waitFn || this.waitFn()) {
        const r = this.script.next();
        if (r.done) this.script = null; else this.waitFn = r.value;
      }
    }
    dialogUpdate(dt);
    // player
    const p = this.p;
    if (p.moving) {
      p.anim += dt;
      if (this.step(p, dt)) {
        const extra = p.t; p.t = 0;
        this.onStep();
        if (!p.moving && !D.active && !this.script && !G.fade) { this.tryMove(); if (p.moving) p.t = extra; }
      }
    } else if (!D.active && !this.script && !G.fade) this.tryMove();
    if (!p.moving) p.anim = 0;
    this.bumpT -= dt;
    this.cool -= dt;
    if (this.swing && (this.swing.t += dt) > 0.25) this.swing = null;
    this.updateShots(dt);
    // effects
    this.fx.flash = Math.max(0, this.fx.flash - dt * 1.4);
    if (this.card) this.card.t += dt;
    updateParts(dt);
  },
  // ---- weapons: B button. Close weapons hit what is in front (or around) you;
  // far weapons aim themselves at the nearest person roughly in front of you.
  onB() {
    this.secret('B');
    if (D.active || this.script || G.fade || this.cool > 0 || this.card) return;
    const p = this.p, id = G.flags.chickenStaff ? 'poly' : G.hero.id, pcx = p.px + 8, pcy = p.py + 8;
    this.cool = id === 'bard' ? 0.6 : 0.4;
    this.swing = { t: 0, dir: p.dir, id };
    const at = (n, a, b) => (n.x === a && n.y === b) || (n.moving && n.tx === a && n.ty === b);
    if (id === 'knight') {
      Audio.sfx('swish');
      const [dx, dy] = DIRV[p.dir], fx = p.x + dx, fy = p.y + dy;
      const spots = [[fx, fy], [fx + dy, fy + dx], [fx - dy, fy - dx]];
      for (const n of this.npcsHere()) if (spots.some(([a, b]) => at(n, a, b))) this.hit(n, p.dir);
    } else if (id === 'bard') {
      Audio.sfx('strum');
      parts.push({ k: 'ring', x: pcx, y: pcy, life: 0.45, world: true });
      for (let i = 0; i < 3; i++) parts.push({ k: 'note', x: pcx - 8 + i * 8, y: pcy - 10, vy: -16, life: 0.9, world: true });
      for (const n of this.npcsHere()) {
        const dx = n.px + 8 - pcx, dy = n.py + 8 - pcy;
        if (Math.hypot(dx, dy) <= 30) this.hit(n, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      }
    } else {
      Audio.sfx(id === 'mage' || id === 'poly' ? 'zap' : 'twang');
      const t = this.aim();
      let vx, vy;
      if (t) { const dx = t.px + 8 - pcx, dy = t.py + 8 - pcy, l = Math.hypot(dx, dy); vx = dx / l; vy = dy / l; } else [vx, vy] = DIRV[p.dir];
      const sp = id === 'ranger' ? 210 : 150;
      this.shots.push({ id, x: pcx + vx * 6, y: pcy + vy * 6, vx: vx * sp, vy: vy * sp, dist: 0 });
    }
  },
  aim() {
    const p = this.p, [fx, fy] = DIRV[p.dir];
    let best = null, bd = 1e9;
    for (const n of this.npcsHere()) {
      const dx = n.px - p.px, dy = n.py - p.py, d = Math.hypot(dx, dy);
      if (d < 2 || d > 7 * 16 || (dx * fx + dy * fy) / d < 0.6) continue;
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  },
  updateShots(dt) {
    for (const s of this.shots) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.dist += Math.hypot(s.vx, s.vy) * dt;
      const tx = Math.floor(s.x / 16), ty = Math.floor(s.y / 16), k = this.map.kind(tx, ty);
      const dir = Math.abs(s.vx) > Math.abs(s.vy) ? (s.vx > 0 ? 'right' : 'left') : (s.vy > 0 ? 'down' : 'up');
      if (s.id !== 'ranger' && Math.random() < 0.6) parts.push({ k: 'spark', x: s.x, y: s.y, vx: 0, vy: 0, life: 0.3, col: s.id === 'poly' ? (Math.random() < 0.5 ? '#ffffff' : '#ffd24a') : '#b89aff', world: true });
      if (s.dist > 7 * 16 || (this.map.solid(tx, ty) && k !== 'water')) { s.dead = true; spark(s.x, s.y, 4, s.id === 'ranger' ? '#c8b890' : '#b89aff', true); continue; }
      const n = this.npcsHere().find(n => s.x >= n.px + 1 && s.x < n.px + 15 && s.y >= n.py - (n.tall ? 10 : 3) && s.y < n.py + 15);
      if (n) { s.dead = true; if (s.id === 'poly') this.chicken(n, dir); else this.hit(n, dir); }
    }
    this.shots = this.shots.filter(s => !s.dead);
  },
  // Nobody gets hurt: they blink, hop back a step and complain.
  // The chicken staff. Anyone (but the wizard) becomes a chicken; a second bolt turns
  // them back. A real chicken hit by it gains the power of speech (and loses it again).
  chicken(n, dir) {
    if (n.id === 'frog') this.dropKey(n, dir);
    Audio.sfx('poof');
    for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI * 2, v = 10 + Math.random() * 25; parts.push({ k: 'spark', x: n.px + 8, y: n.py + 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 8, life: 0.6, col: i % 2 ? '#e8e0d0' : '#c8c0d8', world: true }); }
    let shout;
    if (n.id === 'wizard') {
      n.chicken = !n.chicken; shout = n.chicken ? 'BAWK!?' : 'HM.'; // keeps his hat and staff
    } else if (n.chicken) {
      Object.assign(n, n.orig); n.chicken = false; n.dazed = true; shout = '...HUH?';
    } else if (n.look.kind === 'chicken') {
      n.awake = !n.awake; shout = n.awake ? '!?' : 'BAWK.';
    } else {
      n.orig = { look: n.look, sleep: n.sleep, spear: n.spear, notes: n.notes };
      n.chicken = true; n.look = LOOKS.chicken; n.sleep = false; n.spear = false; n.notes = false; shout = 'BAWK!';
    }
    n.hitT = 0.3;
    parts.push({ k: 'say', text: shout, x: n.px + 8, y: n.py - (n.sleep ? 4 : 9), vy: -14, life: 1.3, world: true });
  },
  hit(n, dir) {
    const key = n.id === 'wizard' ? 'wizard' : n.chicken ? 'chicken' : OUCH[n.id] ? n.id : OUCH[n.look.kind] ? n.look.kind : 'person';
    const lines = OUCH[key];
    n.hurt = (n.hurt || 0) + 1;
    parts.push({ k: 'say', text: lines[(n.hurt - 1) % lines.length], x: n.px + 8, y: n.py - (n.tall ? 20 : 9), vy: -14, life: 1.3, world: true });
    if (n.id === 'wizard') { Audio.sfx('fizzle'); spark(n.px + 8, n.py, 10, C.cyan, true); return; }
    Audio.sfx('hit');
    if (n.id === 'frog') this.dropKey(n, dir);
    if (n.id === 'guard') n.recheck = 0.6;
    n.hitT = 0.45; n.timer = 2.5; n.grudged = false;
    if (n.look.kind === 'chicken') spark(n.px + 8, n.py + 8, 8, '#e8e2d0', true);
    if (n.sleep || n.moving) return;
    const [dx, dy] = DIRV[dir];
    if (this.free(n.x + dx, n.y + dy, n)) { this.move(n, dir, NPC_SPEED * 2.2); n.t = 0; }
    n.faceAfter = OPP[dir]; if (!n.moving) n.dir = OPP[dir];
  },
  tryMove() {
    const p = this.p, d = heldDir();
    if (!d) return;
    p.dir = d;
    const [dx, dy] = DIRV[d], nx = p.x + dx, ny = p.y + dy;
    const n = this.npcAt(nx, ny);
    if (!n && this.free(nx, ny, p)) { this.move(p, d, SPEED); return; }
    if (n && n.bump && !n.moving) { this.talkTo(n); return; }
    if (this.map.name === 'world' && nx === 6 && ny === 28 && G.flags.unlocked) { this.enterWitches(); return; }
    if (this.bumpT <= 0) { Audio.sfx('bump'); this.bumpT = 0.3; }
  },
  onStep() {
    const p = this.p, m = this.map;
    const w = m.def.warps[`${p.x},${p.y}`];
    if (w) { Audio.sfx('door'); fadeTo(() => this.load(w.map, w.x, w.y, w.dir), 0.25); return; }
    const item = this.items.find(i => i.map === m.name && i.x === p.x && i.y === p.y);
    if (item) {
      this.items = this.items.filter(i => i !== item); G.flags.key = 1;
      this.run(function* () { Audio.sfx('item'); yield* talk(QUEST.gotKey); });
      return;
    }
    if (m.name === 'world' && !G.flags.hermit) {
      const h = this.npc('hermit');
      if (h && !h.chicken && Math.max(Math.abs(p.x - h.x), Math.abs(p.y - h.y)) <= 3) { this.run(hermitScene); return; }
    }
    if (m.name === 'castle') {
      if (p.y <= 6 && !G.flags.closer) { G.flags.closer = 1; this.run(function* () { yield* talk(SCRIPT.comeCloser.map(wz), true, null, 'WIZARD'); }); }
      if (p.y <= 4 && !G.flags.met) { p.dir = 'up'; this.run(wizardScene); }
    }
  },
  onDir(d) {
    this.secret(d);
    if (D.active) dialogDir(d);
    else if (!this.script && !this.p.moving) this.p.dir = d; // a quick tap still turns you
  },
  // up up down down left right left right B A, while walking around
  secret(key) {
    this.code = [...(this.code || []), key].slice(-KONAMI.length);
    if (G.flags.egg || D.active || this.script || this.card || G.fade) return false;
    if (this.code.join() !== KONAMI.join()) return false;
    G.flags.egg = 1; this.code = [];
    this.run(evilWizardScene);
    return true;
  },
  onA() {
    if (this.secret('A')) return;
    if (this.card && this.card.waitA) { this.card.waitA = false; return; }
    if (D.active) { dialogA(); return; }
    if (this.script || this.p.moving) return;
    const p = this.p, [dx, dy] = DIRV[p.dir], fx = p.x + dx, fy = p.y + dy;
    let n = this.npcAt(fx, fy);
    const kind = this.map.kind(fx, fy);
    if (!n && kind === 'stall') n = this.npcAt(fx + dx, fy + dy);
    if (n) { this.talkTo(n); return; }
    if (this.map.name === 'world' && fx === 6 && fy === 28 && G.flags.key) {
      if (G.flags.unlocked) { this.enterWitches(); return; }
      G.flags.unlocked = 1;
      this.run(function* () { Audio.sfx('select'); yield* talk(QUEST.unlock); this.enterWitches(); });
      return;
    }
    const looks = this.map.def.looks;
    const lines = looks[`${fx},${fy}`] || looks[kind];
    if (lines && lines.length) {
      if (kind === 'tableL') G.flags.letter = 1;
      Audio.sfx('select');
      say(lines);
    }
  },
  onTap(x, y) {
    if (this.card && this.card.waitA) { this.card.waitA = false; return; }
    if (D.active) dialogTap(x, y, this.dialogY);
  },
  talkTo(n) {
    if (n.id === 'wizard') { if (!G.flags.met) this.run(wizardScene); return; }
    if (!n.sleep && n.look.kind !== 'frog') n.dir = OPP[this.p.dir];
    let lines = n.talked && n.again ? n.again : n.talk, after = null;
    const W = ['morag', 'bridie', 'tansy'];
    if (W.includes(n.id) && !G.flags.potion && !n.chicken) {
      if (!n.told) {
        n.told = true;
        const all = W.every(id => this.npc(id).told);
        lines = [...QUEST.witchTalk[n.id], ...(all ? [] : QUEST.othersToo)];
        if (all) after = () => this.run(function* () { yield* potionScene.call(this, n); });
      } else lines = QUEST.witchWait[n.id];
    }
    else if (n.awake) { const w = EGG.woke[n.id] || EGG.woke.hen1; lines = n.wokeTalked ? w.again : w.talk; n.wokeTalked = true; }
    else if (n.chicken) lines = lines.map(l => squawk(fill(l)));
    else if (n.dazed && n.look.kind === 'person' && !n.sleep) { lines = [...EGG.restored, ...lines]; n.dazed = false; }
    else if (n.hurt && !n.grudged && n.look.kind === 'person' && !n.sleep) { lines = [GRUDGE[(n.hurt - 1) % GRUDGE.length], ...lines]; n.grudged = true; }
    n.talked++;
    say(lines, {
      name: n.name,
      onEnd: () => {
        if (n.id === 'guard' && (!G.flags.guard || this.guardBlocking(n))) this.run(guardStepAside);
        if (n.id === 'frog' && !n.chicken) this.dropKey(n, this.p.dir);
        if (after) after();
      },
    });
  },
  draw() {
    const m = this.map, p = this.p, mw = m.w * 16, mh = m.h * 16;
    const viewH = UIB; // keep the hero out from under the controls
    let cx = p.px + 8 - VW / 2, cy = p.py + 8 - viewH / 2;
    cx = Math.round(mw <= VW ? (mw - VW) / 2 : Math.max(0, Math.min(mw - VW, cx)));
    cy = Math.round(mh <= viewH ? (mh - viewH) / 2 : Math.max(0, Math.min(mh - viewH, cy)));
    this.cam = [cx, cy];
    ctx.fillStyle = m.name === 'world' ? '#2f6a3e' : '#1e1424'; ctx.fillRect(0, 0, VW, VH);
    ctx.drawImage(m.canvas[m.water ? Math.floor(this.time * 1.6) % 2 : 0], -cx, -cy);
    // letter twinkle until read
    if (m.name === 'home' && !G.flags.letter && Math.floor(this.time * 2) % 3 === 0) {
      ctx.fillStyle = C.white; const sx = 4 * 16 + 12 - cx, sy = 4 * 16 + 3 - cy;
      ctx.fillRect(sx, sy - 1, 1, 3); ctx.fillRect(sx - 1, sy, 3, 1);
    }
    // butterflies
    for (const f of this.flies) {
      const fxp = f.x + Math.sin(this.time * 0.5 + f.p) * 20 - cx, fyp = f.y + Math.sin(this.time * 1.3 + f.p) * 8 - cy;
      if (fxp < -4 || fyp < -4 || fxp > VW || fyp > VH) continue;
      ctx.fillStyle = f.col; const o = Math.floor(this.time * 8 + f.p) % 2;
      ctx.fillRect(fxp | 0, fyp | 0, 1, 1); ctx.fillRect((fxp | 0) - 1 - o, (fyp | 0) - 1 + o, 1, 1); ctx.fillRect((fxp | 0) + 1 + o, (fyp | 0) - 1 + o, 1, 1);
    }
    if (m.name === 'world') this.drawFrogPrints(cx, cy);
    // things lying on the ground
    for (const it of this.items) if (it.map === m.name) {
      ctx.drawImage(keySprite(), it.x * 16 - cx + 3, it.y * 16 - cy + 6 + Math.round(Math.sin(this.time * 3)));
      if (Math.random() < 0.05) parts.push({ k: 'spark', x: it.x * 16 + 6 + Math.random() * 6, y: it.y * 16 + 6, vx: 0, vy: -5, life: 0.4, col: '#ffe9a0', world: true });
    }
    // characters, back to front
    const ents = this.npcsHere().map(n => ({ n, y: n.py }));
    ents.push({ n: null, y: p.py });
    ents.sort((a, b) => a.y - b.y);
    let wiz = null;
    for (const e of ents) {
      if (!e.n) {
        const frame = p.moving ? [0, 1, 0, 2][Math.floor(p.anim * 8) % 4] : 0;
        const hx = p.px - cx, hy = p.py - cy - 2;
        if (G.flags.wings && p.dir !== 'up') this.drawWings(hx, hy, p.dir);
        ctx.drawImage(charSprite(G.hero.look, p.dir, frame), hx, hy);
        if (G.flags.wings && p.dir === 'up') this.drawWings(hx, hy, p.dir);
        if (G.flags.hat) ctx.drawImage(hatSprite(), p.px - cx + 2, p.py - cy - 6);
        if (this.swing) this.drawSwing(cx, cy);
        continue;
      }
      const n = e.n;
      if (n.tall) { wiz = n; this.drawWizard(n, cx, cy); continue; }
      if (n.hitT > 0 && Math.floor(n.hitT * 20) % 2) continue; // blink when hit
      if (n.spear) {
        ctx.fillStyle = C.ink; ctx.fillRect(n.px - cx + 13, n.py - cy - 5, 3, 19);
        ctx.fillStyle = C.woodL; ctx.fillRect(n.px - cx + 14, n.py - cy - 4, 1, 17);
        ctx.fillStyle = C.stoneL; ctx.fillRect(n.px - cx + 14, n.py - cy - 8, 1, 3);
      }
      const look = n.look;
      ctx.drawImage(charSprite(look, n.dir, n.frame), n.px - cx, n.py - cy - (look.kind === 'person' && !n.sleep ? 2 : 0));
      if (n.hat && !n.chicken) ctx.drawImage(hatSprite(n.hat), n.px - cx + 2, n.py - cy - 6);
    }
    // dusk, then the lights
    ctx.fillStyle = TINT[m.name]; ctx.fillRect(0, 0, VW, VH);
    ctx.globalCompositeOperation = 'lighter';
    const flick = Math.floor(this.time * 7);
    for (const L of m.lights) {
      const r = L.r - (hash(flick, L.x + L.y) < 0.3 ? 2 : 0), sx = L.x - cx - r, sy = L.y - cy - r;
      if (sx > VW || sy > VH || sx + r * 2 < 0 || sy + r * 2 < 0) continue;
      ctx.drawImage(glow(r, L.col), sx, sy);
    }
    if (wiz) { const r = wiz.frame ? 40 : 22, ox = wiz.chicken ? 12 : 15, oy = wiz.chicken ? -3 : -6; ctx.drawImage(glow(r, '#3ab8e0'), wiz.px - cx + ox - r, wiz.py - cy + oy - r); }
    ctx.globalCompositeOperation = 'source-over';
    for (const f of m.flames) flame(ctx, f.x - cx, f.y - cy, this.time + f.x, f.big);
    for (const b of m.bubbles) for (let i = 0; i < 3; i++) {
      const ph = (this.time * 1.2 + i / 3) % 1;
      ctx.fillStyle = `rgba(168,255,138,${(1 - ph).toFixed(2)})`; ctx.fillRect(b.x - cx + 5 + i * 3, Math.round(b.y - cy + 4 - ph * 9), 1, 1);
    }
    this.drawShots(cx, cy);
    drawVignette();
    if (this.prop) ctx.drawImage(potionSprite(), Math.round(this.prop.x - cx - 4), Math.round(this.prop.y - cy - 4));
    // talk bubble when facing someone
    if (!D.active && !this.script && !p.moving) {
      const [dx, dy] = DIRV[p.dir];
      let n = this.npcAt(p.x + dx, p.y + dy);
      if (!n && m.kind(p.x + dx, p.y + dy) === 'stall') n = this.npcAt(p.x + dx * 2, p.y + dy * 2);
      if (n && !n.moving && !n.quiet) {
        const bx = n.px - cx + 4, by = n.py - cy - (n.tall ? 22 : 12) + Math.round(Math.sin(this.time * 4));
        ctx.fillStyle = C.ink; ctx.fillRect(bx - 1, by - 1, 11, 8); ctx.fillRect(bx + 3, by + 7, 3, 2);
        ctx.fillStyle = C.white; ctx.fillRect(bx, by, 9, 6); ctx.fillRect(bx + 4, by + 6, 1, 1);
        ctx.fillStyle = C.ink; for (let i = 0; i < 3; i++) ctx.fillRect(bx + 2 + i * 2, by + 3, 1, 1);
      }
    }
    // reveal effects
    if (this.fx.dark > 0) {
      ctx.fillStyle = `rgba(8,4,24,${this.fx.dark})`; ctx.fillRect(0, 0, VW, VH);
      if (wiz) this.drawWizard(wiz, cx, cy);
    }
    if (this.visitor) this.drawVisitor(cx, cy);
    drawParts(cx, cy);
    if (this.card) this.drawReveal();
    if (this.fx.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, this.fx.flash)})`; ctx.fillRect(0, 0, VW, VH); }
    this.dialogY = dialogBoxY(p.py - cy);
    drawDialog(this.dialogY);
  },
  // A few small wet frog prints leading away from under the blue house's window toward
  // the lake. Faint, and they fade out after a few steps.
  drawFrogPrints(cx, cy) {
    // Damp blue-green frog prints heading east toward the lake: toes point right,
    // heels back toward the house. Each has a glint of water; they dry out as they go,
    // and stop before the next house along.
    const x0 = Math.round(7 * 16 + 2 - cx), y0 = Math.round(29 * 16 + 2 - cy);
    const FOOT = ['..o', 'oo.', 'ooo', 'oo.', '..o'];   // toes on the right
    const steps = [[0, 0], [8, 3], [16, 1], [24, 4], [32, 2], [40, 5], [48, 3]];
    steps.forEach(([dx, dy], i) => {
      ctx.globalAlpha = 1 - i * 0.12;
      ctx.fillStyle = '#2e4e52';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (FOOT[r][c] === 'o') ctx.fillRect(x0 + dx + c, y0 + dy + r, 1, 1);
      if (i < 5) { ctx.fillStyle = i < 2 ? '#a6dcff' : C.waterL; ctx.fillRect(x0 + dx + 1, y0 + dy + 2, 1, 1); }
    });
    ctx.globalAlpha = 1;
  },
  // Crimson Cow wings: one each side (from the front/back), one behind (from the side).
  drawWings(hx, hy, dir) {
    const w = wingSprite(), f = Math.floor(this.time * 3) % 2;
    const left = (x, y) => ctx.drawImage(w, x, y);
    const right = (x, y) => { ctx.save(); ctx.translate(x + 6, y); ctx.scale(-1, 1); ctx.drawImage(w, 0, 0); ctx.restore(); };
    if (dir === 'down' || dir === 'up') { left(hx - 3, hy + 5 - f); right(hx + 13, hy + 5 - f); }
    else if (dir === 'right') left(hx + 1, hy + 4 - f);
    else right(hx + 9, hy + 4 - f);
  },
  drawSwing(cx, cy) {
    const s = this.swing, p = this.p, x = p.px - cx + 8, y = p.py - cy + 7, k = s.t / 0.25;
    const base = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[s.dir];
    if (s.id === 'knight') {
      // the blade sweeps across the front, leaving a fading trail behind it
      const e = 1 - Math.pow(1 - Math.min(1, k * 1.5), 3), ang = base - 1.3 + 2.6 * e;
      ctx.globalCompositeOperation = 'lighter';
      for (let a = -1.3; a <= ang - base; a += 0.07) {
        const age = (ang - base - a) / 2.6, al = Math.max(0, 0.75 - age * 1.6) * (1 - Math.max(0, k - 0.6) * 2.5);
        if (al <= 0) continue;
        ctx.fillStyle = `rgba(210,225,255,${al.toFixed(2)})`;
        for (const r of [10, 12, 14]) ctx.fillRect(Math.round(x + Math.cos(base + a) * r), Math.round(y + Math.sin(base + a) * r), 1, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
      if (k < 0.85) {
        const ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux, pt = (r, o = 0) => [Math.round(x + ux * r + px * o), Math.round(y + uy * r + py * o)];
        for (let r = 2; r <= 15; r++) {          // outline first
          for (const o of [-1, 0, 1]) { const [a, b] = pt(r, o); ctx.fillStyle = C.ink; ctx.fillRect(a, b, 1, 1); }
        }
        for (let r = 2; r <= 4; r++) { const [a, b] = pt(r); ctx.fillStyle = C.woodD; ctx.fillRect(a, b, 1, 1); }   // grip
        for (const o of [-2, -1, 0, 1, 2]) { const [a, b] = pt(5, o); ctx.fillStyle = C.gold; ctx.fillRect(a, b, 1, 1); } // crossguard
        for (let r = 6; r <= 14; r++) { const [a, b] = pt(r); ctx.fillStyle = r === 14 ? '#ffffff' : '#d8dce8'; ctx.fillRect(a, b, 1, 1); } // blade
        for (let r = 6; r <= 13; r += 2) { const [a, b] = pt(r, -1); ctx.fillStyle = '#9aa0b4'; ctx.fillRect(a, b, 1, 1); }
      }
    } else if (s.id === 'ranger') {
      const bx = Math.round(x + Math.cos(base) * 8), by = Math.round(y + Math.sin(base) * 8);
      ctx.fillStyle = C.woodO;
      for (let a = -1.2; a <= 1.2; a += 0.2) ctx.fillRect(Math.round(bx + Math.cos(base + a) * 5 - Math.cos(base) * 3), Math.round(by + Math.sin(base + a) * 5 - Math.sin(base) * 3), 1, 1);
    } else if (s.id === 'mage' || s.id === 'poly') {
      const bx = Math.round(x + Math.cos(base) * 9), by = Math.round(y + Math.sin(base) * 9);
      ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow(8, s.id === 'poly' ? '#6ae84a' : '#9a6aff'), bx - 8, by - 8); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffffff'; ctx.fillRect(bx, by, 1, 1);
    }
  },
  drawShots(cx, cy) {
    for (const s of this.shots) {
      const x = s.x - cx, y = s.y - cy, l = Math.hypot(s.vx, s.vy), ux = s.vx / l, uy = s.vy / l;
      if (s.id !== 'ranger') {
        ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow(7, s.id === 'poly' ? '#6ae84a' : '#9a6aff'), Math.round(x) - 7, Math.round(y) - 7); ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
      } else {
        for (let i = 0; i < 7; i++) { ctx.fillStyle = i === 0 ? '#d0d0d8' : i > 5 ? '#e8e0cc' : C.woodL; ctx.fillRect(Math.round(x - ux * i), Math.round(y - uy * i), 1, 1); }
      }
    }
  },
  drawVisitor(cx, cy) {
    const v = this.visitor, x = Math.round(v.x - cx), y = Math.round(v.y - cy + Math.sin(this.time * 3) * 1.5);
    const gy = Math.round(v.ground - cy), lift = Math.max(0, v.ground - v.y - 10);
    ctx.fillStyle = `rgba(10,4,20,${Math.max(0.1, 0.4 - lift / 300)})`; ctx.fillRect(x + 3, gy + 12, 12, 2); ctx.fillRect(x + 5, gy + 11, 8, 4);
    ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow(18, '#8a2a6a'), x + 8 - 18, y - 2 - 18); ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(charSprite(EVIL, 'down', v.raise ? 1 : 0), x - 1, y - 11);
    if (Math.random() < 0.5) parts.push({ k: 'spark', x: v.x + 4 + Math.random() * 10, y: v.y + 12, vx: 0, vy: 8, life: 0.5, col: '#8a4ab0', world: true });
  },
  drawWizard(n, cx, cy) {
    if (n.chicken) {
      // a chicken in a wizard's hat, still holding the staff
      const x = n.px - cx, y = n.py - cy, hop = n.frame ? -2 : 0, up = n.frame ? 3 : 0;
      ctx.drawImage(charSprite(LOOKS.chicken, 'left', Math.floor(this.time * 3) % 2), x, y + hop);
      ctx.fillStyle = C.ink; ctx.fillRect(x + 11, y - 1 - up + hop, 3, 13 + up); ctx.fillStyle = C.wood; ctx.fillRect(x + 12, y - up + hop, 1, 11 + up);
      ctx.fillStyle = C.ink; ctx.fillRect(x + 10, y - 5 - up + hop, 5, 5); ctx.fillStyle = n.frame ? '#ffffff' : C.cyan; ctx.fillRect(x + 11, y - 4 - up + hop, 3, 3);
      ctx.drawImage(hatSprite(false), x + 1, y - 2 + hop);
      if (Math.random() < 0.06 || n.frame) parts.push({ k: 'spark', x: n.px + 12 + Math.random() * 3 - 1, y: n.py - 4 - up + Math.random() * 3, vx: 0, vy: -6, life: 0.4, col: C.cyan, world: true });
      return;
    }
    const bob = n.frame ? 0 : Math.round(Math.sin(this.time * 2) * 0.6);
    ctx.drawImage(charSprite(n.look, 'down', n.frame ? 1 : 0), n.px - cx - 1, n.py - cy - 11 + bob);
    if (Math.random() < 0.06 || n.frame) parts.push({ k: 'spark', x: n.px + 15 + Math.random() * 3 - 1, y: n.py - 6 + Math.random() * 3, vx: 0, vy: -6, life: 0.4, col: C.cyan, world: true });
  },
  drawReveal() {
    const c = this.card, k = Math.min(1, c.t / 0.6);
    const step = Math.max(1, Math.round(k * 8)) / 8;
    // light rays
    const cxp = Math.round(VW / 2), cyp = Math.round((UIB - 46) / 2) + 4;
    ctx.fillStyle = 'rgba(243,198,70,0.25)';
    for (let i = 0; i < 8; i++) {
      const a = c.t * 0.6 + i * Math.PI / 4;
      for (let r = 34; r < 70; r += 2) ctx.fillRect(Math.round(cxp + Math.cos(a) * r), Math.round(cyp + Math.sin(a) * r), 2, 2);
    }
    if (!this.cardCanvas) this.cardCanvas = revealCanvas(c);
    const rc = this.cardCanvas, rw = Math.round(rc.width * step), rh = Math.round(rc.height * step);
    ctx.drawImage(rc, cxp - rw / 2 | 0, cyp - rh / 2 | 0, rw, rh);
    if (c.t > 0.9) textCenter(ctx, c.word ? 'THE WIND SAYS:' : cardName(c.v, c.s), cxp, cyp - rc.height / 2 - 13, C.gold, 1, C.ink);
    if (c.waitA && c.t > 1.6 && Math.floor(G.time * 3) % 2) text(ctx, '▼', cxp + 30, cyp + rc.height / 2 + 6, C.gold);
  },
};

// ---------------------------------------------------------------- script helpers
const wait = s => { const until = Play.time + s; return () => Play.time >= until; };
function* talk(lines, low = false, pos = null, name = null) { say(lines, { low, pos: pos || 'auto', name }); yield () => !D.active; }
// "NO" loops back until they say yes.
// When the wizard is a chicken he squawks everything, except the card or word itself.
const henWizard = () => !!(Play.npcs && Play.npc('wizard').chicken);
const wz = l => (henWizard() ? squawk(fill(l)) : l);
const ask = (q = SCRIPT.ask) => ({ ask: wz(q), yes: [], no: () => [...SCRIPT.askNo.map(wz), ask(SCRIPT.askAgain)] });
const askWord = (q = SCRIPT.askWord) => ({ ask: wz(q), yes: [], no: () => [...SCRIPT.askNoWord.map(wz), askWord(SCRIPT.askAgain)] });
// The thing the wizard reveals: the armed word on a scroll, or the armed card.
const armedReveal = () => (G.armed.word ? { word: G.armed.word } : armedCard());
function revealCanvas(r) {
  if (r.word) return makeScroll(r.word);
  const [c, x] = makeCanvas(48, 64); drawCard(x, 0, 0, r.v, r.s); return c;
}

// Easter egg: an evil wizard drops out of the sky with gifts.
const EVIL = { kind: 'wizard', evil: true, key: 'evilwizard' };
function* evilWizardScene() {
  const p = this.p, music = this.map.def.music;
  Audio.stopMusic(); Audio.sfx('evil');
  const right = p.px + 40 < this.map.w * 16, v = { x: p.px + (right ? 22 : -22), ground: p.py - 2, y: (this.cam ? this.cam[1] : p.py) - 50, raise: 0 };
  const startY = v.y, t0 = this.time;
  this.visitor = v; p.dir = right ? 'right' : 'left';
  while (this.time - t0 < 1.6) {
    const k = Math.min(1, (this.time - t0) / 1.4);
    v.y = startY + (v.ground - 4 - startY) * (1 - Math.pow(1 - k, 3));
    this.fx.dark = 0.35 * k;
    yield null;
  }
  yield* talk(EGG.hello, true, null, 'EVIL WIZARD');
  v.raise = 1; Audio.sfx('sparkle');
  for (let i = 0; i < 24; i++) { const a = Math.random() * Math.PI * 2, r = 4 + Math.random() * 10; parts.push({ k: 'spark', x: p.px + 8 + Math.cos(a) * r, y: p.py + 4 + Math.sin(a) * r, vx: Math.cos(a) * 20, vy: Math.sin(a) * 20 - 10, life: 0.8, col: i % 2 ? '#6ae84a' : C.gold, world: true }); }
  yield wait(0.5);
  G.flags.chickenStaff = 1; G.flags.hat = 1;
  Audio.sfx('item');
  yield* talk(EGG.got);
  v.raise = 0; Audio.sfx('evil');
  const t1 = this.time, y1 = v.y;
  while (this.time - t1 < 1.2) {
    const k = (this.time - t1) / 1.2;
    v.y = y1 - (y1 - (this.cam[1] - 60)) * k * k;
    this.fx.dark = 0.35 * (1 - k);
    yield null;
  }
  this.visitor = null; this.fx.dark = 0;
  Audio.music(music);
}

// The hermit on the woods path spots you, walks over and checks you're ready.
function* hermitScene() {
  G.flags.hermit = 1;
  const h = this.npc('hermit'), p = this.p, Q = QUEST.hermit;
  parts.push({ k: 'say', text: '!', x: h.px + 8, y: h.py - 9, vy: -10, life: 0.9, world: true });
  Audio.sfx('select');
  yield wait(0.7);
  for (let i = 0; i < 12 && Math.abs(h.x - p.x) + Math.abs(h.y - p.y) > 1; i++) {
    const d = this.bfsDir(h, (x, y) => Math.abs(x - p.x) + Math.abs(y - p.y) === 1);
    if (!d) break;
    this.move(h, d, NPC_SPEED * 1.3); h.t = 0;
    yield () => !h.moving;
  }
  const dx = p.x - h.x, dy = p.y - h.y;
  h.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  p.dir = OPP[h.dir];
  const word = !!G.armed.word;
  yield* talk([...Q.hello, { ask: word ? Q.askWord : Q.askCard, yes: Q.yes, no: Q.no }], false, null, 'HERMIT');
  // then she goes back to her spot, off the path
  for (let i = 0; i < 12 && !(h.x === h.home.x && h.y === h.home.y); i++) {
    const d = this.bfsDir(h, (x, y) => x === h.home.x && y === h.home.y);
    if (!d) break;
    this.move(h, d, NPC_SPEED * 1.3); h.t = 0;
    yield () => !h.moving;
  }
  h.dir = 'right';
}

// The bridge guard gets off the bridge, shoving whoever is in his way.
function* guardStepAside() {
  const g = this.npc('guard'), spots = new Set(['17,21', '19,21', '17,18', '19,18']);
  for (let i = 0; i < 10 && !spots.has(`${g.x},${g.y}`); i++) {
    const d = this.bfsDir(g, (x, y) => spots.has(`${x},${y}`), true);
    if (!d) break;
    const [dx, dy] = DIRV[d], nx = g.x + dx, ny = g.y + dy, p = this.p;
    if (p.x === nx && p.y === ny && !this.shove(p, d)) { p.x = g.x; p.y = g.y; p.px = p.x * 16; p.py = p.y * 16; } // no room: swap
    const other = this.npcAt(nx, ny);
    if (other && other !== g && !this.shove(other, d)) break;
    yield () => !this.p.moving && !(other && other.moving);
    if (!this.free(nx, ny, g)) break;
    this.move(g, d, NPC_SPEED); g.t = 0;
    yield () => !g.moving;
  }
  g.dir = g.x < 18 ? 'right' : 'left';
  G.flags.guard = 1;
}

// The last witch you talk to hands over the Crimson Cow: she tosses the bottle to you,
// you hold it up, then drink it.
function* potionScene(w) {
  G.flags.potion = 1;
  const p = this.p;
  yield* talk(QUEST.give, false, null, w.name);
  // toss: an arc from her hands to above your head
  const sx = w.px + 8, sy = w.py + 2, ex = p.px + 8, ey = p.py - 10, t0 = this.time;
  Audio.sfx('select');
  this.prop = { x: sx, y: sy };
  while (this.time - t0 < 0.7) {
    const k = (this.time - t0) / 0.7;
    this.prop.x = sx + (ex - sx) * k; this.prop.y = sy + (ey - sy) * k - Math.sin(k * Math.PI) * 20;
    if (Math.random() < 0.4) parts.push({ k: 'spark', x: this.prop.x, y: this.prop.y, vx: 0, vy: 0, life: 0.3, col: C.red, world: true });
    yield null;
  }
  // hold it up
  this.prop = { x: ex, y: ey }; p.dir = 'down';
  Audio.sfx('item');
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; parts.push({ k: 'spark', x: ex, y: ey, vx: Math.cos(a) * 26, vy: Math.sin(a) * 26, life: 0.6, col: i % 2 ? '#ffd27a' : '#ffffff', world: true }); }
  yield* talk(QUEST.gotPotion);
  yield* talk(QUEST.drinkIt, false, null, w.name);
  // drink: down to your mouth, then gone
  const t1 = this.time;
  while (this.time - t1 < 0.5) { this.prop.y = ey + (p.py + 4 - ey) * ((this.time - t1) / 0.5); yield null; }
  yield wait(0.3);
  this.prop = null;
  Audio.sfx('sparkle');
  for (let i = 0; i < 16; i++) parts.push({ k: 'spark', x: p.px + 8 + (Math.random() - 0.5) * 14, y: p.py + 4, vx: 0, vy: -14 - Math.random() * 10, life: 0.8, col: i % 2 ? C.red : '#ffd27a', world: true });
  yield* talk(QUEST.drink);
  G.flags.wingsDue = 1;
}

// Back outside: the Crimson Cow kicks in.
function* wingsScene() {
  yield wait(0.6);
  Audio.sfx('sparkle');
  for (let i = 0; i < 20; i++) { const a = Math.random() * Math.PI * 2; parts.push({ k: 'spark', x: this.p.px + 8, y: this.p.py + 6, vx: Math.cos(a) * 30, vy: Math.sin(a) * 30, life: 0.7, col: i % 2 ? '#ffffff' : '#ffd27a', world: true }); }
  G.flags.wings = 1;
  yield wait(0.6);
  yield* talk(QUEST.wings, false, null, G.name);
}

function* wizardScene() {
  G.flags.met = 1;
  const wiz = this.npc('wizard');
  this.p.dir = 'up';
  yield wait(0.3);
  const word = G.armed.word;
  yield* talk([...SCRIPT.wizard1.map(wz), word ? askWord() : ask(), ...(word ? SCRIPT.wizard2Word : SCRIPT.wizard2).map(wz)], true, null, 'WIZARD');
  // the wind returns
  Audio.stopMusic();
  wiz.frame = 1;
  Audio.wind(3.2);
  Audio.sfx('sparkle');
  const t0 = this.time;
  const [cx, cy] = this.cam;
  while (this.time - t0 < 3) {
    const k = (this.time - t0) / 3;
    this.fx.dark = Math.min(0.65, k * 0.8);
    if (Math.random() < 0.5 + k) parts.push({ k: 'wind', x: cx - 30, y: cy + Math.random() * VH, vx: 160 + Math.random() * 120, vy: (Math.random() - 0.5) * 20, len: 6 + (Math.random() * 14 | 0), life: 1.4, world: true, col: `rgba(200,240,255,${0.3 + k * 0.5})` });
    if (Math.random() < 0.3 + k) {
      const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 30, ox = wiz.px + 15, oy = wiz.py - 6;
      parts.push({ k: 'spark', x: ox + Math.cos(a) * r, y: oy + Math.sin(a) * r, vx: -Math.cos(a) * r * 1.6, vy: -Math.sin(a) * r * 1.6, life: 0.6, col: C.cyan, world: true });
    }
    yield null;
  }
  Audio.sfx('flash');
  this.fx.flash = 1.2;
  this.cardCanvas = null;
  this.card = { t: 0, ...armedReveal(), waitA: true };
  setTimeout(() => Audio.music('fanfare'), 250);
  for (let i = 0; i < 30; i++) parts.push({ k: 'wind', x: cx - Math.random() * 60, y: cy + Math.random() * VH, vx: 200 + Math.random() * 100, vy: 0, len: 8 + (Math.random() * 10 | 0), life: 1.5, world: true });
  yield () => !this.card.waitA && this.card.t > 1.2;
  const said = this.card.word || cardName(this.card.v, this.card.s);
  yield* talk(henWizard() ? [`BUK BUK... ${said}!`, wz('FAREWELL, {N}.')] : SCRIPT.wizard3, true, 'bottom', 'WIZARD');
  yield wait(0.3);
  fadeTo(() => setScene(End), 0.6);
}

// ================================================================ the end
const End = {
  enter() {
    this.t = 0; this.cc = revealCanvas(armedReveal());
    Audio.music('end');
  },
  update(dt) {
    this.t += dt;
    if (Math.random() < dt * 14) parts.push({ k: 'wind', x: -20, y: Math.random() * VH, vx: 90 + Math.random() * 80, vy: 0, len: 4 + (Math.random() * 10 | 0), life: 2.5, col: 'rgba(220,240,255,0.5)' });
    if (Math.random() < dt * 3) parts.push({ k: 'leaf', x: -4, y: Math.random() * VH * 0.8, vx: 50 + Math.random() * 40, vy: 8 + Math.random() * 10, life: 4, col: ['#8a9a4a', '#c8902a', '#a8442e'][Math.random() * 3 | 0] });
    if (Math.random() < dt * 3) mote(Math.random() * VW, VH * (0.5 + Math.random() * 0.5));
    updateParts(dt);
  },
  draw() {
    drawBackdrop(this.t, true);
    drawParts();
    const cx = VW / 2;
    textCenter(ctx, 'THE END', cx, Math.round(VH * 0.08), C.gold, 2, C.ink);
    const cy = Math.round(VH * 0.42);
    ctx.drawImage(this.cc, Math.round(cx - this.cc.width / 2), Math.round(cy - this.cc.height / 2) + Math.round(Math.sin(this.t * 1.6)));
    const by = Math.max(cy + 40, Math.round(VH * 0.68));
    box(ctx, Math.round(cx - 66), by, 132, 28);
    textCenter(ctx, 'THANKS FOR PLAYING,', cx, by + 7, UI.text);
    textCenter(ctx, G.name + '!', cx, by + 17, UI.accent);
    drawVignette();
  },
  onA() { if (this.t > 3) fadeTo(() => setScene(Title), 0.5); },
  onTap() { this.onA(); },
};

// ================================================================ loop
function update(dt) {
  G.time += dt;
  if (G.fade) {
    const f = G.fade; f.t += dt;
    if (f.out && f.t >= f.dur) { f.out = false; f.t = 0; f.fn(); }
    else if (!f.out && f.t >= f.dur) G.fade = null;
  }
  G.scene.update(dt);
  if (G.scene !== Play && G.scene !== End) updateParts(dt);
}
function draw() {
  G.scene.draw();
  if (G.fade) {
    const k = G.fade.out ? G.fade.t / G.fade.dur : 1 - G.fade.t / G.fade.dur;
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, Math.ceil(k * 4) / 4)})`; ctx.fillRect(0, 0, VW, VH);
  }
}
let last = performance.now();
function frame(now) {
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
  update(dt); draw();
  requestAnimationFrame(frame);
}

// Debug: ?scene=world|castle|end jumps ahead with a test hero.
const dbg = new URLSearchParams(location.search).get('scene');
if (dbg) {
  G.name = 'KEN'; G.hero = makeHero(G.name, +(new URLSearchParams(location.search).get('cls') || 0));
  if (!G.armed.v && !G.armed.word) G.armed = { v: 7, s: 'D' };
  if (dbg === 'end') setScene(End);
  else if (dbg === 'name') setScene(NameEntry);
  else if (dbg === 'hero' || dbg === 'class') setScene(ClassScene);
  else {
    setScene(Play); Play.start(); Play.script = null; D.active = false;
    if (dbg === 'castle') Play.load('castle', 4, 7, 'up');
    if (dbg === 'world') Play.load('world', 15, 40, 'down');
    if (dbg === 'north') Play.load('world', 18, 18, 'up');
  }
} else setScene(Title);
requestAnimationFrame(frame);
window.__G = G; window.__D = D; window.__SKY = SKY; window.__audio = Audio.audioState; window.__ac = Audio.audioCtx;
window.__sceneName = () => (G.scene === Title ? 'title' : G.scene === NameEntry ? 'name' : G.scene === ClassScene ? 'class' : G.scene === Play ? 'play' : 'end');
