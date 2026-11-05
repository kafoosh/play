// All graphics are drawn in code: a 5x7 bitmap font, string-grid sprites and
// procedural tiles in a soft "cute fantasy" style. Nothing is loaded from disk.

export const C = {
  ink: '#1e1418', white: '#f4ecd8', black: '#000000', eye: '#1a1014',
  grass: '#5f7d3c', grassD: '#4b6531', grassL: '#7a9a4a', grassDD: '#3a4f27', woods: '#465f30',
  path: '#8c8273', pathD: '#726a5e', pathL: '#a89c88', pathE: '#4e463e',
  leaf: '#4a6a32', leafD: '#34502a', leafL: '#6e8c42', leafO: '#18240f', trunk: '#6e4e34', trunkD: '#43301f',
  pine: '#2f4b3a', pineD: '#223a2c', pineL: '#46684e', pineO: '#101a13',
  water: '#3d6a86', waterD: '#2e536c', waterL: '#7aa4b4', waterO: '#1f3a4c',
  wood: '#7e5532', woodD: '#5c3c22', woodL: '#a07448', woodO: '#2a1a10',
  stone: '#8a8a88', stoneD: '#686866', stoneL: '#aeaca6', stoneO: '#323230',
  wall: '#d2c29c', wallD: '#b4a27c',
  gold: '#e8b84a', goldD: '#a8782a', red: '#b8342e', redD: '#7a2222',
  purple: '#5a3a8a', purpleD: '#3a2462', cyan: '#8ae8ff', pink: '#e8a0a8',
  floor: '#8a6240', floorK: '#5e4228', floorL: '#a47852', plaster: '#7a7064', plasterD: '#5e564c',
  cstone: '#6e6a7a', cstoneD: '#58546a', cstoneL: '#8a8698', cstoneO: '#24202e', carpet: '#8e2630', carpetD: '#661a22',
  glass: '#f2c45a', glassL: '#fff0b0',
};
const ROOFS = {
  roof: { b: '#a8823e', d: '#7a5a28', l: '#c8a052', o: '#2e2010', thatch: true },
  roofB: { b: '#4e5668', d: '#383e4e', l: '#6a7488', o: '#16181e' },
  roofN: { b: '#8a4632', d: '#663222', l: '#a85e44', o: '#24120c' },
};
// Text box colours: iron-bound parchment.
export const UI = { paper: '#e9dcb8', paperD: '#d2c098', edge: '#5a3a22', edgeD: '#1c120c', text: '#2a1a12', accent: '#8e1e1e', dim: '#7a6448' };

// ---------------------------------------------------------------- canvas helpers
export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return [c, x];
}

// Deterministic hash -> [0,1) so tiles look the same every load.
export function hash(a, b, s = 0) {
  let h = (a * 374761393 + b * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// Draw a string-grid sprite. pal maps chars to colours; '.' and ' ' are clear.
export function grid(x, rows, ox, oy, pal, flip = false) {
  for (let j = 0; j < rows.length; j++) {
    const r = rows[j];
    for (let i = 0; i < r.length; i++) {
      const col = pal[r[i]];
      if (!col) continue;
      x.fillStyle = col;
      x.fillRect(ox + (flip ? r.length - 1 - i : i), oy + j, 1, 1);
    }
  }
}

export function shade(hex, k = 0.72) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, Math.round(v * k)));
  return '#' + ((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1);
}

// Soft round shape made of overlapping circles [cx, cy, r] (back to front), with
// an outline, a highlight on each bump, a darker underside and inner contour lines.
// pal: {o: outline, g: base, l: light, d: dark}
export function blob(x, ox, oy, circles, pal, seed = 0, speck = true) {
  let x0 = 99, x1 = -99, y0 = 99, y1 = -99;
  for (const [cx, cy, r] of circles) { x0 = Math.min(x0, cx - r); x1 = Math.max(x1, cx + r); y0 = Math.min(y0, cy - r); y1 = Math.max(y1, cy + r); }
  x0 = Math.floor(x0) - 1; x1 = Math.ceil(x1) + 1; y0 = Math.floor(y0) - 1; y1 = Math.ceil(y1) + 1;
  const owner = (i, j) => {
    for (let k = circles.length - 1; k >= 0; k--) {
      const [cx, cy, r] = circles[k], dx = i + 0.5 - cx, dy = j + 0.5 - cy;
      if (dx * dx + dy * dy <= r * r) return k;
    }
    return -1;
  };
  for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
    const k = owner(i, j);
    if (k < 0) continue;
    let col;
    const nb = [owner(i - 1, j), owner(i + 1, j), owner(i, j - 1), owner(i, j + 1)];
    if (nb.includes(-1)) col = pal.o;
    else {
      const [cx, cy, r] = circles[k];
      const dy = (j + 0.5 - cy) / r, hx = i + 0.5 - (cx - r * 0.35), hy = j + 0.5 - (cy - r * 0.4);
      col = pal.g;
      if (dy > 0.45) col = pal.d;
      if (hx * hx + hy * hy < (r * 0.42) ** 2) col = pal.l;
      // contour line where this bump sits in front of another one
      if (nb.some(n => n >= 0 && n < k)) col = pal.d;
      if (speck) { const h = hash(i + ox * 3, j + oy * 5, seed); if (h < 0.05) col = pal.d; else if (h > 0.96 && dy < 0.1) col = pal.l; }
    }
    x.fillStyle = col; x.fillRect(ox + i, oy + j, 1, 1);
  }
}

// ---------------------------------------------------------------- font
const F = {
  A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [14, 17, 16, 16, 16, 17, 14],
  D: [28, 18, 17, 17, 17, 18, 28], E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17], I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 2, 18, 12], K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 17, 25, 21, 19, 17, 17], O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16], Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4], U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 21, 10], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 17, 10, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
  0: [14, 17, 19, 21, 25, 17, 14], 1: [4, 12, 4, 4, 4, 4, 14], 2: [14, 17, 1, 2, 4, 8, 31],
  3: [31, 2, 4, 2, 1, 17, 14], 4: [2, 6, 10, 18, 31, 2, 2], 5: [31, 16, 30, 1, 1, 17, 14],
  6: [6, 8, 16, 30, 17, 17, 14], 7: [31, 1, 2, 4, 8, 8, 8], 8: [14, 17, 17, 14, 17, 17, 14],
  9: [14, 17, 17, 15, 1, 2, 12],
  '.': [0, 0, 0, 0, 0, 12, 12], ',': [0, 0, 0, 0, 12, 4, 8], '!': [4, 4, 4, 4, 4, 0, 4],
  '?': [14, 17, 1, 2, 4, 0, 4], "'": [12, 4, 8, 0, 0, 0, 0], '-': [0, 0, 0, 14, 0, 0, 0],
  ':': [0, 12, 12, 0, 12, 12, 0], '/': [0, 1, 2, 4, 8, 16, 0], '"': [10, 10, 0, 0, 0, 0, 0],
  '(': [2, 4, 8, 8, 8, 4, 2], ')': [8, 4, 2, 2, 2, 4, 8], '@': [14, 17, 1, 13, 21, 21, 14],
  '+': [0, 4, 4, 31, 4, 4, 0], '_': [0, 0, 0, 0, 0, 0, 31], '#': [10, 31, 10, 10, 31, 10, 0],
  '♥': [0, 10, 31, 31, 14, 4, 0], '♦': [0, 4, 14, 31, 14, 4, 0],
  '♠': [0, 4, 14, 31, 31, 4, 14], '♣': [14, 14, 21, 31, 21, 4, 14],
  '▶': [16, 24, 28, 30, 28, 24, 16], '▼': [0, 0, 31, 14, 4, 0, 0], '♪': [6, 5, 4, 4, 12, 28, 8],
  '*': [0, 21, 14, 31, 14, 21, 0], '=': [0, 0, 31, 0, 31, 0, 0], '&': [12, 18, 20, 8, 21, 18, 13],
};
const GLYPHS = Object.keys(F);
export const GLYPH_SET = new Set([...GLYPHS, ' ']);
// A tiny 3x5 font for little floating words (what NPCs shout when hit).
const F5 = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', '!': '010010010000010', '?': '110001010000010', '.': '000000000000010', '-': '000000111000000',
  "'": '010010000000000', ',': '000000000010100',
};
export const GLYPH5_SET = new Set([...Object.keys(F5), ' ']);
export function textWidth5(str) { return str.length ? str.length * 4 - 1 : 0; }
// Small floating word: light letters with a dark outline, centred on cx.
export function tinyText(x, str, cx, oy, color = '#fff2d0', outline = C.ink) {
  str = String(str).toUpperCase();
  const ox = Math.round(cx - textWidth5(str) / 2); oy = Math.round(oy);
  const dots = [];
  [...str].forEach((ch, k) => { const g = F5[ch]; if (g) for (let i = 0; i < 15; i++) if (g[i] === '1') dots.push([ox + k * 4 + (i % 3), oy + ((i / 3) | 0)]); });
  x.fillStyle = outline;
  for (const [a, b] of dots) x.fillRect(a - 1, b - 1, 3, 3);
  x.fillStyle = color;
  for (const [a, b] of dots) x.fillRect(a, b, 1, 1);
}

// Pixel positions [x, y] of a string in the 5x7 font (6px per character).
export function glyphDots(str) {
  const out = [];
  [...String(str)].forEach((ch, k) => (F[ch] || []).forEach((row, j) => {
    for (let i = 0; i < 5; i++) if (row & (16 >> i)) out.push([k * 6 + i, j]);
  }));
  return out;
}
const GI = Object.fromEntries(GLYPHS.map((g, i) => [g, i]));
const fontCache = new Map();
function fontSheet(color) {
  let s = fontCache.get(color);
  if (s) return s;
  const [c, x] = makeCanvas(GLYPHS.length * 6, 7);
  x.fillStyle = color;
  GLYPHS.forEach((g, gi) => {
    F[g].forEach((row, j) => {
      for (let i = 0; i < 5; i++) if (row & (16 >> i)) x.fillRect(gi * 6 + i, j, 1, 1);
    });
  });
  fontCache.set(color, c);
  return c;
}
export function textWidth(str, scale = 1) { return str.length ? (str.length * 6 - 1) * scale : 0; }
export function text(x, str, ox, oy, color = C.white, scale = 1) {
  const sheet = fontSheet(color);
  str = String(str).toUpperCase();
  let cx = Math.round(ox); oy = Math.round(oy);
  for (const ch of str) {
    const gi = GI[ch];
    if (gi !== undefined) x.drawImage(sheet, gi * 6, 0, 5, 7, cx, oy, 5 * scale, 7 * scale);
    cx += 6 * scale;
  }
}
// Text with an outline (scaled), for titles drawn over pictures.
export function textOutline(x, str, ox, oy, color, outline = C.ink, scale = 1) {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]])
    text(x, str, ox + dx * scale, oy + dy * scale, outline, scale);
  text(x, str, ox, oy, color, scale);
}
export function textCenter(x, str, cx, oy, color, scale = 1, outline) {
  const ox = Math.round(cx - textWidth(String(str), scale) / 2);
  if (outline) textOutline(x, str, ox, oy, color, outline, scale);
  else text(x, str, ox, oy, color, scale);
}

// Word wrap into lines of at most `max` characters.
export function wrap(str, max) {
  const out = [];
  for (const para of String(str).split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      if (!line) line = w;
      else if ((line + ' ' + w).length <= max) line += ' ' + w;
      else { out.push(line); line = w; }
    }
    out.push(line);
  }
  return out;
}

// Parchment in a dark wooden frame with gold corner studs.
export function box(x, ox, oy, w, h, fill = UI.paper) {
  ox = Math.round(ox); oy = Math.round(oy);
  x.fillStyle = UI.edgeD; x.fillRect(ox + 1, oy, w - 2, h); x.fillRect(ox, oy + 1, w, h - 2);
  x.fillStyle = UI.edge; x.fillRect(ox + 1, oy + 1, w - 2, h - 2);
  x.fillStyle = '#7a5434'; x.fillRect(ox + 2, oy + 1, w - 4, 1);
  x.fillStyle = UI.edgeD; x.fillRect(ox + 3, oy + 3, w - 6, h - 6);
  x.fillStyle = fill; x.fillRect(ox + 4, oy + 4, w - 8, h - 8);
  if (fill === UI.paper) {
    x.fillStyle = '#f4ead0'; x.fillRect(ox + 4, oy + 4, w - 8, 1);
    x.fillStyle = UI.paperD; x.fillRect(ox + 4, oy + h - 5, w - 8, 1); x.fillRect(ox + w - 5, oy + 4, 1, h - 8);
  }
  for (const [cx, cy] of [[ox, oy], [ox + w - 3, oy], [ox, oy + h - 3], [ox + w - 3, oy + h - 3]]) {
    x.fillStyle = UI.edgeD; x.fillRect(cx, cy, 3, 3);
    x.fillStyle = C.gold; x.fillRect(cx + 1, cy + 1, 1, 1);
  }
}

// Soft pixel glow (stepped rings), drawn with 'lighter' blending for lamps and magic.
const glowCache = new Map();
export function glow(r, col) {
  const key = r + col;
  let c = glowCache.get(key);
  if (c) return c;
  let x;
  [c, x] = makeCanvas(r * 2, r * 2);
  const n = parseInt(col.slice(1), 16), rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  for (let j = 0; j < r * 2; j++) for (let i = 0; i < r * 2; i++) {
    const d = Math.hypot(i + 0.5 - r, j + 0.5 - r) / r;
    if (d >= 1) continue;
    const lvl = Math.ceil((1 - d) * 4); // 4 hard steps keeps it pixel-art
    if ((i + j) % 2 && lvl === 1) continue; // dithered outer ring
    x.fillStyle = `rgba(${rgb},${lvl * 0.07})`; x.fillRect(i, j, 1, 1);
  }
  glowCache.set(key, c);
  return c;
}

// ---------------------------------------------------------------- playing card
const SUIT7 = {
  H: [0x36, 0x7f, 0x7f, 0x7f, 0x3e, 0x1c, 0x08],
  D: [0x08, 0x1c, 0x3e, 0x7f, 0x3e, 0x1c, 0x08],
  S: [0x08, 0x1c, 0x3e, 0x7f, 0x7f, 0x2a, 0x1c],
  C: [0x1c, 0x1c, 0x6b, 0x7f, 0x6b, 0x08, 0x1c],
};
export function suitIcon(x, s, ox, oy, color, scale = 1) {
  x.fillStyle = color;
  SUIT7[s].forEach((row, j) => {
    for (let i = 0; i < 7; i++) if (row & (64 >> i)) x.fillRect(ox + i * scale, oy + j * scale, scale, scale);
  });
}
export const VALUE_LABEL = [null, 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export function drawCard(x, ox, oy, v, s) {
  const red = s === 'H' || s === 'D';
  const col = red ? C.red : C.ink;
  const W = 48, H = 64;
  x.fillStyle = C.ink;
  x.fillRect(ox + 2, oy, W - 4, H); x.fillRect(ox, oy + 2, W, H - 4); x.fillRect(ox + 1, oy + 1, W - 2, H - 2);
  x.fillStyle = C.white;
  x.fillRect(ox + 2, oy + 1, W - 4, H - 2); x.fillRect(ox + 1, oy + 2, W - 2, H - 4);
  x.fillStyle = '#eadfc8'; x.fillRect(ox + 2, oy + H - 3, W - 4, 1);
  const lab = VALUE_LABEL[v];
  const corner = () => {
    text(x, lab, ox + 4, oy + 4, col);
    suitIcon(x, s, ox + 3 + (lab.length === 2 ? 2 : 0), oy + 13, col);
  };
  corner();
  x.save(); x.translate(ox * 2 + W, oy * 2 + H); x.rotate(Math.PI); corner(); x.restore();
  suitIcon(x, s, ox + 14, oy + 21, col, 3);
}

// A parchment scroll with a word on it, for the word reveal. Returns a canvas.
export function makeScroll(word) {
  const big = word.length <= 10;
  const sc = big ? 2 : 1;
  const lines = big ? [word] : wrap(word, 20).slice(0, 4);
  const tw = Math.max(...lines.map(l => textWidth(l, sc)));
  const w = Math.max(60, tw + 20), lh = 7 * sc + 5, h = lines.length * lh + 26;
  const [c, x] = makeCanvas(w + 6, h);
  x.fillStyle = C.ink; x.fillRect(3, 4, w, h - 8);
  x.fillStyle = '#f7e8c2'; x.fillRect(4, 5, w - 2, h - 10);
  x.fillStyle = '#e2c992'; x.fillRect(4, 5, 2, h - 10); x.fillRect(w - 1, 5, 2, h - 10);
  x.fillStyle = '#efdcae'; for (let i = 0; i < 6; i++) x.fillRect(8 + ((hash(i, w) * (w - 12)) | 0), 9 + ((hash(i, h) * (h - 20)) | 0), 3, 1);
  for (const ry of [0, h - 8]) {
    x.fillStyle = C.woodO; x.fillRect(0, ry, w + 6, 8);
    x.fillStyle = C.woodL; x.fillRect(1, ry + 1, w + 4, 6);
    x.fillStyle = C.wood; x.fillRect(1, ry + 4, w + 4, 3);
    x.fillStyle = C.woodD; x.fillRect(1, ry + 6, w + 4, 1);
    x.fillStyle = C.gold; x.fillRect(0, ry + 2, 1, 4); x.fillRect(w + 5, ry + 2, 1, 4);
  }
  lines.forEach((l, i) => textCenter(x, l, (w + 6) / 2, 13 + i * lh, '#4a2a4a', sc));
  return c;
}

// ---------------------------------------------------------------- characters
// 16x16 chibi: big head (rows 0-9), small body, legs per walk frame.
const TOP = {
  down: [
    '................',
    '.....oooooo.....',
    '....ohhhhhho....',
    '...ohhHhhHhho...',
    '...ohhhhhhhho...',
    '...ohssssssho...',
    '...ohsessesho...',
    '...ohssssssho...',
    '....osssssso....',
    '...okkttttkko...',
    '..okkttttttkko..',
    '..oskttttttkso..',
    '..okkbbbbbbkko..',
    '..okKTTTTTTKko..',
  ],
  up: [
    '................',
    '.....oooooo.....',
    '....ohhhhhho....',
    '...ohhHhhHhho...',
    '...ohhhhhhhho...',
    '...ohhhhhhhho...',
    '...ohhhhhhhho...',
    '...ohhhhhhhho...',
    '....ohhhhhho....',
    '...okkkkkkkko...',
    '..okkkkkkkkkko..',
    '..oskkkkkkkkso..',
    '..okkkkkkkkkko..',
    '..okKKKKKKKKko..',
  ],
  side: [
    '................',
    '.....oooooo.....',
    '....ohhhhhho....',
    '...ohhHhhhhho...',
    '...ohhhhhhhho...',
    '...ohhhhsssso...',
    '...ohhhhsseso...',
    '...ohhhhssssso..',
    '....ohhhssso....',
    '....okkkttto....',
    '...okkkktttto...',
    '...okkkktsto....',
    '...okkkkbbbo....',
    '...okKKKTTTo....',
  ],
};
const LEGS = {
  down: [['...obbo..obbo...', '...oooo..oooo...'], ['...oooo..obbo...', '.........oooo...'], ['...obbo..oooo...', '...oooo.........']],
  side: [['.....obbo.......', '.....oooo.......'], ['....obo..obo....', '....oo....oo....'], ['....obo..obo....', '....oo....oo....']],
};
const set = (rows, i, j, ch) => { if (rows[j]) rows[j] = rows[j].slice(0, i) + ch + rows[j].slice(i + 1); };

function personRows(look, dir, frame) {
  const face = dir === 'left' || dir === 'right' ? 'side' : dir;
  const rows = TOP[face].slice();
  const legs = LEGS[face === 'side' ? 'side' : 'down'][frame % 3];
  rows.push(legs[0], legs[1]);
  if (look.long) {
    if (face === 'down') for (let j = 8; j <= 10; j++) { set(rows, 3, j, 'h'); set(rows, 12, j, 'h'); set(rows, 2, j, 'o'); set(rows, 13, j, 'o'); }
    else if (face === 'up') for (let j = 8; j <= 11; j++) for (let i = 4; i <= 11; i++) set(rows, i, j, 'h');
    else for (let j = 8; j <= 10; j++) { set(rows, 4, j, 'h'); set(rows, 3, j, 'o'); }
  }
  if (look.beard) {
    if (face === 'down') { for (let i = 5; i <= 10; i++) { set(rows, i, 7, 'W'); set(rows, i, 8, 'W'); } for (let i = 6; i <= 9; i++) set(rows, i, 9, 'W'); }
    else if (face === 'side') { for (let i = 8; i <= 12; i++) set(rows, i, 7, 'W'); for (let i = 8; i <= 11; i++) set(rows, i, 8, 'W'); set(rows, 9, 9, 'W'); }
  }
  if (look.acc === 'cap') {
    for (let j = 1; j <= 3; j++) rows[j] = rows[j].replace(/h/g, 'c').replace(/H/g, 'C');
    if (face === 'down') { set(rows, 11, 0, 'f'); set(rows, 12, 0, 'f'); set(rows, 12, 1, 'f'); }
    if (face === 'side') { set(rows, 4, 0, 'f'); set(rows, 3, 0, 'f'); set(rows, 3, 1, 'f'); }
  }
  if (look.acc === 'helmet') { set(rows, 7, 0, 'r'); set(rows, 8, 0, 'r'); if (face !== 'up') { set(rows, 7, 5, 'o'); set(rows, 8, 5, 'o'); } }
  if (look.acc === 'hood' && face !== 'up') { set(rows, 4, 1, 'o'); set(rows, 11, 1, 'o'); }
  if (look.kid) { rows.splice(12, 1); rows.splice(3, 1); }
  return rows;
}

function personPal(look) {
  const hair = look.acc === 'hood' ? look.hood : look.acc === 'helmet' ? '#9a9ca6' : look.hair;
  const cap = look.cap || '#7a2a2a';
  const cloak = look.cloak || (look.acc === 'hood' ? look.hood : shade(look.tunic, 0.6));
  return {
    o: C.ink, h: hair, H: shade(hair, 1.25), s: look.skin, e: C.eye,
    t: look.tunic, T: look.tunicD || shade(look.tunic, 0.75), b: look.boots || '#3e2a1a',
    k: cloak, K: shade(cloak, 0.72),
    W: look.beardColor || '#dcd6c8', r: C.red, c: cap, C: shade(cap, 1.25), f: '#e8e0c8',
  };
}

const CAT = ['................', '................', '................', '................', '................', '................',
  '....oo....oo....', '....oGo..oGo....', '....oGGooGGo....', '...oGGGGGGGGo...', '...oGeGGGGeGo...', '...oGGGppGGGo...',
  '....oGGGGGGo....', '...oGGWWWWGGo...', '...oGGWWWWGGo...', '....oooooooo....'];
const CHICKEN = ['................', '................', '................', '................', '................',
  '......oRo.......', '.....oWWWo......', '....yoWeWWo.....', '.....oWWWWo.....', '......oWWWWoo...', '.....oWWWWWWWo..',
  '.....oWWWWWWWo..', '......oWWWWWo...', '.......ooooo....', '.......y..y.....', '................'];
const FROG = ['................', '................', '................', '................', '................', '................', '................', '................',
  '....oo....oo....', '...oeGo..oGeo...', '...oGGGooGGGo...', '..oGGGGGGGGGGo..', '..oGGGRRRRGGGo..', '..oGGGGGGGGGGo..', '.ooGo......oGoo.', '................'];
const WIZARD = [
  '........o.......', '.......oho......', '.......ohho.....', '......ohhho.....', '......ohyho.....', '.....ohhhhho....',
  '.....ohhhhHo....', '....ohhhyhhHo...', '..ooHHHHHHHHHoo.', '.oHHHHHHHHHHHHHo', '..ooossssssooo..', '...osewsssewo...',
  '...obbsseebbo...', '...obbbbbbbbo...', '..orrbbbbbbBrro.', '..orrrbbbbBrrro.', '..orrrrbbBrrrro.', '..orrrrrBrrrrro.',
  '..orryrrrrrrRro.', '..orrrrrrrrrRro.', '..orrrrrrryrRro.', '..orrrrrrrrrRro.', '.orrrrrrrrrrrRro', '.ooooooooooooooo'];

const DOG = ['................', '................', '................', '................', '................', '................', '...oooo.......o.', '..oFFFFo.....oFo', '.oFeFFEEoooooFo.', 'oNFFFFEEFFFFFFo.', '.ooFFEEEFFFFFFFo', '...oEEEFFFFFFFFo', '...oFFFFFFFFFFFo', '...oFoFoooooFoFo', '...oo.oo...oo.oo', '................'];
const DOG_WAG = ['................', '................', '................', '................', '................', '................', '..............o.', '...oooo......oFo', '.oFeFFEEoooooo..', '.oFeFFEEoooooFo.', 'oNFFFFEEFFFFFFo.', '.ooFFEEEFFFFFFFo', '...oEEEFFFFFFFFo', '...oFFFFFFFFFFFo', '...oFoFoooooFoFo', '...oo.oo...oo.oo', '................'];

// The dachshund on its back, pink belly up, paws kicking (two frames). Faces left.
const BELLY = [
  ['....o.o....o.o..', '....oFo....oFo..'],
  ['...o.o......o.o.', '...oFo......oFo.'],
].map(legs => ['', '', '', '', '', '', '', ...legs, '.oooPPPPPPPPPPo.', 'oNFePPPPPPPPPPFo', '.oFFFPPPPPPPPFFo', '..oEEFFFFFFFFFo.', '.oEEEoooooooooo.', '..ooo...........', '']);
const bellyC = {};
export function dogBellySprite(frame = 0, flip = false) {
  const k = (frame % 2) + (flip ? 2 : 0);
  if (!bellyC[k]) { let x; [bellyC[k], x] = makeCanvas(16, 16); grid(x, BELLY[frame % 2], 0, 0, { o: C.ink, F: '#efe2c4', E: '#cdb58a', e: C.eye, N: '#2a1a14', P: '#f0d5be' }, flip); }
  return bellyC[k];
}

const sprCache = new Map();
// Returns a canvas for a character look at a facing and frame.
export function charSprite(look, dir = 'down', frame = 0) {
  const key = look.key + dir + frame;
  let c = sprCache.get(key);
  if (c) return c;
  let x;
  if (look.kind === 'wizard') {
    [c, x] = makeCanvas(20, 26);
    grid(x, WIZARD, 0, 2, look.evil
      ? { o: C.ink, h: '#2a1a2a', H: '#14101a', y: '#d8302a', s: '#b8a890', e: '#ff4040', w: '#ff9090', b: '#8a8a90', B: '#5e5e66', r: '#5a1420', R: '#3a0c14' }
      : { o: C.ink, h: '#4e2e8a', H: '#2e1c5a', y: C.gold, s: '#e8c09a', e: C.eye, w: '#e8e0cc', b: '#e0dccc', B: '#a8a294', r: '#2e3e7a', R: '#1e2858' });
    const up = frame ? 3 : 0;
    x.fillStyle = C.ink; x.fillRect(14, 9 - up, 3, 17 + up - (frame ? 2 : 0));
    x.fillStyle = C.wood; x.fillRect(15, 10 - up, 1, 15 + up - (frame ? 2 : 0));
    x.fillStyle = C.ink; x.fillRect(13, 4 - up, 5, 6); x.fillRect(14, 3 - up, 3, 8);
    x.fillStyle = look.evil ? (frame ? '#d0ffb0' : '#6ae84a') : frame ? '#ffffff' : C.cyan; x.fillRect(14, 5 - up, 3, 4); x.fillRect(15, 4 - up, 1, 6);
  } else if (look.kind === 'dog') {
    // cream long-haired dachshund (faces left; flipped when walking right)
    [c, x] = makeCanvas(16, 16);
    grid(x, frame % 2 ? DOG_WAG : DOG, 0, 0, { o: C.ink, F: '#efe2c4', E: '#cdb58a', e: C.eye, N: '#2a1a14' }, dir === 'right');
  } else if (look.kind === 'cat' || look.kind === 'chicken' || look.kind === 'frog') {
    [c, x] = makeCanvas(16, 16);
    if (look.kind === 'cat') {
      grid(x, CAT, 0, 0, look.black ? { o: C.ink, G: '#2a2630', e: '#d8e84a', p: '#c87a8a', W: '#3a3640' } : { o: C.ink, G: '#6a6470', e: '#c8d84a', p: C.pink, W: '#c8c2b8' });
      x.fillStyle = C.ink;
      if (frame % 2) { x.fillRect(12, 11, 1, 4); x.fillRect(13, 10, 1, 2); } else { x.fillRect(12, 13, 3, 1); x.fillRect(14, 12, 1, 1); }
    } else if (look.kind === 'chicken') {
      const rows = frame % 2 ? ['................', ...CHICKEN.slice(0, 15)].map((r, j) => (j > 8 ? CHICKEN[j] : r)) : CHICKEN;
      grid(x, rows, 0, 0, { o: C.ink, R: C.red, W: '#d8cfb8', e: C.eye, y: C.goldD }, dir === 'right');
    } else {
      grid(x, FROG, 0, frame % 2 ? -2 : 0, { o: C.ink, G: '#5a7a34', e: C.eye, R: '#344a1e' });
    }
  } else {
    const rows = personRows(look, dir, frame);
    [c, x] = makeCanvas(16, 16);
    grid(x, rows, 0, 16 - rows.length, personPal(look), dir === 'left');
    if (look.sleep) {
      const [r, rx] = makeCanvas(16, 16);
      rx.translate(16, 0); rx.rotate(Math.PI / 2); rx.drawImage(c, 0, 2);
      c = r;
    }
  }
  sprCache.set(key, c);
  return c;
}

// The hat from the evil wizard: worn over the hero's head.
const HAT = ['......oo....', '.....ohho...', '.....ohho...', '....ohhhho..', '....ohyhho..', '...ohhhhhho.',
  '...obbbbbbo.', 'oohhhhhhhhoo', '.oooooooooo.'];
const hats = {};
// evil: the dark hat from the evil wizard. Otherwise the castle wizard's purple one.
const HAT_PAL = {
  evil: { o: C.ink, h: '#3a1a3e', y: '#e8c84a', b: '#a8302a' },
  good: { o: C.ink, h: '#4e2e8a', y: C.gold, b: '#2e1c5a' },
  witch: { o: C.ink, h: '#1e1a24', y: '#1e1a24', b: '#6a3a9a' },
};
export function hatSprite(kind = 'evil') {
  const k = kind === true ? 'evil' : kind === false ? 'good' : kind;
  if (!hats[k]) { let x; [hats[k], x] = makeCanvas(12, 9); grid(x, HAT, 0, 0, HAT_PAL[k]); }
  return hats[k];
}

// Feathered wings from the Crimson Cow. One wing, facing left; flip for the other side.
const WING = ['...oo.', '..owwo', '.owwWo', 'owwwWo', 'owwWo.', '.owwo.', '..oo..'];
let wingCanvas = null;
export function wingSprite() {
  if (!wingCanvas) { let x; [wingCanvas, x] = makeCanvas(6, 7); grid(x, WING, 0, 0, { o: '#6a6470', w: '#fffaf0', W: '#d8d0e0' }); }
  return wingCanvas;
}

// The Crimson Cow: a slim energy-drink can, silver and blue, with a small red-and-gold emblem.
const POTION = ['.oooo.', 'osssso', 'oBBWWo', 'oBBWWo', 'oBrYWo', 'oWYrBo', 'oWWBBo', 'oWWBBo', 'osssso', '.oooo.'];
let potionCanvas = null;
export function potionSprite() {
  if (!potionCanvas) { let x; [potionCanvas, x] = makeCanvas(8, 10); grid(x, POTION, 1, 0, { o: C.ink, s: '#8a909c', B: '#2a4aa8', W: '#dfe3ea', r: '#d8302a', Y: '#f2c838' }); }
  return potionCanvas;
}

// A fish, facing left: raw (red) or cooked (golden brown).
const FISH_ROWS = ['...ooooo......', '.ooRRRRRoo..oo', 'oeRRRRRRRRooRo', 'oRRrRRRRRRRRRo', '.oLLLLLLLLooRo', '..ooooooo...oo'];
const fishC = {};
export function fishSprite(cooked = false) {
  const k = cooked ? 1 : 0;
  if (!fishC[k]) {
    let x; [fishC[k], x] = makeCanvas(14, 6);
    grid(x, FISH_ROWS, 0, 0, cooked ? { o: '#2a160a', e: '#f4ecd8', R: '#a8642a', r: '#5a2e10', L: '#e0a85a' } : { o: C.ink, e: '#f4ecd8', R: '#d8402e', r: '#8a1e1e', L: '#f0a088' });
    if (cooked) { x.fillStyle = '#5a2e10'; for (const gx of [4, 7, 10]) x.fillRect(gx, 2, 1, 2); }
  }
  return fishC[k];
}

// A small rusty key lying on the ground.
const KEY = ['.oo.......', 'oyyo......', 'oy.yoooooo', 'oyyoyyyyyo', '.oo.o.oo.o', '....o..o..'];
let keyCanvas = null;
export function keySprite() {
  if (!keyCanvas) { let x; [keyCanvas, x] = makeCanvas(10, 6); grid(x, KEY, 0, 0, { o: '#3a2410', y: '#c8903a' }); }
  return keyCanvas;
}

// ---------------------------------------------------------------- object sprites
const STUMP = ['', '', '', '', '', '', '', '....oooooooo....', '...ollllllllo...', '...olkkkkkklo...', '...ollllllllo...',
  '...oggdggggdo...', '...ogggggdggo...', '..ooggggggggoo..', '..oooooooooooo..', '...ssssssssss...'];
const SIGN = ['', '', '', '.oooooooooooooo.', '.olllllllllllgo.', '.olkkkkkkkklgo.', '.olllllllllllgo.', '.olkkkkkkllllgo.',
  '.oggggggggggggo.', '..oooooooooooo..', '.......ok.......', '.......ok.......', '.......ok.......', '......oook......', '.....ssssss.....'];
const WELL = ['..oooooooooooo..', '.orrrrrrrrrrrro.', 'oRRRRRRRRRRRRRRo', '.oooooooooooooo.', '...k........k...', '...k........k...',
  '..oooooooooooo..', '.ollllllllllllo.', '.olbbbbbbbbbblo.', '.olbbbbbbbbbblo.', '.ollllllllllllo.', '.ogdgggdgggdggo.',
  '.ogggdgggdggggo.', '.oooooooooooooo.', '..ssssssssssss..'];
const PILLAR = ['', '', '', '.....oo.oo......', '....olloggo.....', '....ollggdo.....', '....olmggdo.....', '....olgggdo.....',
  '....olggmdo.....', '....olgggdo.....', '....olgggdo.....', '....olmggdo.....', '....olgggdo.....', '...ooooooooo....',
  '...olllgggdo....', '...sssssssss....'];
const POT = ['', '', '', '', '', '.....oooooo.....', '....okkkkkko....', '.....oggggo.....', '....oggggggo....', '...ogglggggggo..',
  '...oglgggggggo..', '...ogggggggggo..', '...oggggggggdo..', '....ogggggddo...', '.....oooooo.....', '....ssssssss....'];
const BED_TOP = ['.oooooooooooooo.', '.okkkkkkkkkkkko.', '.okggggggggggko.', '.oooooooooooooo.', '.owwwwwwwwwwwwo.', '.owwWWWWWWWWwwo.',
  '.owWWWWWWWWWWwo.', '.owWWWWWWWWWWwo.', '.owwwwwwwwwwwwo.', '.oQQQQQQQQQQQQo.', '.oqqqqqqqqqqqqo.', '.oqqQqqqqQqqqqo.',
  '.oqqqqqqqqqqqqo.', '.oqqqqQqqqqqQqo.', '.oqqqqqqqqqqqqo.', '.oqqQqqqqQqqqqo.'];
const BED_BOT = ['.oqqqqqqqqqqqqo.', '.oqqqqQqqqqqQqo.', '.oqqqqqqqqqqqqo.', '.oqqQqqqqQqqqqo.', '.oqqqqqqqqqqqqo.', '.oqqqqqqqqqqqqo.',
  '.oQQQQQQQQQQQQo.', '.oooooooooooooo.', '.okkkkkkkkkkkko.', '.okggggggggggko.', '.oooooooooooooo.', '.ok..........ko.', '.oo..........oo.'];
const THRONE = ['...oooooooooo...', '...oyyyyyyyyo...', '...oyRRRRRRyo...', '...oyRRRRRRyo...', '...oyRRyyRRyo...', '...oyRRRRRRyo...',
  '...oyRRRRRRyo...', '.ooooyRRRRyoooo.', '.oyyyyyyyyyyyyo.', '.oyRRRRRRRRRRyo.', '.oyyyyyyyyyyyyo.', '.oYYYYYYYYYYYYo.',
  '.oYo........oYo.', '.oYo........oYo.', '.ooo........ooo.'];
const PAL = {
  stump: { o: C.woodO, l: C.woodL, k: C.wood, g: C.wood, d: C.woodD, s: C.grassD },
  sign: { o: C.woodO, l: C.woodL, g: C.wood, k: C.woodD, s: C.grassD },
  well: { o: C.stoneO, r: '#4e5668', R: '#383e4e', k: C.woodD, l: C.stoneL, b: '#1a2a3a', g: C.stone, d: C.stoneD, s: C.grassD },
  pillar: { o: C.stoneO, l: C.stoneL, g: C.stone, d: C.stoneD, m: C.leafD, s: C.grassD },
  pot: { o: C.woodO, k: '#5a2e1a', g: '#9a5a36', l: '#b8784a', d: '#6e3e24', s: C.floorK },
  bed: { o: C.woodO, k: C.woodD, g: C.wood, w: '#cfc6b0', W: '#e8e0cc', Q: '#2e4a32', q: '#3e5e40' },
  throne: { o: C.ink, y: C.gold, Y: C.goldD, R: C.carpet },
};

// ---------------------------------------------------------------- ground helpers
function dot(x, ox, oy, i, j, col) { x.fillStyle = col; x.fillRect(ox + i, oy + j, 1, 1); }
function grass(x, ox, oy, tx, ty, base = C.grass) {
  x.fillStyle = base; x.fillRect(ox, oy, 16, 16);
  const dark = base === C.grass ? C.grassD : shade(base, 0.82), light = base === C.grass ? C.grassL : shade(base, 1.18);
  for (let k = 0; k < 3; k++) dot(x, ox, oy, (hash(tx, ty, k) * 15) | 0, (hash(tx, ty, k + 9) * 15) | 0, light);
  const n = 1 + ((hash(tx, ty, 20) * 2.4) | 0);
  for (let k = 0; k < n; k++) {
    const a = 1 + ((hash(tx, ty, k + 30) * 11) | 0), b = 2 + ((hash(tx, ty, k + 40) * 11) | 0);
    x.fillStyle = dark; x.fillRect(ox + a, oy + b + 1, 1, 1); x.fillRect(ox + a + 1, oy + b, 1, 2); x.fillRect(ox + a + 3, oy + b, 1, 2); x.fillRect(ox + a + 4, oy + b + 1, 1, 1);
    x.fillStyle = light; x.fillRect(ox + a + 1, oy + b - 1, 1, 1); x.fillRect(ox + a + 3, oy + b - 1, 1, 1);
  }
}
function bricks(x, ox, oy, base, dark, light, ty) {
  x.fillStyle = base; x.fillRect(ox, oy, 16, 16);
  for (let r = 0; r < 4; r++) {
    x.fillStyle = dark; x.fillRect(ox, oy + r * 4 + 3, 16, 1);
    const off = (r + ty) % 2 ? 0 : 4;
    for (let i = off; i < 16; i += 8) x.fillRect(ox + i, oy + r * 4, 1, 3);
    x.fillStyle = light;
    for (let i = off + 1; i < 16; i += 8) x.fillRect(ox + i, oy + r * 4, 5, 1);
  }
}
function planks(x, ox, oy, tx, ty) {
  x.fillStyle = C.floor; x.fillRect(ox, oy, 16, 16);
  for (let r = 0; r < 4; r++) {
    x.fillStyle = C.floorL; x.fillRect(ox, oy + r * 4, 16, 1);
    x.fillStyle = C.floorK; x.fillRect(ox, oy + r * 4 + 3, 16, 1);
    x.fillRect(ox + ((hash(tx, ty * 4 + r, 7) * 16) | 0), oy + r * 4, 1, 3);
  }
}
function stoneFloor(x, ox, oy, tx, ty) {
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    x.fillStyle = (i + j + tx + ty) % 2 ? C.cstone : C.cstoneL;
    x.fillRect(ox + i * 8, oy + j * 8, 8, 8);
    x.fillStyle = '#ffffff'; x.globalAlpha = 0.35; x.fillRect(ox + i * 8 + 1, oy + j * 8 + 1, 3, 1); x.globalAlpha = 1;
  }
  x.fillStyle = C.cstoneD; x.fillRect(ox, oy + 15, 16, 1); x.fillRect(ox + 15, oy, 1, 16); x.fillRect(ox + 7, oy, 1, 16); x.fillRect(ox, oy + 7, 16, 1);
}
// Mask-based edge: pixel (i,j) of a tile is "outside" if near a side whose neighbour
// is not the same family, with rounded corners and a slight wobble.
function edgeMask(sides, i, j, tx, ty, w = 2) {
  const wob = k => w + ((hash(tx * 31 + k, ty * 17, 5) * 1.6) | 0);
  const [up, dn, lf, rt] = sides;
  if (up && j < wob(i)) return true;
  if (dn && j > 15 - wob(i + 20)) return true;
  if (lf && i < wob(j + 40)) return true;
  if (rt && i > 15 - wob(j + 60)) return true;
  if (up && lf && i + j < w + 4) return true;
  if (up && rt && (15 - i) + j < w + 4) return true;
  if (dn && lf && i + (15 - j) < w + 4) return true;
  if (dn && rt && (15 - i) + (15 - j) < w + 4) return true;
  return false;
}

// ---------------------------------------------------------------- tiles
// Ground layer for one tile. `m.kind(tx,ty)` gives neighbours.
export function drawTile(x, kind, ox, oy, m, tx, ty, frame) {
  const n = (dx, dy) => m.kind(tx + dx, ty + dy) || '';
  switch (kind) {
    case 'grass': grass(x, ox, oy, tx, ty); break;
    case 'grass2': grass(x, ox, oy, tx, ty);
      for (let k = 0; k < 2; k++) {
        const a = 2 + ((hash(tx, ty, k + 70) * 10) | 0), b = 3 + ((hash(tx, ty, k + 80) * 9) | 0);
        x.fillStyle = C.grassD; x.fillRect(ox + a, oy + b + 1, 4, 2);
        x.fillStyle = '#6a8a40'; x.fillRect(ox + a, oy + b, 4, 2); x.fillRect(ox + a + 1, oy + b - 1, 2, 1);
        x.fillStyle = C.grassL; x.fillRect(ox + a + 1, oy + b - 1, 1, 1);
      }
      break;
    case 'tall': grass(x, ox, oy, tx, ty);
      for (let k = 0; k < 3; k++) {
        const a = ox + 1 + k * 5, b = oy + 3 + ((hash(tx, ty, k + 9) * 5) | 0);
        x.fillStyle = C.grassDD; x.fillRect(a, b + 2, 5, 5); x.fillRect(a + 1, b + 1, 3, 1);
        x.fillStyle = C.grassD; x.fillRect(a, b + 2, 1, 3); x.fillRect(a + 2, b, 1, 5); x.fillRect(a + 4, b + 1, 1, 4);
        x.fillStyle = C.grassL; x.fillRect(a + 2, b, 1, 1); x.fillRect(a, b + 2, 1, 1); x.fillRect(a + 4, b + 1, 1, 1);
      }
      break;
    case 'flowers': grass(x, ox, oy, tx, ty);
      for (let k = 0; k < 3; k++) {
        const a = ox + 3 + ((hash(tx, ty, k + 30) * 10) | 0), b = oy + 3 + ((hash(tx, ty, k + 40) * 10) | 0);
        const pet = ['#e8e0d0', '#d8b84a', '#b86a8a', '#8a7ac8', '#c85a4a'][(hash(tx, ty, k + 60) * 5) | 0];
        x.fillStyle = C.grassDD; x.fillRect(a, b + 2, 1, 2); x.fillStyle = C.leafD; x.fillRect(a + 1, b + 3, 1, 1);
        x.fillStyle = shade(pet, 0.8); x.fillRect(a - 1, b, 3, 2); x.fillRect(a, b - 1, 1, 3);
        x.fillStyle = pet; x.fillRect(a - 1, b - 1, 1, 1); x.fillRect(a + 1, b - 1, 1, 1); x.fillRect(a - 1, b, 1, 1); x.fillRect(a, b - 1, 1, 1);
        x.fillStyle = '#e8c860'; x.fillRect(a, b, 1, 1);
      }
      break;
    case 'path': {
      const isP = k => ['path', 'bridge', 'door', 'gate'].includes(k);
      const sides = [!isP(n(0, -1)) && n(0, -1) !== 'water' && !n(0, -1).startsWith('h') && n(0, -1) !== 'fence', !isP(n(0, 1)) && n(0, 1) !== 'water', !isP(n(-1, 0)), !isP(n(1, 0))];
      grass(x, ox, oy, tx, ty);
      const shades = [C.path, C.pathD, C.pathL, '#7e7466'];
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        if (edgeMask(sides, i, j, tx, ty)) continue;
        const rim = edgeMask(sides, i, j - 1, tx, ty) || edgeMask(sides, i - 1, j, tx, ty) || edgeMask(sides, i + 1, j, tx, ty) || edgeMask(sides, i, j + 1, tx, ty);
        if (rim) { dot(x, ox, oy, i, j, C.grassDD); continue; }
        // cobbles: rows of stones 4px tall, staggered, with dark mortar
        const row = (ty * 4 + (j >> 2)), off = row % 2 ? 3 : 0, gi = tx * 16 + i + off;
        const stone = Math.floor(gi / 5);
        let col;
        if ((j & 3) === 3 || gi % 5 === 0) col = C.pathE;
        else {
          col = shades[(hash(stone, row, 4) * 4) | 0];
          if ((j & 3) === 0) col = shade(col, 1.12);
        }
        dot(x, ox, oy, i, j, col);
      }
      if (hash(tx, ty, 6) < 0.4) { dot(x, ox, oy, 3 + ((hash(tx, ty, 7) * 9) | 0), 3 + ((hash(tx, ty, 8) * 9) | 0), C.grassD); }
      break;
    }
    case 'water': {
      x.fillStyle = C.water; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.waterD;
      for (let k = 0; k < 2; k++) x.fillRect(ox + ((hash(tx, ty, k + 70) * 11) | 0), oy + 4 + k * 7, 5, 1);
      x.fillStyle = C.waterL;
      for (let k = 0; k < 2; k++) {
        const a = ((hash(tx, ty, k + 80) * 10) | 0) + (frame ? 2 : 0), b = 3 + k * 7 + (frame ? 1 : 0);
        x.fillRect(ox + a, oy + b, 1, 1); x.fillRect(ox + a + 1, oy + b + 1, 2, 1); x.fillRect(ox + a + 3, oy + b, 1, 1);
      }
      const land = k => k && k !== 'water' && k !== 'bridge';
      x.fillStyle = '#9ab8c4';
      if (land(n(0, -1))) { x.fillStyle = C.grassDD; x.fillRect(ox, oy, 16, 2); x.fillStyle = C.waterO; x.fillRect(ox, oy + 2, 16, 1); x.fillStyle = '#9ab8c4'; for (let i = frame * 2; i < 16; i += 4) x.fillRect(ox + i, oy + 3, 2, 1); }
      if (land(n(-1, 0))) { x.fillStyle = C.waterO; x.fillRect(ox, oy, 1, 16); x.fillStyle = C.waterL; x.fillRect(ox + 1, oy, 1, 16); x.fillStyle = '#9ab8c4'; for (let j = frame * 2; j < 16; j += 5) x.fillRect(ox + 1, oy + j, 1, 2); }
      if (land(n(1, 0))) { x.fillStyle = C.waterO; x.fillRect(ox + 15, oy, 1, 16); x.fillStyle = C.waterL; x.fillRect(ox + 14, oy, 1, 16); x.fillStyle = '#9ab8c4'; for (let j = frame * 2 + 1; j < 16; j += 5) x.fillRect(ox + 14, oy + j, 1, 2); }
      if (land(n(0, 1))) { x.fillStyle = C.waterL; x.fillRect(ox, oy + 14, 16, 1); x.fillStyle = '#9ab8c4'; for (let i = frame * 2 + 1; i < 16; i += 4) x.fillRect(ox + i, oy + 14, 2, 1); x.fillStyle = C.pathE; x.fillRect(ox, oy + 15, 16, 1); }
      break;
    }
    case 'bridge':
      x.fillStyle = C.water; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.waterD; x.fillRect(ox, oy + 6, 16, 1);
      x.fillStyle = C.woodO; x.fillRect(ox + 1, oy, 14, 16);
      x.fillStyle = C.wood; x.fillRect(ox + 2, oy, 12, 16);
      for (let r = 0; r < 16; r += 4) { x.fillStyle = C.woodL; x.fillRect(ox + 2, oy + r, 12, 1); x.fillStyle = C.woodD; x.fillRect(ox + 2, oy + r + 3, 12, 1); }
      x.fillStyle = C.woodO; x.fillRect(ox + 1, oy, 2, 16); x.fillRect(ox + 13, oy, 2, 16);
      x.fillStyle = C.woodL; x.fillRect(ox + 1, oy, 1, 16); x.fillRect(ox + 13, oy, 1, 16);
      break;
    case 'tree': grass(x, ox, oy, tx, ty);
      x.fillStyle = C.grassDD; x.fillRect(ox + 2, oy + 13, 12, 3); x.fillRect(ox + 4, oy + 12, 8, 1);
      break;
    case 'pine': grass(x, ox, oy, tx, ty, C.woods);
      x.fillStyle = shade(C.woods, 0.75); x.fillRect(ox + 3, oy + 13, 10, 3);
      break;
    case 'rock': grass(x, ox, oy, tx, ty);
      x.fillStyle = C.grassDD; x.fillRect(ox + 2, oy + 12, 13, 3);
      blob(x, ox, oy, [[5.5, 9, 4], [10.5, 9, 4.2], [8, 7, 4.5]], { o: C.stoneO, g: C.stone, l: C.stoneL, d: C.stoneD }, 3, false);
      break;
    case 'stump': grass(x, ox, oy, tx, ty); grid(x, STUMP, ox, oy, PAL.stump); break;
    case 'worms': grass(x, ox, oy, tx, ty); // a heap of dark, damp soil (the worms are drawn live)
      x.fillStyle = C.grassDD; x.fillRect(ox + 1, oy + 13, 14, 2);
      blob(x, ox, oy, [[5, 10, 4.2], [10.5, 10.5, 4], [8, 8, 4.4]], { o: '#1e140e', g: '#4a3424', l: '#6a4c32', d: '#34241a' }, 7, false);
      x.fillStyle = '#7a5a3c'; x.fillRect(ox + 6, oy + 6, 1, 1); x.fillRect(ox + 11, oy + 9, 1, 1); x.fillRect(ox + 4, oy + 10, 1, 1);
      break;
    case 'sign': grass(x, ox, oy, tx, ty); grid(x, SIGN, ox, oy, PAL.sign); break;
    case 'well': grass(x, ox, oy, tx, ty); grid(x, WELL, ox, oy, PAL.well); break;
    case 'pillar': grass(x, ox, oy, tx, ty); grid(x, PILLAR, ox, oy, PAL.pillar); break;
    case 'rubble': grass(x, ox, oy, tx, ty);
      for (let k = 0; k < 3; k++) {
        const a = 1 + ((hash(tx, ty, k + 90) * 11) | 0), b = 3 + ((hash(tx, ty, k + 95) * 9) | 0);
        blob(x, ox + a, oy + b, [[2.5, 2, 2.4]], { o: C.stoneO, g: C.stone, l: C.stoneL, d: C.stoneD }, k, false);
      }
      break;
    case 'runestone': grass(x, ox, oy, tx, ty);
      x.fillStyle = C.grassDD; x.fillRect(ox + 3, oy + 13, 11, 3);
      x.fillStyle = C.stoneO; x.fillRect(ox + 4, oy + 1, 8, 14); x.fillRect(ox + 3, oy + 3, 10, 12);
      x.fillStyle = C.stone; x.fillRect(ox + 5, oy + 2, 6, 12); x.fillRect(ox + 4, oy + 4, 8, 10);
      x.fillStyle = C.stoneL; x.fillRect(ox + 5, oy + 2, 2, 11);
      x.fillStyle = C.leafD; x.fillRect(ox + 4, oy + 12, 3, 2); x.fillRect(ox + 10, oy + 13, 2, 1);
      x.fillStyle = C.cyan; x.fillRect(ox + 7, oy + 4, 3, 1); x.fillRect(ox + 8, oy + 5, 1, 3); x.fillRect(ox + 7, oy + 9, 1, 1); x.fillRect(ox + 9, oy + 9, 1, 1); x.fillRect(ox + 7, oy + 11, 3, 1);
      break;
    case 'log': grass(x, ox, oy, tx, ty);
      x.fillStyle = C.grassDD; x.fillRect(ox + 1, oy + 13, 15, 2);
      x.fillStyle = C.woodO; x.fillRect(ox, oy + 6, 16, 8);
      x.fillStyle = C.wood; x.fillRect(ox + 1, oy + 7, 15, 6);
      x.fillStyle = C.woodL; x.fillRect(ox + 4, oy + 7, 11, 1);
      x.fillStyle = C.woodD; x.fillRect(ox + 4, oy + 10, 8, 1); x.fillRect(ox + 7, oy + 12, 7, 1);
      x.fillStyle = '#f2cf9a'; x.fillRect(ox + 1, oy + 7, 3, 6); x.fillStyle = C.woodL; x.fillRect(ox + 2, oy + 9, 1, 2);
      x.fillStyle = C.leafL; x.fillRect(ox + 8, oy + 6, 3, 1); x.fillStyle = C.leaf; x.fillRect(ox + 9, oy + 5, 1, 1);
      break;
    case 'stall': grass(x, ox, oy, tx, ty); {
      const L = n(-1, 0) !== 'stall', R = n(1, 0) !== 'stall';
      for (let k = 0; k < 3; k++) {
        const a = ox + 2 + k * 5;
        blob(x, a, oy + 2, [[2, 2.5, 2.4]], [{ o: '#3a1010', g: '#a83a2e', l: '#d06a50', d: '#7a2420' }, { o: '#3a2a0a', g: '#c89a3a', l: '#e8c870', d: '#8a6a22' }, { o: '#1a2a12', g: '#6a8a3a', l: '#9ab860', d: '#46602a' }][(tx + k) % 3], k, false);
      }
      x.fillStyle = C.woodO; x.fillRect(ox, oy + 6, 16, 10);
      x.fillStyle = C.woodL; x.fillRect(ox + (L ? 1 : 0), oy + 7, 16 - (L ? 1 : 0) - (R ? 1 : 0), 2);
      for (let i = 0; i < 16; i += 4) {
        x.fillStyle = (i / 4) % 2 ? '#d8ccb0' : '#7a2228';
        x.fillRect(ox + i + (L && i === 0 ? 1 : 0), oy + 9, 4 - (L && i === 0 ? 1 : 0) - (R && i === 12 ? 1 : 0), 6);
      }
      break; }
    case 'roof': case 'roofB': case 'roofN': {
      const P = ROOFS[kind], isR = k => k.startsWith('roof');
      x.fillStyle = P.b; x.fillRect(ox, oy, 16, 16);
      if (P.thatch) {
        for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
          const hsh = hash(tx * 16 + i, ty * 16 + j, 9);
          if (hsh < 0.18) dot(x, ox, oy, i, j, P.d); else if (hsh > 0.86) dot(x, ox, oy, i, j, P.l);
        }
        x.fillStyle = P.d; x.fillRect(ox, oy + 7, 16, 1); x.fillRect(ox, oy + 15, 16, 1);
        x.fillStyle = P.l; x.fillRect(ox, oy + 8, 16, 1);
      } else for (let r = 0; r < 4; r++) {
        const y = oy + r * 4, off = r % 2 ? 2 : 0;
        x.fillStyle = P.l; x.fillRect(ox, y, 16, 1);
        x.fillStyle = P.d; x.fillRect(ox, y + 3, 16, 1);
        for (let i = off; i < 16; i += 4) { x.fillRect(ox + i, y + 2, 1, 1); x.fillRect(ox + i + 1, y + 1, 1, 1); }
      }
      x.fillStyle = P.o;
      if (!isR(n(0, -1))) { x.fillRect(ox, oy, 16, 2); x.fillStyle = P.l; x.fillRect(ox, oy + 2, 16, 1); x.fillStyle = P.o; }
      if (!isR(n(-1, 0))) x.fillRect(ox, oy, 1, 16);
      if (!isR(n(1, 0))) x.fillRect(ox + 15, oy, 1, 16);
      if (!isR(n(0, 1))) { x.fillStyle = P.d; x.fillRect(ox, oy + 12, 16, 2); x.fillStyle = P.o; x.fillRect(ox, oy + 14, 16, 2); }
      break;
    }
    case 'hwall': case 'hwin': case 'door': {
      const isW = k => ['hwall', 'hwin', 'door'].includes(k);
      x.fillStyle = C.wall; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.wallD; for (let k = 0; k < 4; k++) x.fillRect(ox + ((hash(tx, ty, k) * 14) | 0), oy + 2 + ((hash(tx, ty, k + 5) * 8) | 0), 2, 1);
      x.fillStyle = C.woodD; x.fillRect(ox, oy, 16, 2); x.fillRect(ox, oy + 10, 16, 2);
      if (kind === 'hwall') for (let k = 0; k < 8; k++) { x.fillRect(ox + 2 + k, oy + 2 + k, 2, 1); x.fillRect(ox + 12 - k, oy + 2 + k, 2, 1); }
      x.fillStyle = C.stoneD; x.fillRect(ox, oy + 12, 16, 4);
      x.fillStyle = C.stone; x.fillRect(ox + 1, oy + 12, 5, 1); x.fillRect(ox + 8, oy + 13, 6, 1); x.fillRect(ox + 3, oy + 14, 4, 1);
      x.fillStyle = C.stoneO; x.fillRect(ox, oy + 15, 16, 1);
      x.fillStyle = C.woodD;
      if (!isW(n(-1, 0))) { x.fillRect(ox, oy, 2, 12); x.fillStyle = C.woodO; x.fillRect(ox, oy, 1, 16); x.fillStyle = C.woodD; }
      if (!isW(n(1, 0))) { x.fillRect(ox + 14, oy, 2, 12); x.fillStyle = C.woodO; x.fillRect(ox + 15, oy, 1, 16); }
      if (kind === 'hwin') {
        x.fillStyle = C.woodO; x.fillRect(ox + 4, oy + 2, 8, 8);
        x.fillStyle = C.glass; x.fillRect(ox + 5, oy + 3, 6, 6);
        x.fillStyle = C.glassL; x.fillRect(ox + 5, oy + 3, 2, 2);
        x.fillStyle = C.woodO; x.fillRect(ox + 7, oy + 3, 2, 6); x.fillRect(ox + 5, oy + 5, 6, 1);
        x.fillStyle = C.wood; x.fillRect(ox + 2, oy + 2, 2, 8); x.fillRect(ox + 12, oy + 2, 2, 8);
        x.fillStyle = C.woodD; x.fillRect(ox + 2, oy + 5, 2, 1); x.fillRect(ox + 12, oy + 5, 2, 1);
      }
      if (kind === 'door') {
        x.fillStyle = C.woodO; x.fillRect(ox + 3, oy + 3, 10, 13); x.fillRect(ox + 4, oy + 2, 8, 1); x.fillRect(ox + 5, oy + 1, 6, 1);
        x.fillStyle = C.woodD; x.fillRect(ox + 4, oy + 4, 8, 12); x.fillRect(ox + 5, oy + 3, 6, 1); x.fillRect(ox + 6, oy + 2, 4, 1);
        x.fillStyle = C.wood; x.fillRect(ox + 5, oy + 4, 1, 12); x.fillRect(ox + 8, oy + 4, 1, 12);
        x.fillStyle = '#3a3a3e'; x.fillRect(ox + 4, oy + 6, 8, 1); x.fillRect(ox + 4, oy + 12, 8, 1);
        x.fillStyle = C.gold; x.fillRect(ox + 10, oy + 9, 1, 2);
      }
      break;
    }
    case 'fence': grass(x, ox, oy, tx, ty);
      if (n(0, -1) === 'fence' || n(0, 1) === 'fence' || n(0, -1).startsWith('roof')) {
        x.fillStyle = C.woodO; x.fillRect(ox + 6, oy, 4, 16);
        x.fillStyle = C.woodL; x.fillRect(ox + 7, oy, 2, 16);
        x.fillStyle = C.wood; x.fillRect(ox + 8, oy, 1, 16);
        x.fillStyle = C.woodD; x.fillRect(ox + 7, oy + 7, 2, 1); x.fillRect(ox + 7, oy + 15, 2, 1);
      } else {
        x.fillStyle = C.woodO; x.fillRect(ox, oy + 5, 16, 3); x.fillRect(ox, oy + 10, 16, 3);
        x.fillStyle = C.woodL; x.fillRect(ox, oy + 6, 16, 1); x.fillRect(ox, oy + 11, 16, 1);
      }
      break;
    case 'lamp': grass(x, ox, oy, tx, ty);
      x.fillStyle = C.grassDD; x.fillRect(ox + 4, oy + 14, 8, 2);
      x.fillStyle = C.ink; x.fillRect(ox + 7, oy + 4, 2, 11); x.fillRect(ox + 5, oy + 14, 6, 2);
      x.fillStyle = '#4a4a50'; x.fillRect(ox + 7, oy + 5, 1, 9);
      x.fillStyle = C.ink; x.fillRect(ox + 4, oy - 2, 8, 8); x.fillRect(ox + 5, oy - 3, 6, 1);
      x.fillStyle = C.glass; x.fillRect(ox + 5, oy - 1, 6, 5);
      x.fillStyle = C.glassL; x.fillRect(ox + 7, oy, 2, 3);
      x.fillStyle = C.ink; x.fillRect(ox + 4, oy + 1, 8, 1);
      break;
    case 'ctop': {
      x.fillStyle = C.woods; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.stone; x.fillRect(ox, oy + 9, 16, 7);
      x.fillStyle = C.stoneD; x.fillRect(ox, oy + 13, 16, 1); x.fillRect(ox + 4, oy + 9, 1, 4); x.fillRect(ox + 12, oy + 9, 1, 4);
      for (const a of [1, 9]) {
        x.fillStyle = C.stoneO; x.fillRect(ox + a - 1, oy + 3, 8, 7);
        x.fillStyle = C.stone; x.fillRect(ox + a, oy + 4, 6, 6);
        x.fillStyle = C.stoneL; x.fillRect(ox + a, oy + 4, 6, 1);
      }
      x.fillStyle = C.stoneL; x.fillRect(ox, oy + 9, 16, 1);
      break;
    }
    case 'cwall': bricks(x, ox, oy, C.stone, C.stoneD, C.stoneL, ty); break;
    case 'tower':
      bricks(x, ox, oy, '#a9a8c4', C.stoneD, C.stoneL, ty);
      x.fillStyle = C.stoneL; x.fillRect(ox + 1, oy, 2, 16);
      x.fillStyle = C.stoneD; x.fillRect(ox + 12, oy, 3, 16);
      x.fillStyle = C.stoneO; x.fillRect(ox, oy, 1, 16); x.fillRect(ox + 15, oy, 1, 16);
      if (n(0, -1) !== 'tower') { x.fillStyle = C.pineO; x.fillRect(ox + 6, oy + 4, 4, 5); x.fillStyle = '#ffe9a0'; x.fillRect(ox + 7, oy + 5, 2, 3); }
      break;
    case 'cwin': bricks(x, ox, oy, C.stone, C.stoneD, C.stoneL, ty);
      x.fillStyle = C.stoneO; x.fillRect(ox + 5, oy + 3, 6, 10); x.fillRect(ox + 6, oy + 2, 4, 1);
      x.fillStyle = '#ffe9a0'; x.fillRect(ox + 6, oy + 4, 4, 8); x.fillRect(ox + 7, oy + 3, 2, 1);
      x.fillStyle = '#ffc860'; x.fillRect(ox + 6, oy + 9, 4, 3);
      x.fillStyle = C.stoneO; x.fillRect(ox + 8, oy + 3, 1, 9);
      break;
    case 'gate': bricks(x, ox, oy, C.stone, C.stoneD, C.stoneL, ty);
      x.fillStyle = C.stoneO; x.fillRect(ox + 1, oy + 4, 14, 12); x.fillRect(ox + 3, oy + 2, 10, 2); x.fillRect(ox + 5, oy + 1, 6, 1);
      x.fillStyle = '#3a2a4a'; x.fillRect(ox + 2, oy + 5, 12, 11); x.fillRect(ox + 4, oy + 3, 8, 2); x.fillRect(ox + 6, oy + 2, 4, 1);
      x.fillStyle = C.carpet; x.fillRect(ox + 5, oy + 10, 6, 6);
      x.fillStyle = C.wood; x.fillRect(ox + 2, oy + 5, 2, 11); x.fillRect(ox + 12, oy + 5, 2, 11);
      x.fillStyle = C.gold; x.fillRect(ox + 3, oy + 9, 1, 1); x.fillRect(ox + 12, oy + 9, 1, 1);
      break;
    // ---- home
    case 'htop': x.fillStyle = '#5a3a3a'; x.fillRect(ox, oy, 16, 16); x.fillStyle = '#7a5040'; x.fillRect(ox, oy + 12, 16, 2); x.fillStyle = '#3a2228'; x.fillRect(ox, oy + 14, 16, 2); break;
    case 'paper': case 'hwindow': case 'shelf': case 'hearth': {
      bricks(x, ox, oy, C.plaster, C.plasterD, '#8e8476', ty);
      x.fillStyle = C.woodD; x.fillRect(ox, oy, 16, 2);
      x.fillStyle = C.wood; x.fillRect(ox, oy + 10, 16, 6);
      x.fillStyle = C.woodL; x.fillRect(ox, oy + 10, 16, 1);
      x.fillStyle = C.woodD; for (let i = 3; i < 16; i += 6) x.fillRect(ox + i, oy + 11, 1, 5); x.fillRect(ox, oy + 15, 16, 1);
      if (kind === 'hwindow') {
        x.fillStyle = C.woodO; x.fillRect(ox + 2, oy + 1, 12, 9);
        x.fillStyle = '#2c3058'; x.fillRect(ox + 3, oy + 2, 10, 7);
        x.fillStyle = '#4a4a7a'; x.fillRect(ox + 3, oy + 7, 10, 2);
        x.fillStyle = C.pineO; x.fillRect(ox + 3, oy + 6, 3, 3); x.fillRect(ox + 10, oy + 5, 3, 4);
        x.fillStyle = '#f4ecd8'; x.fillRect(ox + 5, oy + 3, 1, 1); x.fillRect(ox + 10, oy + 3, 1, 1);
        x.fillStyle = C.woodD; x.fillRect(ox + 7, oy + 2, 2, 7);
        x.fillStyle = '#6a2a2a'; x.fillRect(ox + 2, oy + 1, 3, 9); x.fillRect(ox + 11, oy + 1, 3, 9);
        x.fillStyle = '#8a3a34'; x.fillRect(ox + 2, oy + 1, 1, 9); x.fillRect(ox + 11, oy + 1, 1, 9);
      }
      if (kind === 'shelf') {
        x.fillStyle = C.woodO; x.fillRect(ox + 1, oy, 14, 16);
        x.fillStyle = C.woodD; x.fillRect(ox + 2, oy + 1, 12, 14);
        for (const sy of [1, 8]) for (let i = 0; i < 6; i++) {
          const h = 5 + ((hash(tx, i, sy) * 2) | 0);
          x.fillStyle = ['#7a2a2a', '#2e4a6a', '#a8823e', '#3e5a3a', '#4a2e6a', '#6a4226'][(hash(tx + i, sy, 2) * 6) | 0];
          x.fillRect(ox + 2 + i * 2, oy + sy + 7 - h, 2, h);
        }
        x.fillStyle = C.wood; x.fillRect(ox + 2, oy + 7, 12, 1); x.fillRect(ox + 2, oy + 14, 12, 1);
      }
      if (kind === 'hearth') {
        x.fillStyle = C.stoneO; x.fillRect(ox, oy + 1, 16, 15);
        x.fillStyle = C.stone; x.fillRect(ox + 1, oy + 2, 14, 14);
        x.fillStyle = C.stoneD; for (let r = 5; r < 16; r += 4) x.fillRect(ox + 1, oy + r, 14, 1);
        x.fillStyle = C.stoneL; x.fillRect(ox + 1, oy + 2, 14, 1);
        x.fillStyle = '#2a1a22'; x.fillRect(ox + 4, oy + 7, 8, 9); x.fillRect(ox + 5, oy + 6, 6, 1);
      }
      break;
    }
    case 'floor': planks(x, ox, oy, tx, ty); break;
    case 'rug': planks(x, ox, oy, tx, ty); {
      const r = k => k === 'rug';
      const sides = [!r(n(0, -1)), !r(n(0, 1)), !r(n(-1, 0)), !r(n(1, 0))];
      x.fillStyle = '#7e2228'; x.fillRect(ox + (sides[2] ? 1 : 0), oy + (sides[0] ? 1 : 0), 16 - (sides[2] ? 1 : 0) - (sides[3] ? 1 : 0), 16 - (sides[0] ? 1 : 0) - (sides[1] ? 1 : 0));
      x.fillStyle = C.goldD;
      if (sides[0]) x.fillRect(ox, oy + 3, 16, 1);
      if (sides[1]) x.fillRect(ox, oy + 12, 16, 1);
      if (sides[2]) x.fillRect(ox + 3, oy, 1, 16);
      if (sides[3]) x.fillRect(ox + 12, oy, 1, 16);
      x.fillStyle = C.gold; x.fillRect(ox + 7, oy + 6, 2, 4); x.fillRect(ox + 6, oy + 7, 4, 2);
      if (sides[0]) { x.fillStyle = C.floor; x.fillRect(ox, oy, 16, 1); }
      if (sides[1]) { x.fillStyle = C.floor; x.fillRect(ox, oy + 15, 16, 1); }
      if (sides[2]) { x.fillStyle = C.floor; x.fillRect(ox, oy, 1, 16); }
      if (sides[3]) { x.fillStyle = C.floor; x.fillRect(ox + 15, oy, 1, 16); }
      break; }
    case 'bedT': planks(x, ox, oy, tx, ty); grid(x, BED_TOP, ox, oy, PAL.bed); break;
    case 'bedB': planks(x, ox, oy, tx, ty); grid(x, BED_BOT, ox, oy, PAL.bed); break;
    case 'table': case 'tableL': {
      planks(x, ox, oy, tx, ty);
      const L = !n(-1, 0).startsWith('table'), R = !n(1, 0).startsWith('table');
      x.fillStyle = C.floorK; x.fillRect(ox + (L ? 1 : 0), oy + 13, 16 - (L ? 2 : 0) - (R ? 1 : 0), 2);
      x.fillStyle = C.woodO; x.fillRect(ox + (L ? 1 : 0), oy + 3, 16 - (L ? 1 : 0) - (R ? 1 : 0), 10);
      x.fillStyle = C.woodL; x.fillRect(ox + (L ? 2 : 0), oy + 4, 16 - (L ? 2 : 0) - (R ? 2 : 0), 6);
      x.fillStyle = C.wood; x.fillRect(ox + (L ? 2 : 0), oy + 10, 16 - (L ? 2 : 0) - (R ? 2 : 0), 2);
      x.fillStyle = C.woodO; if (L) x.fillRect(ox + 2, oy + 12, 2, 3); if (R) x.fillRect(ox + 12, oy + 12, 2, 3);
      if (kind === 'tableL') {
        x.fillStyle = C.ink; x.fillRect(ox + 4, oy + 4, 9, 6);
        x.fillStyle = '#ffffff'; x.fillRect(ox + 5, oy + 5, 7, 4);
        x.fillStyle = '#d8d0e8'; x.fillRect(ox + 5, oy + 5, 1, 1); x.fillRect(ox + 6, oy + 6, 1, 1); x.fillRect(ox + 10, oy + 6, 1, 1); x.fillRect(ox + 11, oy + 5, 1, 1);
        x.fillStyle = '#c0c8e8'; x.fillRect(ox + 7, oy + 7, 3, 2);
      } else {
        x.fillStyle = C.ink; x.fillRect(ox + 5, oy + 3, 6, 5);
        x.fillStyle = '#ffffff'; x.fillRect(ox + 6, oy + 4, 4, 3);
        x.fillStyle = '#c0703a'; x.fillRect(ox + 6, oy + 4, 4, 1);
      }
      break;
    }
    case 'pot': planks(x, ox, oy, tx, ty); grid(x, POT, ox, oy, PAL.pot); break;
    case 'cauldron': planks(x, ox, oy, tx, ty);
      x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(ox + 2, oy + 13, 13, 3);
      x.fillStyle = C.ink; x.fillRect(ox + 2, oy + 4, 12, 10); x.fillRect(ox + 3, oy + 14, 10, 1); x.fillRect(ox + 1, oy + 4, 14, 2);
      x.fillStyle = '#2e2a34'; x.fillRect(ox + 3, oy + 6, 10, 7);
      x.fillStyle = '#46404e'; x.fillRect(ox + 4, oy + 7, 2, 5);
      x.fillStyle = '#5ad84a'; x.fillRect(ox + 2, oy + 4, 12, 2);
      x.fillStyle = '#a8ff8a'; x.fillRect(ox + 4, oy + 4, 3, 1); x.fillRect(ox + 10, oy + 5, 2, 1);
      x.fillStyle = C.ink; x.fillRect(ox + 3, oy + 14, 2, 2); x.fillRect(ox + 11, oy + 14, 2, 2);
      break;
    case 'exit':
      x.fillStyle = '#3a2228'; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.floor; x.fillRect(ox + 1, oy, 14, 10);
      x.fillStyle = '#5a3a2a'; x.fillRect(ox + 2, oy + 1, 12, 7);
      x.fillStyle = '#7a5236'; for (let i = 3; i < 14; i += 2) x.fillRect(ox + i, oy + 2, 1, 5);
      x.fillStyle = '#3a3a6a'; x.fillRect(ox + 1, oy + 10, 14, 6);
      x.fillStyle = C.grass; x.fillRect(ox + 1, oy + 13, 14, 3);
      break;
    // ---- castle interior
    case 'ktop': x.fillStyle = '#3a3458'; x.fillRect(ox, oy, 16, 16); x.fillStyle = '#4c4572'; x.fillRect(ox, oy + 13, 16, 3); break;
    case 'kwall': case 'banner': case 'torch':
      bricks(x, ox, oy, C.cstoneD, C.cstoneO, C.cstone, ty);
      x.fillStyle = C.cstoneO; x.fillRect(ox, oy + 14, 16, 2);
      if (kind === 'banner') {
        x.fillStyle = C.ink; x.fillRect(ox + 3, oy, 10, 14); x.fillRect(ox + 5, oy + 14, 6, 1); x.fillRect(ox + 7, oy + 15, 2, 1);
        x.fillStyle = C.purple; x.fillRect(ox + 4, oy, 8, 13); x.fillRect(ox + 6, oy + 13, 4, 1);
        x.fillStyle = '#9a7ae8'; x.fillRect(ox + 4, oy, 2, 13);
        x.fillStyle = C.gold; x.fillRect(ox + 4, oy + 1, 8, 1); x.fillRect(ox + 7, oy + 4, 2, 1); x.fillRect(ox + 6, oy + 5, 4, 2); x.fillRect(ox + 7, oy + 7, 2, 1);
      }
      if (kind === 'torch') {
        x.fillStyle = C.ink; x.fillRect(ox + 6, oy + 7, 4, 6);
        x.fillStyle = C.wood; x.fillRect(ox + 7, oy + 8, 2, 4);
        x.fillStyle = C.goldD; x.fillRect(ox + 5, oy + 6, 6, 2);
      }
      break;
    case 'kfloor': stoneFloor(x, ox, oy, tx, ty); break;
    case 'carpet': {
      x.fillStyle = C.carpet; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.carpetD; for (let i = 2; i < 16; i += 6) x.fillRect(ox + 6, oy + i, 4, 2);
      const c = k => k === 'carpet' || k === 'throne';
      if (!c(n(-1, 0))) { x.fillStyle = C.gold; x.fillRect(ox, oy, 2, 16); x.fillStyle = C.goldD; x.fillRect(ox + 2, oy, 1, 16); }
      if (!c(n(1, 0))) { x.fillStyle = C.gold; x.fillRect(ox + 14, oy, 2, 16); x.fillStyle = C.goldD; x.fillRect(ox + 13, oy, 1, 16); }
      break;
    }
    case 'throne': x.fillStyle = C.carpet; x.fillRect(ox, oy, 16, 16); grid(x, THRONE, ox, oy, PAL.throne); break;
    case 'kpillar': stoneFloor(x, ox, oy, tx, ty);
      x.fillStyle = 'rgba(40,30,70,0.3)'; x.fillRect(ox + 3, oy + 13, 12, 3);
      x.fillStyle = C.cstoneO; x.fillRect(ox + 2, oy, 12, 16);
      x.fillStyle = C.cstoneL; x.fillRect(ox + 3, oy, 10, 15);
      x.fillStyle = '#ffffff'; x.fillRect(ox + 4, oy, 2, 15);
      x.fillStyle = C.cstone; x.fillRect(ox + 10, oy, 2, 15); x.fillRect(ox + 3, oy + 12, 10, 3);
      break;
    case 'kexit':
      stoneFloor(x, ox, oy, tx, ty);
      x.fillStyle = '#2a2240'; x.fillRect(ox + 1, oy + 4, 14, 12); x.fillRect(ox + 3, oy + 2, 10, 2);
      break;
    default: x.fillStyle = '#f0f'; x.fillRect(ox, oy, 16, 16);
  }
}

// Second pass, drawn top row first: things that spill over their tile (tree tops,
// tower roofs), so neighbours overlap like a real forest.
export function drawOver(x, kind, ox, oy, m, tx, ty) {
  if (kind === 'tree') {
    const h = hash(tx, ty, 77), dx = h < 0.33 ? -1 : h > 0.66 ? 1 : 0;
    // twisted trunk with roots
    x.fillStyle = C.ink; x.fillRect(ox + 5, oy + 9, 6, 7); x.fillRect(ox + 3, oy + 14, 10, 2);
    x.fillStyle = C.trunkD; x.fillRect(ox + 6, oy + 9, 4, 6); x.fillRect(ox + 4, oy + 14, 2, 1); x.fillRect(ox + 10, oy + 14, 2, 1);
    x.fillStyle = C.trunk; x.fillRect(ox + 6, oy + 10, 2, 4); x.fillRect(ox + 8, oy + 12, 1, 2);
    const j = k => (hash(tx, ty, k) - 0.5) * 1.6;
    const pal = { o: C.leafO, g: C.leaf, l: C.leafL, d: C.leafD };
    blob(x, ox + dx, oy, [[5 + j(1), 0 + j(2), 4.2], [11 + j(3), 0.5 + j(4), 4.4], [2.6, 5.5 + j(5), 4], [13.4, 5 + j(6), 4], [8 + j(7), 2 + j(8), 5], [5.5, 7.5, 4.4], [10.5, 7.5, 4.4]], pal, tx * 7 + ty);
  } else if (kind === 'lamp') {
    // nothing extra: the light is added at run time
  } else if (kind === 'pine') {
    const tiers = [[-6, 6, 3.5], [-2, 7, 5.5], [3, 9, 7.5]];
    const inT = (i, j) => {
      for (let k = tiers.length - 1; k >= 0; k--) {
        const [t, hgt, w] = tiers[k], r = j - t;
        if (r < 0 || r > hgt) continue;
        const half = 0.8 + (w - 0.8) * r / hgt;
        if (Math.abs(i + 0.5 - 8) <= half) return k;
      }
      return -1;
    };
    x.fillStyle = C.trunkD; x.fillRect(ox + 6, oy + 11, 4, 5); x.fillStyle = C.trunk; x.fillRect(ox + 7, oy + 11, 2, 4);
    for (let j = -7; j <= 13; j++) for (let i = -1; i <= 16; i++) {
      const k = inT(i, j);
      if (k < 0) continue;
      let col;
      const nb = [inT(i - 1, j), inT(i + 1, j), inT(i, j - 1), inT(i, j + 1)];
      if (nb.includes(-1)) col = C.pineO;
      else {
        const [t, hgt] = tiers[k], r = (j - t) / hgt;
        col = i + 0.5 > 8.5 ? C.pineD : C.pine;
        if (i + 0.5 < 6.5 && r < 0.7) col = C.pineL;
        if (r > 0.8 || nb[3] !== k) col = C.pineD;
        if (nb[3] !== k && nb[3] >= 0) col = C.pineO;
      }
      x.fillStyle = col; x.fillRect(ox + i, oy + j, 1, 1);
    }
  } else if (kind === 'tower' && m.kind(tx, ty - 1) !== 'tower') {
    // blue cone roof with a little flag
    for (let j = 0; j < 13; j++) {
      const half = Math.round(1 + j * 0.62);
      for (let i = 8 - half; i < 8 + half; i++) {
        const edge = i === 8 - half || i === 8 + half - 1 || j === 12;
        x.fillStyle = edge ? '#16181e' : i < 7 ? '#6a7488' : (j % 3 === 2 ? '#383e4e' : '#4e5668');
        x.fillRect(ox + i, oy - 10 + j, 1, 1);
      }
    }
    x.fillStyle = C.ink; x.fillRect(ox + 7, oy - 15, 1, 6);
    x.fillStyle = C.purple; x.fillRect(ox + 8, oy - 15, 4, 3); x.fillRect(ox + 8, oy - 12, 2, 1); x.fillStyle = C.gold; x.fillRect(ox + 9, oy - 14, 1, 1);
  }
}

// Little flames for torches/hearth, drawn every frame on top of the map.
export function flame(x, ox, oy, t, big) {
  const f = Math.floor(t * 10) % 3;
  const h = big ? 7 : 5;
  x.fillStyle = '#f0603a'; x.fillRect(ox - (big ? 3 : 2), oy - h + 2, big ? 7 : 5, h - 1);
  x.fillStyle = '#ffa83a'; x.fillRect(ox - 1 - (f === 1 ? 1 : 0), oy - h + 1, 3, h - 1);
  x.fillStyle = '#fff07a'; x.fillRect(ox - (f === 2 ? 1 : 0), oy - h + 3 + (f === 0 ? 1 : 0), 2, h - 4);
  x.fillStyle = '#ffffff'; x.fillRect(ox, oy - 2, 1, 1);
}
