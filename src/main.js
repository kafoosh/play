import { C, UI, text, textCenter, textWidth, wrap, box, blob, drawCard, makeScroll, charSprite, drawTile, drawOver, flame, makeCanvas, hash, shade, VALUE_LABEL } from './art.js';
import { MAPS, LOOKS, NPCS, SCRIPT, cardName, decodeWord, VALUE_GRID, CHASED, CLASSES, SKINS, HAIRS } from './data.js';
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
  document.body.classList.toggle('playing', s === Play); // controls only while exploring
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

const KEYDIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  Audio.unlock();
  if (G.scene.onKey && !G.fade && G.scene.onKey(e)) { e.preventDefault(); return; }
  const d = KEYDIR[e.key.length === 1 ? e.key.toLowerCase() : e.key];
  if (d) { e.preventDefault(); if (!e.repeat) dirDown(d); return; }
  if (['z', 'x', ' ', 'enter'].includes(e.key.toLowerCase())) { e.preventDefault(); if (!e.repeat) pressA(); }
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
document.addEventListener('visibilitychange', () => Audio.setPaused(document.hidden));

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
  const a = pad.getBoundingClientRect(), b = btnA.getBoundingClientRect();
  const s = VW / screen.getBoundingClientRect().width;
  if (!a.height) return;
  const x0 = Math.ceil(a.right * s) + 3, x1 = Math.floor(b.left * s) - 3;
  if (x1 - x0 >= 170) { UIX0 = x0; UIX1 = x1; } // text box fits between the controls
  else UIB = Math.floor(Math.min(a.top, b.top) * s) - 4;
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
    p.life -= dt; p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt;
    if (p.k === 'spark') { p.vx *= 0.92; p.vy *= 0.92; }
    if (p.k === 'z' || p.k === 'note') p.x += Math.sin(p.life * 5) * 0.3;
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
    else if (p.k === 'leaf') { ctx.fillStyle = p.col; ctx.fillRect(x, y, 2, 1); ctx.fillRect(x + (p.life * 4 % 2 > 1 ? 1 : 0), y + 1, 1, 1); }
  }
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
const STARS = Array.from({ length: 50 }, (_, i) => ({ x: hash(i, 1), y: hash(i, 2), p: hash(i, 3) * 6 }));
let deco = null;
function backdropArt() {
  if (deco) return deco;
  const cloud = night => {
    const [c, x] = makeCanvas(44, 20);
    blob(x, 2, 2, [[9, 11, 6], [18, 8, 8], [28, 9, 7], [35, 12, 5], [20, 13, 6]], night ? { o: '#3e4488', g: '#7a80c8', l: '#9aa0e0', d: '#6268b0' } : { o: '#c890b8', g: '#fff4f4', l: '#ffffff', d: '#f6d8e2' }, 1, false);
    return c;
  };
  const tree = (pal) => {
    const [c, x] = makeCanvas(24, 26);
    x.fillStyle = C.trunkD; x.fillRect(10, 17, 5, 8); x.fillStyle = C.trunk; x.fillRect(11, 17, 3, 7);
    blob(x, 4, 6, [[8, 0.5, 5.2], [3.8, 5.5, 4.6], [12.2, 5.5, 4.6], [8, 6.5, 5.8]], pal, 5);
    return c;
  };
  // a little castle with blue roofs
  const [cs, x] = makeCanvas(72, 52);
  const wallC = (ox, oy, w, h) => { x.fillStyle = C.stoneO; x.fillRect(ox, oy, w, h); x.fillStyle = C.stone; x.fillRect(ox + 1, oy + 1, w - 2, h - 1); x.fillStyle = C.stoneL; x.fillRect(ox + 1, oy + 1, 2, h - 1); x.fillStyle = C.stoneD; x.fillRect(ox + w - 3, oy + 1, 2, h - 1); };
  const cone = (cx, top, half, h) => {
    for (let j = 0; j < h; j++) { const hw = Math.round(1 + j * (half - 1) / (h - 1)); for (let i = -hw; i < hw; i++) { x.fillStyle = (i === -hw || i === hw - 1 || j === h - 1) ? '#2a3a6e' : i < -hw / 3 ? '#8cb8f4' : '#5a8ce0'; x.fillRect(cx + i, top + j, 1, 1); } }
    x.fillStyle = C.ink; x.fillRect(cx, top - 6, 1, 6); x.fillStyle = C.red; x.fillRect(cx + 1, top - 6, 4, 2);
  };
  wallC(14, 26, 44, 26);
  for (let i = 14; i < 58; i += 6) { x.fillStyle = C.stoneO; x.fillRect(i, 23, 4, 4); x.fillStyle = C.stone; x.fillRect(i + 1, 24, 2, 3); }
  wallC(29, 14, 14, 38); cone(36, 3, 9, 12);
  wallC(6, 22, 12, 30); cone(12, 12, 8, 11);
  wallC(54, 22, 12, 30); cone(60, 12, 8, 11);
  x.fillStyle = C.stoneO; x.fillRect(31, 38, 10, 14); x.fillStyle = '#3a2a4a'; x.fillRect(32, 39, 8, 13); x.fillStyle = C.wood; x.fillRect(32, 40, 2, 12); x.fillRect(38, 40, 2, 12);
  x.fillStyle = '#ffe9a0';
  for (const [a, b] of [[35, 20], [10, 30], [58, 30], [20, 34], [48, 34]]) { x.fillRect(a, b, 2, 4); }
  deco = {
    cloud: cloud(false), cloudN: cloud(true), castle: cs,
    tree: tree({ o: C.leafO, g: C.leaf, l: C.leafL, d: C.leafD }),
    pine: tree({ o: C.pineO, g: C.pine, l: C.pineL, d: C.pineD }),
  };
  return deco;
}
function drawBackdrop(t, night = false) {
  const art = backdropArt();
  const H = Math.round(VH * 0.62);
  const sky = night ? ['#141a3a', '#1c2450', '#283068', '#363c80', '#4a4a96'] : ['#3a4a96', '#5462b4', '#7e7ccc', '#c892c8', '#ffbfa8'];
  const bh = Math.ceil(H / sky.length);
  for (let i = 0; i < sky.length; i++) {
    ctx.fillStyle = sky[i]; ctx.fillRect(0, i * bh, VW, bh + 1);
    if (i) { ctx.fillStyle = sky[i - 1]; for (let x = 0; x < VW; x += 2) { ctx.fillRect(x + (i % 2), i * bh, 1, 1); ctx.fillRect(x, i * bh + 2, 1, 1); } }
  }
  for (const s of STARS) {
    if (!night && s.y > 0.45) continue;
    const b = Math.sin(t * 2 + s.p), sx = (s.x * VW) | 0, sy = (s.y * H * 0.8) | 0;
    if (b > -0.3) { ctx.fillStyle = b > 0.7 ? '#ffffff' : '#c8c8f0'; ctx.fillRect(sx, sy, 1, 1); if (b > 0.94) { ctx.fillRect(sx - 1, sy, 3, 1); ctx.fillRect(sx, sy - 1, 1, 3); } }
  }
  // moon
  const mx = Math.round(VW * 0.82), my = Math.round(H * 0.18);
  ctx.fillStyle = '#fff6d0'; ctx.fillRect(mx - 4, my - 5, 9, 11); ctx.fillRect(mx - 5, my - 4, 11, 9);
  ctx.fillStyle = '#f2e2a8'; ctx.fillRect(mx - 2, my - 2, 2, 2); ctx.fillRect(mx + 2, my + 1, 2, 1);
  // clouds drift by
  for (let i = 0; i < 3; i++) {
    const span = VW + 60, x = ((hash(i, 5) * span + t * (3 + i * 1.5)) % span) - 50, y = Math.round(H * (0.22 + i * 0.17));
    ctx.drawImage(night ? art.cloudN : art.cloud, Math.round(x), y);
  }
  // far hills
  ctx.fillStyle = night ? '#2c3a6a' : '#7a86c8';
  for (let x = 0; x < VW; x++) { const h = H - 14 + Math.round(Math.sin(x / 23) * 4 + Math.sin(x / 9 + 2) * 2); ctx.fillRect(x, h, 1, VH - h); }
  ctx.drawImage(art.castle, Math.round(VW / 2 - 36), H - 47);
  // near hills and meadow
  for (let x = 0; x < VW; x++) {
    const h = H + Math.round(Math.sin(x / 31 + 1) * 3);
    ctx.fillStyle = night ? '#3f7a44' : C.grassL; ctx.fillRect(x, h, 1, 2);
    ctx.fillStyle = night ? '#356a3a' : C.grass; ctx.fillRect(x, h + 2, 1, VH - h);
  }
  for (let i = 0; i < 24; i++) {
    const a = (hash(i, 31) * VW) | 0, b = H + 6 + ((hash(i, 32) * (VH - H - 8)) | 0);
    ctx.fillStyle = night ? '#2c5a32' : C.grassD; ctx.fillRect(a, b + 1, 1, 1); ctx.fillRect(a + 1, b, 1, 2); ctx.fillRect(a + 3, b, 1, 2); ctx.fillRect(a + 4, b + 1, 1, 1);
  }
  const trees = [[0.04, 0], [0.16, 1], [0.84, 1], [0.95, 0], [-0.02, 1]];
  for (const [fx, k] of trees) ctx.drawImage(k ? art.pine : art.tree, Math.round(fx * VW) - 6, H - 20 + (k ? 0 : 2));
  if (night) { ctx.fillStyle = 'rgba(20,20,60,0.25)'; ctx.fillRect(0, H, VW, VH - H); }
}
// Draw a fixed 160x144 layout in the middle of the screen; returns the offset.
function centre() { return [Math.round((VW - 160) / 2), Math.round((VH - 144) / 2)]; }

// ================================================================ title
// START sits on the meadow. Everything above it is the secret value grid.
function startBox() {
  const w = 72, h = 16;
  return { x: Math.round((VW - w) / 2), y: Math.min(VH - 40, Math.round(VH * 0.74)), w, h };
}
const Title = {
  enter() {
    this.t = 0; this.cheat = false; this.go = false; this.credit = []; this.petals = [];
    Audio.music('title');
  },
  update(dt) {
    this.t += dt;
    if (Math.random() < dt * 1.5) this.petals.push({ x: -4, y: Math.random() * VH * 0.7, p: Math.random() * 6, v: 14 + Math.random() * 10, col: ['#ffb0c8', '#ffffff', '#ffe066'][Math.random() * 3 | 0] });
    for (const f of this.petals) { f.x += f.v * dt; f.y += Math.sin(this.t * 2 + f.p) * 0.2 + dt * 4; }
    this.petals = this.petals.filter(f => f.x < VW + 4);
  },
  draw() {
    drawBackdrop(this.t);
    for (const f of this.petals) { ctx.fillStyle = f.col; ctx.fillRect(f.x | 0, f.y | 0, 2, 1); ctx.fillRect((f.x | 0) + (Math.sin(this.t * 6 + f.p) > 0 ? 1 : 0), (f.y | 0) + 1, 1, 1); }
    const bob = Math.round(Math.sin(this.t * 1.5)), cx = VW / 2, ly = Math.round(VH * 0.12);
    textCenter(ctx, 'ODDPAQ', cx + 2, ly + 3 + bob, '#2a1a3a', 3);
    textCenter(ctx, 'ODDPAQ', cx, ly + bob, C.gold, 3, C.ink);
    ctx.fillStyle = '#fff6b0'; ctx.fillRect(Math.round(cx - 50), ly + bob + 3, 2, 2);
    textCenter(ctx, 'WINDS OF WONDER', cx, ly + 28, '#ffffff', 1, C.ink);
    const S = startBox();
    box(ctx, S.x, S.y, S.w, S.h, this.go ? '#ffe6a0' : UI.paper);
    if (!this.go || Math.floor(this.t * 12) % 2) textCenter(ctx, 'START', cx, S.y + 5, UI.text);
    if (!this.go && (this.t % 1.1) < 0.7) { text(ctx, '▶', S.x - 9, S.y + 5, '#ffffff'); }
    textCenter(ctx, '@ODDPAQ', cx, VH - 12, '#eaffd8', 1, '#2f6a3a');
    drawParts();
    if (this.cheat) drawCheat();
  },
  onTap(x, y) {
    if (this.go) return;
    if (this.cheat) { this.cheat = false; return; }
    spark(x, y, 5, '#ffffff');
    // performer cheat sheet: triple-tap the credit
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
    const top = S.y - 4;
    if (y < top && !G.locked) {
      const row = Math.min(3, Math.floor(y / (top / 4)));
      G.armed.v = row < 3 ? VALUE_GRID[row][Math.max(0, Math.min(3, Math.floor(x / (VW / 4))))] : 13;
    }
  },
  onA() { if (!this.cheat) this.begin(); else this.cheat = false; },
  begin() {
    if (this.go) return;
    this.go = true; Audio.sfx('start');
    const S = startBox();
    spark(VW / 2, S.y + 8, 12, C.gold);
    setTimeout(() => fadeTo(() => setScene(NameEntry), 0.3), 450);
  },
};
function drawCheat() {
  ctx.fillStyle = 'rgba(30,20,40,0.5)'; ctx.fillRect(0, 0, VW, VH);
  const [ox, oy] = centre();
  ctx.save(); ctx.translate(ox, oy);
  box(ctx, 6, 6, 148, 132);
  textCenter(ctx, 'CHEAT SHEET', 80, 13, UI.accent);
  const gx = 20, gy = 24, cw = 30, ch = 13;
  VALUE_GRID.forEach((row, j) => row.forEach((v, i) => {
    ctx.fillStyle = UI.paperD; ctx.fillRect(gx + i * cw, gy + j * ch, cw - 2, ch - 2);
    textCenter(ctx, VALUE_LABEL[v], gx + i * cw + cw / 2 - 1, gy + j * ch + 2, UI.text);
  }));
  ctx.fillStyle = UI.paperD; ctx.fillRect(gx, gy + 3 * ch, cw * 4 - 2, ch - 2);
  textCenter(ctx, 'K', gx + cw * 2 - 1, gy + 3 * ch + 2, UI.text);
  text(ctx, 'TAP THE SKY FOR VALUE', 18, 79, UI.dim);
  ['C', 'H', 'S', 'D'].forEach((s, i) => {
    ctx.fillStyle = '#ecc890'; ctx.fillRect(32 + i * 24, 90, 22, 12);
    textCenter(ctx, s, 43 + i * 24, 93, s === 'H' || s === 'D' ? C.red : UI.text);
  });
  text(ctx, 'START = SUIT', 44, 105, UI.dim);
  const a = G.armed;
  const lab = a.v || a.s ? `${a.v ? VALUE_LABEL[a.v] : '?'}${a.s ? { C: '♣', H: '♥', S: '♠', D: '♦' }[a.s] : '?'}` : '--';
  textCenter(ctx, a.word ? 'WORD: ' + a.word.slice(0, 16) : 'ARMED: ' + lab + (G.locked ? ' (URL)' : ''), 80, 116, UI.accent);
  textCenter(ctx, 'TAP TO CLOSE', 80, 126, UI.dim);
  ctx.restore();
}

// ================================================================ name entry
const LETTERS = ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ-'];
const NameEntry = {
  enter() { this.name = ''; this.r = 0; this.c = 0; this.t = 0; },
  update(dt) { this.t += dt; },
  cell(r, c) { return r < 3 ? { x: 9 + c * 16, y: 52 + r * 15, w: 14, h: 13 } : (c < 5 ? { x: 9, y: 98, w: 46, h: 13 } : { x: 105, y: 98, w: 46, h: 13 }); },
  draw() {
    drawBackdrop(this.t);
    const [ox, oy] = centre();
    ctx.save(); ctx.translate(ox, oy);
    box(ctx, 0, 0, 160, 144);
    textCenter(ctx, 'WHAT IS YOUR NAME?', 80, 8, UI.accent);
    box(ctx, 22, 20, 116, 24, '#ffffff');
    for (let i = 0; i < 8; i++) {
      const ch = this.name[i];
      if (ch) text(ctx, ch, 32 + i * 12, 25, UI.text, 2);
      else if (i === this.name.length && Math.floor(this.t * 3) % 2) { ctx.fillStyle = UI.accent; ctx.fillRect(32 + i * 12, 38, 10, 2); }
      else { ctx.fillStyle = UI.paperD; ctx.fillRect(32 + i * 12, 38, 10, 1); }
    }
    for (let r = 0; r < 4; r++) for (let c = 0; c < (r < 3 ? 9 : 2); c++) {
      const cc = r < 3 ? c : c * 5;
      const b = this.cell(r, cc), sel = this.r === r && (r < 3 ? this.c === c : (this.c < 5 ? 0 : 1) === c);
      if (sel) { ctx.fillStyle = '#ffe6a0'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle = UI.accent; ctx.fillRect(b.x, b.y + b.h - 1, b.w, 1); }
      const label = r < 3 ? LETTERS[r][c] : (c ? 'END' : 'DEL');
      textCenter(ctx, label, b.x + b.w / 2, b.y + 3, sel ? UI.accent : UI.text);
    }
    textCenter(ctx, 'PICK LETTERS. THEN END.', 80, 126, UI.dim);
    drawParts();
    ctx.restore();
  },
  onDir(d) {
    Audio.sfx('move');
    if (d === 'up') this.r = (this.r + 3) % 4;
    if (d === 'down') this.r = (this.r + 1) % 4;
    if (this.r === 3) { if (d === 'left' || d === 'right') this.c = this.c < 5 ? 8 : 0; }
    else {
      if (d === 'left') this.c = (this.c + 8) % 9;
      if (d === 'right') this.c = (this.c + 1) % 9;
    }
  },
  pick() {
    if (this.r < 3) this.add(LETTERS[this.r][this.c]);
    else if (this.c < 5) this.del();
    else this.done();
  },
  add(ch) { if (this.name.length < 8) { this.name += ch; Audio.sfx('select'); } else Audio.sfx('bump'); },
  del() { if (this.name.length) { this.name = this.name.slice(0, -1); Audio.sfx('move'); } },
  done() {
    const n = this.name.replace(/^-+|-+$/g, '');
    if (!n) { Audio.sfx('bump'); return; }
    G.name = n; Audio.sfx('start');
    fadeTo(() => setScene(HeroScene), 0.3);
  },
  onA() { this.pick(); },
  onTap(x, y) {
    const [ox, oy] = centre(); x -= ox; y -= oy;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
      if (r === 3 && c !== 0 && c !== 5) continue;
      const b = this.cell(r, c);
      if (x >= b.x - 1 && x < b.x + b.w + 1 && y >= b.y - 1 && y < b.y + b.h + 1) { this.r = r; this.c = c; this.pick(); return; }
    }
  },
  onKey(e) {
    const k = e.key;
    if (/^[a-z]$/i.test(k)) { this.add(k.toUpperCase()); return true; }
    if (k === '-') { this.add('-'); return true; }
    if (k === 'Backspace') { this.del(); return true; }
    if (k === 'Enter') { this.done(); return true; }
    return false;
  },
};

// ================================================================ hero
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function makeHero(name, roll) {
  let h = 2166136261;
  for (const ch of name + '#' + roll) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const r = rng(h), pick = a => a[Math.floor(r() * a.length)];
  const cls = CLASSES[Math.floor(r() * CLASSES.length)];
  const tunic = pick(cls.tunics);
  const look = {
    kind: 'person', key: 'hero:' + name + ':' + roll, skin: pick(SKINS), hair: pick(HAIRS), tunic,
    acc: cls.acc, hood: shade(tunic, 0.85), cap: pick(['#c04a3e', '#2f6f8a', '#3a9a5a', '#d9b45a']), long: r() < 0.4, boots: '#4a2d1a',
  };
  const magic = cls.name === 'MAGE' || cls.name === 'CLERIC';
  return { look, cls: cls.name, hp: 10 + Math.floor(r() * 8) - (magic ? 3 : 0), mp: magic ? 8 + Math.floor(r() * 6) : Math.floor(r() * 4) };
}
const HeroScene = {
  enter() { this.roll = 0; this.t = 0; this.choice = 0; G.hero = makeHero(G.name, 0); },
  update(dt) { this.t += dt; },
  draw() {
    drawBackdrop(this.t);
    const [ox, oy] = centre();
    ctx.save(); ctx.translate(ox, oy);
    textCenter(ctx, 'A HERO APPEARS!', 80, 4, '#ffffff', 1, C.ink);
    // grassy spot to stand on
    ctx.fillStyle = C.grassDD; ctx.fillRect(50, 72, 60, 10); ctx.fillRect(56, 70, 48, 14);
    ctx.fillStyle = C.grass; ctx.fillRect(52, 72, 56, 7); ctx.fillRect(58, 70, 44, 10);
    ctx.fillStyle = C.grassL; ctx.fillRect(60, 71, 30, 1);
    ctx.fillStyle = 'rgba(40,60,30,0.45)'; ctx.fillRect(62, 74, 36, 4);
    const dirs = ['down', 'left', 'up', 'right'];
    const dir = dirs[Math.floor(this.t / 1.2) % 4], frame = [0, 1, 0, 2][Math.floor(this.t * 6) % 4];
    ctx.drawImage(charSprite(G.hero.look, dir, frame), 48, 13, 64, 64);
    const h = G.hero;
    box(ctx, 14, 82, 132, 39);
    text(ctx, 'NAME', 22, 88, UI.dim); text(ctx, G.name, 64, 88, UI.text);
    text(ctx, 'CLASS', 22, 98, UI.dim); text(ctx, h.cls, 64, 98, UI.text);
    text(ctx, 'LV 1', 22, 108, UI.dim); text(ctx, `HP ${h.hp}  MP ${h.mp}`, 64, 108, UI.text);
    box(ctx, 6, 123, 148, 20);
    text(ctx, 'IS THIS YOU?', 14, 130, UI.text);
    text(ctx, 'YES', 104, 130, this.choice === 0 ? UI.accent : UI.text);
    text(ctx, 'NO', 134, 130, this.choice === 1 ? UI.accent : UI.text);
    text(ctx, '▶', this.choice === 0 ? 97 : 127, 130, UI.accent);
    drawParts();
    ctx.restore();
  },
  onDir(d) { if (d === 'left' || d === 'right') { this.choice = 1 - this.choice; Audio.sfx('move'); } },
  onA() { this.choose(this.choice); },
  onTap(x, y) { const [ox, oy] = centre(); x -= ox; y -= oy; if (y > 120 && x > 90) this.choose(x < 124 ? 0 : 1); },
  choose(i) {
    if (i === 1) {
      this.roll++; G.hero = makeHero(G.name, this.roll); Audio.sfx('sparkle'); spark(80, 48, 14, C.cyan); this.choice = 0;
      return;
    }
    Audio.sfx('start');
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
  m.flames = [];
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    const k = tiles[ty][tx][0];
    if (k === 'torch') m.flames.push({ x: tx * 16 + 8, y: ty * 16 + 7, big: false });
    if (k === 'hearth') m.flames.push({ x: tx * 16 + 8, y: ty * 16 + 15, big: true });
  }
  return (mapCache[name] = m);
}

const SPEED = 5, NPC_SPEED = 2.6;
const Play = {
  start() {
    G.flags = {};
    this.npcs = NPCS.map(n => ({
      ...n, look: LOOKS[n.look], dir: n.dir || 'down', px: n.x * 16, py: n.y * 16, home: { x: n.x, y: n.y },
      moving: false, t: 0, timer: 1 + Math.random() * 2, frame: 0, anim: Math.random() * 3, talked: 0,
    }));
    this.load('home', 2, 3, 'right');
    const wake = SCRIPT.wake.slice();
    if (!window.matchMedia('(pointer: coarse)').matches) wake[2] = 'USE THE ARROW KEYS TO WALK. PRESS Z TO TALK OR LOOK.';
    this.run(function* () { yield wait(0.7); yield* talk(wake); });
  },
  load(mapName, x, y, dir) {
    this.map = loadMap(mapName);
    this.p = { x, y, px: x * 16, py: y * 16, dir, moving: false, t: 0, anim: 0 };
    this.time = this.time || 0; this.fx = { dark: 0, flash: 0 }; this.card = null; this.bumpT = 0;
    parts = [];
    this.flies = [];
    if (mapName === 'world') for (let i = 0; i < 7; i++) {
      const spots = [[10, 24], [20, 30], [6, 35], [14, 36], [22, 23], [4, 31], [24, 12]];
      this.flies.push({ x: spots[i][0] * 16, y: spots[i][1] * 16, p: Math.random() * 9, col: ['#ffffff', '#f3e04a', '#f08aa8'][i % 3] });
    }
    Audio.music(this.map.def.music);
  },
  run(gen) { this.script = gen.call(this); this.waitFn = null; },
  npcsHere() { return this.npcs.filter(n => n.map === this.map.name); },
  npcAt(x, y) { return this.npcsHere().find(n => (n.x === x && n.y === y) || (n.moving && n.tx === x && n.ty === y)); },
  npc(id) { return this.npcs.find(n => n.id === id); },
  free(x, y, who) {
    if (this.map.solid(x, y) || this.map.def.warps[`${x},${y}`] && who !== this.p) return false;
    const p = this.p;
    if (who !== p && ((p.x === x && p.y === y) || (p.moving && p.tx === x && p.ty === y))) return false;
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
      if (n.moving) { if (this.step(n, dt)) n.t = 0; n.frame = [0, 1, 0, 2][Math.floor(n.anim * 7) % 4]; continue; }
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
    // effects
    this.fx.flash = Math.max(0, this.fx.flash - dt * 1.4);
    if (this.card) this.card.t += dt;
    updateParts(dt);
  },
  tryMove() {
    const p = this.p, d = heldDir();
    if (!d) return;
    p.dir = d;
    const [dx, dy] = DIRV[d], nx = p.x + dx, ny = p.y + dy;
    const n = this.npcAt(nx, ny);
    if (!n && this.free(nx, ny, p)) { this.move(p, d, SPEED); return; }
    if (n && n.bump && !n.moving) { this.talkTo(n); return; }
    if (this.bumpT <= 0) { Audio.sfx('bump'); this.bumpT = 0.3; }
  },
  onStep() {
    const p = this.p, m = this.map;
    const w = m.def.warps[`${p.x},${p.y}`];
    if (w) { Audio.sfx('door'); fadeTo(() => this.load(w.map, w.x, w.y, w.dir), 0.25); return; }
    if (m.name === 'castle') {
      if (p.y <= 6 && !G.flags.closer) { G.flags.closer = 1; this.run(function* () { yield* talk(SCRIPT.comeCloser, true, null, 'WIZARD'); }); }
      if (p.y <= 4 && !G.flags.met) { p.dir = 'up'; this.run(wizardScene); }
    }
  },
  onDir(d) {
    if (D.active) dialogDir(d);
    else if (!this.script && !this.p.moving) this.p.dir = d; // a quick tap still turns you
  },
  onA() {
    if (this.card && this.card.waitA) { this.card.waitA = false; return; }
    if (D.active) { dialogA(); return; }
    if (this.script || this.p.moving) return;
    const p = this.p, [dx, dy] = DIRV[p.dir], fx = p.x + dx, fy = p.y + dy;
    let n = this.npcAt(fx, fy);
    const kind = this.map.kind(fx, fy);
    if (!n && kind === 'stall') n = this.npcAt(fx + dx, fy + dy);
    if (n) { this.talkTo(n); return; }
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
    const lines = n.talked && n.again ? n.again : n.talk;
    n.talked++;
    say(lines, {
      name: n.name,
      onEnd: () => {
        if (n.id === 'guard' && !G.flags.guard) {
          G.flags.guard = 1;
          if (this.free(n.x - 1, n.y, n)) { this.move(n, 'left', NPC_SPEED); n.t = 0; setTimeout(() => { n.dir = 'right'; }, 450); }
        }
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
    for (const f of m.flames) flame(ctx, f.x - cx, f.y - cy, this.time + f.x, f.big);
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
    // characters, back to front
    const ents = this.npcsHere().map(n => ({ n, y: n.py }));
    ents.push({ n: null, y: p.py });
    ents.sort((a, b) => a.y - b.y);
    let wiz = null;
    for (const e of ents) {
      if (!e.n) {
        const frame = p.moving ? [0, 1, 0, 2][Math.floor(p.anim * 8) % 4] : 0;
        ctx.drawImage(charSprite(G.hero.look, p.dir, frame), p.px - cx, p.py - cy - 2);
        continue;
      }
      const n = e.n;
      if (n.tall) { wiz = n; this.drawWizard(n, cx, cy); continue; }
      if (n.spear) {
        ctx.fillStyle = C.ink; ctx.fillRect(n.px - cx + 13, n.py - cy - 5, 3, 19);
        ctx.fillStyle = C.woodL; ctx.fillRect(n.px - cx + 14, n.py - cy - 4, 1, 17);
        ctx.fillStyle = C.stoneL; ctx.fillRect(n.px - cx + 14, n.py - cy - 8, 1, 3);
      }
      const look = n.look;
      ctx.drawImage(charSprite(look, n.dir, n.frame), n.px - cx, n.py - cy - (look.kind === 'person' && !n.sleep ? 2 : 0));
    }
    // talk bubble when facing someone
    if (!D.active && !this.script && !p.moving) {
      const [dx, dy] = DIRV[p.dir];
      let n = this.npcAt(p.x + dx, p.y + dy);
      if (!n && m.kind(p.x + dx, p.y + dy) === 'stall') n = this.npcAt(p.x + dx * 2, p.y + dy * 2);
      if (n && !n.moving) {
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
    drawParts(cx, cy);
    if (this.card) this.drawReveal();
    if (this.fx.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, this.fx.flash)})`; ctx.fillRect(0, 0, VW, VH); }
    this.dialogY = dialogBoxY(p.py - cy);
    drawDialog(this.dialogY);
  },
  drawWizard(n, cx, cy) {
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
const ask = (q = SCRIPT.ask) => ({ ask: q, yes: [], no: () => [...SCRIPT.askNo, ask(SCRIPT.askAgain)] });
const askWord = (q = SCRIPT.askWord) => ({ ask: q, yes: [], no: () => [...SCRIPT.askNoWord, askWord(SCRIPT.askAgain)] });
// The thing the wizard reveals: the armed word on a scroll, or the armed card.
const armedReveal = () => (G.armed.word ? { word: G.armed.word } : armedCard());
function revealCanvas(r) {
  if (r.word) return makeScroll(r.word);
  const [c, x] = makeCanvas(48, 64); drawCard(x, 0, 0, r.v, r.s); return c;
}

function* wizardScene() {
  G.flags.met = 1;
  const wiz = this.npc('wizard');
  this.p.dir = 'up';
  yield wait(0.3);
  const word = G.armed.word;
  yield* talk([...SCRIPT.wizard1, word ? askWord() : ask(), ...(word ? SCRIPT.wizard2Word : SCRIPT.wizard2)], true, null, 'WIZARD');
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
  yield* talk(SCRIPT.wizard3, true, 'bottom', 'WIZARD');
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
    if (Math.random() < dt * 3) parts.push({ k: 'leaf', x: -4, y: Math.random() * VH * 0.8, vx: 50 + Math.random() * 40, vy: 8 + Math.random() * 10, life: 4, col: ['#7cc35f', '#f3c646', '#e0705a'][Math.random() * 3 | 0] });
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
    if (this.t > 3 && Math.floor(this.t * 2) % 2) textCenter(ctx, 'PRESS A', cx, VH - 12, '#ffffff', 1, C.ink);
    else textCenter(ctx, '@ODDPAQ', cx, VH - 12, '#eaffd8', 1, '#2f4a3a');
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
  G.name = 'KEN'; G.hero = makeHero(G.name, 0);
  if (!G.armed.v && !G.armed.word) G.armed = { v: 7, s: 'D' };
  if (dbg === 'end') setScene(End);
  else if (dbg === 'name') setScene(NameEntry);
  else if (dbg === 'hero') setScene(HeroScene);
  else {
    setScene(Play); Play.start(); Play.script = null; D.active = false;
    if (dbg === 'castle') Play.load('castle', 4, 7, 'up');
    if (dbg === 'world') Play.load('world', 15, 40, 'down');
    if (dbg === 'north') Play.load('world', 18, 18, 'up');
  }
} else setScene(Title);
requestAnimationFrame(frame);
window.__G = G; window.__D = D;
window.__sceneName = () => (G.scene === Title ? 'title' : G.scene === NameEntry ? 'name' : G.scene === HeroScene ? 'hero' : G.scene === Play ? 'play' : 'end');
