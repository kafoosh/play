// All graphics are drawn in code: a 5x7 bitmap font, string-grid sprites and
// procedural tiles. Nothing is loaded from disk, so the game starts instantly.

export const C = {
  ink: '#1a1426', white: '#fff6e6', black: '#000000',
  grass: '#5d9e4a', grassD: '#467f3b', grassL: '#82bf5c',
  path: '#d6ad6e', pathD: '#b38a50', pathL: '#ead095',
  leaf: '#2f7a3e', leafD: '#1d5530', leafL: '#4fa04c', trunk: '#6b4428', trunkD: '#4a2d1a',
  pine: '#2a6346', pineD: '#1a4532', pineL: '#3d8058', floorD: '#2f5a33',
  water: '#3b78d0', waterD: '#2c5aa6', waterL: '#8cc4f4',
  wood: '#a5683a', woodD: '#71441f', woodL: '#cf9356',
  stone: '#9295a8', stoneD: '#62657c', stoneL: '#c3c5d3',
  roof: '#c04a3e', roofD: '#8a2f2b', roofL: '#e0705a',
  wall: '#ead6aa', wallD: '#c4a878',
  gold: '#f3c646', goldD: '#b8862a', red: '#d33a3a', redD: '#8f2330',
  purple: '#6a4aa8', purpleD: '#46307a', cyan: '#7ff0ff', pink: '#f08aa8',
  paper: '#7c5a8f', paperD: '#664a78', floor: '#b9824c', floorK: '#94643a',
  cstone: '#5b5873', cstoneD: '#454259', cstoneL: '#77738f', carpet: '#a8303a', carpetD: '#7f2230',
};

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
// Text with a 1px dark outline (scaled), for titles drawn over pictures.
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

// Retro window: dark fill, light border with rounded corners.
export function box(x, ox, oy, w, h, fill = '#14122a', edge = C.white) {
  x.fillStyle = C.ink; x.fillRect(ox, oy + 1, w, h - 2); x.fillRect(ox + 1, oy, w - 2, h);
  x.fillStyle = edge; x.fillRect(ox + 2, oy + 1, w - 4, h - 2); x.fillRect(ox + 1, oy + 2, w - 2, h - 4);
  x.fillStyle = fill; x.fillRect(ox + 2, oy + 3, w - 4, h - 6); x.fillRect(ox + 3, oy + 2, w - 6, h - 4);
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
  x.fillStyle = '#e8dcc4'; x.fillRect(ox + 2, oy + H - 3, W - 4, 1);
  const lab = VALUE_LABEL[v];
  const corner = () => {
    text(x, lab, ox + 4, oy + 4, col);
    suitIcon(x, s, ox + 3 + (lab.length === 2 ? 2 : 0), oy + 13, col);
  };
  corner();
  x.save(); x.translate(ox * 2 + W, oy * 2 + H); x.rotate(Math.PI); corner(); x.restore();
  suitIcon(x, s, ox + 14, oy + 21, col, 3);
}

// ---------------------------------------------------------------- characters
// 16x16 person, built from a top half (per facing) and legs (per walk frame).
const TOP = {
  down: [
    '......oooo......', '....oohhhhoo....', '...ohhhhhhhho...', '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..', '..ohssssssssho..', '..ohsessssesho..', '..ohsessssesho..',
    '...osssssssso...', '....oossssoo....', '...otttttttto...', '..osttttttttso..',
    '..oobbbbbbbboo..', '...oTTTTTTTTo...'],
  up: [
    '......oooo......', '....oohhhhoo....', '...ohhhhhhhho...', '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '..ohhhhhhhhhho..',
    '...ohhhhhhhho...', '....oossssoo....', '...otttttttto...', '..osttttttttso..',
    '..oobbbbbbbboo..', '...oTTTTTTTTo...'],
  side: [
    '......oooo......', '....oohhhhoo....', '...ohhhhhhhho...', '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..', '..ohhhhhssssso..', '..ohhhhsssesso..', '..ohhhhsssesso..',
    '...ohhhssssso...', '....oossssoo....', '....otttttto....', '....otttstto....',
    '....obbbbbbo....', '....oTTTTTTo....'],
};
const LEGS = {
  down: [['....obbo.obbo...', '....oooo.oooo...'], ['....oooo.obbo...', '.........oooo...'], ['....obbo.oooo...', '....oooo........']],
  side: [['.....obbo.......', '.....oooo.......'], ['....obo.obo.....', '....oo...oo.....'], ['....obo.obo.....', '....oo...oo.....']],
};
const set = (rows, i, j, ch) => { rows[j] = rows[j].slice(0, i) + ch + rows[j].slice(i + 1); };

function personRows(look, dir, frame) {
  const face = dir === 'left' || dir === 'right' ? 'side' : dir;
  const rows = TOP[face].slice();
  const legs = LEGS[face === 'side' ? 'side' : 'down'][frame % 3];
  rows.push(legs[0], legs[1]);
  if (look.long) {
    for (let j = 8; j <= 10; j++) {
      if (face === 'down') { set(rows, 2, j, 'o'); set(rows, 3, j, 'h'); set(rows, 12, j, 'h'); set(rows, 13, j, 'o'); }
      else if (face === 'up') { set(rows, 2, j, 'o'); set(rows, 13, j, 'o'); for (let i = 3; i <= 12; i++) set(rows, i, j, 'h'); }
      else { set(rows, 3, j, 'o'); set(rows, 4, j, 'h'); set(rows, 5, j, 'h'); }
    }
  }
  if (look.beard) {
    if (face === 'down') { for (let i = 4; i <= 11; i++) { set(rows, i, 8, 'w'); } for (let i = 5; i <= 10; i++) set(rows, i, 9, 'w'); set(rows, 6, 10, 'w'); set(rows, 7, 10, 'w'); set(rows, 8, 10, 'w'); set(rows, 9, 10, 'w'); }
    else if (face === 'side') { for (let i = 8; i <= 12; i++) set(rows, i, 8, 'w'); for (let i = 8; i <= 11; i++) set(rows, i, 9, 'w'); }
  }
  if (look.acc === 'cap') {
    for (let j = 0; j <= 3; j++) rows[j] = rows[j].replace(/h/g, 'c');
    if (face !== 'up') { set(rows, face === 'side' ? 4 : 12, 0, 'f'); set(rows, face === 'side' ? 3 : 13, 0, 'f'); set(rows, face === 'side' ? 3 : 13, 1, 'f'); }
  }
  if (look.acc === 'helmet') { set(rows, 7, 0, 'r'); set(rows, 8, 0, 'r'); set(rows, 8, 1, 'r'); }
  if (look.kid) rows.splice(11, 1), rows.splice(3, 1);
  return rows;
}

function personPal(look) {
  const hair = look.acc === 'hood' ? look.hood : look.acc === 'helmet' ? '#a9adbd' : look.hair;
  return {
    o: C.ink, h: hair, s: look.skin, e: C.ink, t: look.tunic, T: look.tunicD || shade(look.tunic),
    b: look.boots || '#4a2d1a', w: look.beardColor || '#f2efe6', r: C.red, c: look.cap || '#c04a3e', f: '#fff6e6',
  };
}

export function shade(hex, k = 0.72) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
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
  '.....ohhhhHo....', '....ohhhyhhHo...', '..ooHHHHHHHHHoo.', '.oHHHHHHHHHHHHHo', '..ooossssssooo..', '...osesssseso...',
  '...obbssssbbo...', '...obbbbbbbbo...', '..orrbbbbbbBrro.', '..orrrbbbbBrrro.', '..orrrrbbBrrrro.', '..orrrrrBrrrrro.',
  '..orryrrrrrrRro.', '..orrrrrrrrrRro.', '..orrrrrrryrRro.', '..orrrrrrrrrRro.', '.orrrrrrrrrrrRro', '.ooooooooooooooo'];

const sprCache = new Map();
// Returns a canvas for a character look at a facing and frame.
export function charSprite(look, dir = 'down', frame = 0) {
  const key = look.key + dir + frame;
  let c = sprCache.get(key);
  if (c) return c;
  let x;
  if (look.kind === 'wizard') {
    [c, x] = makeCanvas(20, 26);
    grid(x, WIZARD, 0, 2, { o: C.ink, h: '#5a3fb0', H: '#3c2a7c', y: C.gold, s: '#f2c9a0', e: C.ink, b: '#eeeae0', B: '#bdb8ae', r: '#3f55c6', R: '#2c3c94' });
    // staff, raised on frame 1
    const up = frame ? 3 : 0;
    x.fillStyle = C.ink; x.fillRect(14, 9 - up, 3, 17 + up - (frame ? 2 : 0));
    x.fillStyle = C.woodD; x.fillRect(15, 10 - up, 1, 15 + up - (frame ? 2 : 0));
    x.fillStyle = C.ink; x.fillRect(13, 4 - up, 5, 6); x.fillRect(14, 3 - up, 3, 8);
    x.fillStyle = frame ? '#ffffff' : C.cyan; x.fillRect(14, 5 - up, 3, 4); x.fillRect(15, 4 - up, 1, 6);
  } else if (look.kind === 'cat' || look.kind === 'chicken' || look.kind === 'frog') {
    [c, x] = makeCanvas(16, 16);
    if (look.kind === 'cat') {
      grid(x, CAT, 0, 0, { o: C.ink, G: '#8a8698', e: '#f3e04a', p: C.pink, W: '#f2efe6' });
      x.fillStyle = C.ink;
      if (frame % 2) { x.fillRect(12, 11, 1, 4); x.fillRect(13, 10, 1, 2); } else { x.fillRect(12, 13, 3, 1); x.fillRect(14, 12, 1, 1); }
    } else if (look.kind === 'chicken') {
      const rows = frame % 2 ? ['................', ...CHICKEN.slice(0, 15)].map((r, j) => (j > 8 ? CHICKEN[j] : r)) : CHICKEN;
      grid(x, rows, 0, 0, { o: C.ink, R: C.red, W: '#fbf7ee', e: C.ink, y: C.gold }, dir === 'right');
    } else {
      grid(x, FROG, 0, frame % 2 ? -2 : 0, { o: C.ink, G: '#5fb844', e: C.ink, R: '#2f6d2a' });
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

// ---------------------------------------------------------------- tile sprites
const TREE = ['....oooooooo....', '..oogggglllgoo..', '.oggggglllllggo.', '.ogggggglllgggo.', 'oggggggggggggggo', 'oggdggggggggdggo',
  'ogggggggdggggggo', 'oggggdggggggdggo', 'ogdggggggggggdgo', '.oggdggggggdggo.', '..oggggddgggoo..', '...oooggggooo...',
  '......otto......', '......otto......', '.....okttko.....', '....ssssssss....'];
const PINE = ['.......oo.......', '......oggo......', '.....oggggo.....', '....ogglgggo....', '...oggglggggo...', '....oogggggo....',
  '...oggglgggggo..', '..oggggglggggo..', '.ogggggglgggggo.', '...ooggggggoo...', '..oggggglgggggo.', '.ogggggggglggggo.',
  'oggggggggglggggo', '.oooooottoooooo.', '.......tt.......', '.....ssssss.....'];
const ROCK = ['', '', '', '', '', '.....oooooo.....', '...oollllggoo...', '..ollllgggggdo..', '.olllgggggggddo.', '.ollggggggggddo.',
  '.oggggggggdddo..', '..oggggggdddoo..', '...oooooooooo...', '...ssssssssss...'];
const STUMP = ['', '', '', '', '', '', '', '.....oooooo.....', '....ollllllo....', '....olkkkklo....', '....ollllllo....',
  '....oggggggo....', '....ogdggdgo....', '...ogggggggo....', '...ooooooooo....', '....ssssssss....'];
const SIGN = ['', '', '', '..oooooooooooo..', '..olllllllllgo..', '..olkkkkkkklgo..', '..olllllllllgo..', '..olkkkkklllgo..',
  '..oggggggggggo..', '..oooooooooooo..', '.......kk.......', '.......kk.......', '.......kk.......', '.......kk.......',
  '......okko......', '.....ssssss.....'];
const WELL = ['..oooooooooooo..', '.orrrrrrrrrrrro.', 'oRRRRRRRRRRRRRRo', '.oooooooooooooo.', '...k........k...', '...k........k...',
  '..oooooooooooo..', '.ollllllllllllo.', '.olbbbbbbbbbblo.', '.olbbbbbbbbbblo.', '.ollllllllllllo.', '.ogdgggdgggdggo.',
  '.ogggdgggdggggo.', '.oooooooooooooo.', '..ssssssssssss..'];
const PILLAR = ['', '', '', '.....oo.oo......', '....olloggo.....', '....ollggdo.....', '....olgggdo.....', '....olgggdo.....',
  '....olgggdo.....', '....olgggdo.....', '....olgggdo.....', '....olgggdo.....', '....olgggdo.....', '...ooooooooo....',
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
  tree: { o: C.leafD, g: C.leaf, l: C.leafL, d: C.leafD, t: C.trunk, k: C.trunkD, s: C.grassD },
  pine: { o: C.pineD, g: C.pine, l: C.pineL, t: C.trunkD, s: C.floorD },
  rock: { o: C.ink, l: C.stoneL, g: C.stone, d: C.stoneD, s: C.grassD },
  stump: { o: C.ink, l: C.woodL, k: C.wood, g: C.wood, d: C.woodD, s: C.grassD },
  sign: { o: C.ink, l: C.woodL, g: C.wood, k: C.woodD, s: C.grassD },
  well: { o: C.ink, r: C.roof, R: C.roofD, k: C.woodD, l: C.stoneL, b: '#16264a', g: C.stone, d: C.stoneD, s: C.grassD },
  pillar: { o: C.ink, l: C.stoneL, g: C.stone, d: C.stoneD, s: C.grassD },
  pot: { o: C.ink, k: '#7a3a22', g: '#b5603a', l: '#d98a5a', d: '#86422a', s: C.floorK },
  bed: { o: C.ink, k: C.woodD, g: C.wood, w: '#d9dcef', W: '#ffffff', Q: '#2f4f9e', q: '#4a72c8' },
  throne: { o: C.ink, y: C.gold, Y: C.goldD, R: C.carpet },
};

// ---------------------------------------------------------------- procedural tiles
function speck(x, ox, oy, tx, ty, col, n, s) {
  x.fillStyle = col;
  for (let k = 0; k < n; k++) x.fillRect(ox + ((hash(tx, ty, s + k) * 16) | 0), oy + ((hash(tx, ty, s + k + 50) * 16) | 0), 1, 1);
}
function grass(x, ox, oy, tx, ty, dark) {
  x.fillStyle = dark ? C.floorD : C.grass; x.fillRect(ox, oy, 16, 16);
  if (dark) return;
  speck(x, ox, oy, tx, ty, C.grassD, 5, 1);
  speck(x, ox, oy, tx, ty, C.grassL, 3, 9);
  x.fillStyle = C.grassD;
  const a = (hash(tx, ty, 3) * 12) | 0, b = (hash(tx, ty, 4) * 12) | 0;
  x.fillRect(ox + a + 1, oy + b + 2, 1, 2); x.fillRect(ox + a + 3, oy + b + 1, 1, 3);
}
function bricks(x, ox, oy, base, dark, light, ty) {
  x.fillStyle = base; x.fillRect(ox, oy, 16, 16);
  for (let r = 0; r < 4; r++) {
    x.fillStyle = dark; x.fillRect(ox, oy + r * 4 + 3, 16, 1);
    const off = (r + ty) % 2 ? 0 : 4;
    for (let i = off; i < 16; i += 8) x.fillRect(ox + i, oy + r * 4, 1, 3);
    x.fillStyle = light;
    for (let i = off + 1; i < 16; i += 8) x.fillRect(ox + i, oy + r * 4, 3, 1);
  }
}
function planks(x, ox, oy, tx, ty) {
  x.fillStyle = C.floor; x.fillRect(ox, oy, 16, 16);
  x.fillStyle = C.floorK;
  for (let r = 0; r < 4; r++) {
    x.fillRect(ox, oy + r * 4 + 3, 16, 1);
    x.fillRect(ox + ((hash(tx, ty * 4 + r, 7) * 16) | 0), oy + r * 4, 1, 3);
  }
}
function stoneFloor(x, ox, oy, tx, ty) {
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    x.fillStyle = (i + j + tx + ty) % 2 ? C.cstone : C.cstoneL;
    x.fillRect(ox + i * 8, oy + j * 8, 8, 8);
  }
  x.fillStyle = C.cstoneD; x.fillRect(ox, oy + 15, 16, 1); x.fillRect(ox + 15, oy, 1, 16); x.fillRect(ox + 7, oy, 1, 16); x.fillRect(ox, oy + 7, 16, 1);
}

// Draw a single tile. `m` exposes at(tx,ty) for neighbour-aware edges.
export function drawTile(x, kind, ox, oy, m, tx, ty, frame) {
  const n = (dx, dy) => m.kind(tx + dx, ty + dy);
  switch (kind) {
    case 'grass': grass(x, ox, oy, tx, ty); break;
    case 'grass2': grass(x, ox, oy, tx, ty); x.fillStyle = C.grassL; x.fillRect(ox + 3, oy + 4, 9, 6); x.fillRect(ox + 5, oy + 3, 5, 8); speck(x, ox, oy, tx, ty, C.grass, 4, 20); break;
    case 'tall': grass(x, ox, oy, tx, ty);
      for (let k = 0; k < 4; k++) {
        const a = ox + 1 + ((k * 4 + hash(tx, ty, k) * 2) | 0), b = oy + 4 + ((hash(tx, ty, k + 9) * 8) | 0);
        x.fillStyle = C.grassD; x.fillRect(a, b, 1, 4); x.fillRect(a + 2, b, 1, 4); x.fillRect(a + 1, b + 2, 1, 2);
        x.fillStyle = C.grassL; x.fillRect(a, b - 1, 1, 1); x.fillRect(a + 2, b - 1, 1, 1);
      }
      break;
    case 'flowers': grass(x, ox, oy, tx, ty);
      for (let k = 0; k < 3; k++) {
        const a = ox + 2 + ((hash(tx, ty, k + 30) * 11) | 0), b = oy + 2 + ((hash(tx, ty, k + 40) * 11) | 0);
        x.fillStyle = ['#ffffff', '#f3e04a', '#f06a8a', '#b9a0ff'][(hash(tx, ty, k + 60) * 4) | 0];
        x.fillRect(a, b - 1, 1, 1); x.fillRect(a - 1, b, 3, 1); x.fillRect(a, b + 1, 1, 1);
        x.fillStyle = C.gold; x.fillRect(a, b, 1, 1);
      }
      break;
    case 'path': {
      x.fillStyle = C.path; x.fillRect(ox, oy, 16, 16);
      speck(x, ox, oy, tx, ty, C.pathD, 5, 11); speck(x, ox, oy, tx, ty, C.pathL, 4, 21);
      const isP = k => k === 'path' || k === 'bridge' || k === 'door' || k === 'gate';
      x.fillStyle = C.grass;
      for (let i = 0; i < 16; i += 2) {
        const w = 1 + ((hash(tx * 3 + i, ty, 5) * 2) | 0);
        if (!isP(n(0, -1)) && n(0, -1) !== 'water') x.fillRect(ox + i, oy, 2, w);
        if (!isP(n(0, 1)) && n(0, 1) !== 'water') x.fillRect(ox + i, oy + 16 - w, 2, w);
        if (!isP(n(-1, 0))) x.fillRect(ox, oy + i, w, 2);
        if (!isP(n(1, 0))) x.fillRect(ox + 16 - w, oy + i, w, 2);
      }
      break;
    }
    case 'water': {
      x.fillStyle = C.water; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.waterD;
      for (let k = 0; k < 3; k++) x.fillRect(ox + ((hash(tx, ty, k + 70) * 12) | 0), oy + 2 + k * 5, 4, 1);
      x.fillStyle = C.waterL;
      for (let k = 0; k < 2; k++) {
        const a = ((hash(tx, ty, k + 80) * 10) | 0) + (frame ? 2 : 0), b = 3 + k * 7 + (frame ? 1 : 0);
        x.fillRect(ox + a, oy + b, 3, 1); x.fillRect(ox + a + 1, oy + b - 1, 1, 1);
      }
      const land = k => k && k !== 'water' && k !== 'bridge';
      if (land(n(0, -1))) { x.fillStyle = C.waterL; x.fillRect(ox, oy, 16, 2); x.fillStyle = '#ffffff'; for (let i = frame; i < 16; i += 4) x.fillRect(ox + i, oy + 2, 2, 1); }
      if (land(n(-1, 0))) { x.fillStyle = C.waterL; x.fillRect(ox, oy, 2, 16); }
      if (land(n(1, 0))) { x.fillStyle = C.waterL; x.fillRect(ox + 14, oy, 2, 16); }
      if (land(n(0, 1))) { x.fillStyle = C.waterD; x.fillRect(ox, oy + 14, 16, 2); }
      break;
    }
    case 'bridge':
      x.fillStyle = C.water; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.wood; x.fillRect(ox + 2, oy, 12, 16);
      x.fillStyle = C.woodD; for (let r = 3; r < 16; r += 4) x.fillRect(ox + 2, oy + r, 12, 1);
      x.fillStyle = C.woodL; for (let r = 0; r < 16; r += 4) x.fillRect(ox + 3, oy + r, 10, 1);
      x.fillStyle = C.ink; x.fillRect(ox + 1, oy, 1, 16); x.fillRect(ox + 14, oy, 1, 16);
      x.fillStyle = C.woodD; x.fillRect(ox + 2, oy, 1, 16); x.fillRect(ox + 13, oy, 1, 16);
      break;
    case 'tree': grass(x, ox, oy, tx, ty); grid(x, TREE, ox, oy, PAL.tree); break;
    case 'pine': grass(x, ox, oy, tx, ty, true); grid(x, PINE, ox, oy, PAL.pine); break;
    case 'rock': grass(x, ox, oy, tx, ty); grid(x, ROCK, ox, oy, PAL.rock); break;
    case 'stump': grass(x, ox, oy, tx, ty); grid(x, STUMP, ox, oy, PAL.stump); break;
    case 'sign': grass(x, ox, oy, tx, ty); grid(x, SIGN, ox, oy, PAL.sign); break;
    case 'well': grass(x, ox, oy, tx, ty); grid(x, WELL, ox, oy, PAL.well); break;
    case 'pillar': grass(x, ox, oy, tx, ty); grid(x, PILLAR, ox, oy, PAL.pillar); break;
    case 'rubble': grass(x, ox, oy, tx, ty);
      for (let k = 0; k < 4; k++) {
        const a = ox + 1 + ((hash(tx, ty, k + 90) * 12) | 0), b = oy + 2 + ((hash(tx, ty, k + 95) * 11) | 0);
        x.fillStyle = C.ink; x.fillRect(a, b + 1, 4, 2); x.fillStyle = C.stone; x.fillRect(a, b, 3, 2); x.fillStyle = C.stoneL; x.fillRect(a, b, 2, 1);
      }
      break;
    case 'runestone': grass(x, ox, oy, tx, ty);
      x.fillStyle = C.grassD; x.fillRect(ox + 3, oy + 14, 10, 2);
      x.fillStyle = C.ink; x.fillRect(ox + 4, oy + 1, 8, 14); x.fillRect(ox + 3, oy + 3, 10, 12);
      x.fillStyle = C.stone; x.fillRect(ox + 5, oy + 2, 6, 12); x.fillRect(ox + 4, oy + 4, 8, 10);
      x.fillStyle = C.stoneL; x.fillRect(ox + 5, oy + 2, 2, 11);
      x.fillStyle = C.cyan; x.fillRect(ox + 7, oy + 4, 3, 1); x.fillRect(ox + 8, oy + 5, 1, 3); x.fillRect(ox + 7, oy + 9, 1, 1); x.fillRect(ox + 9, oy + 9, 1, 1); x.fillRect(ox + 7, oy + 11, 3, 1);
      break;
    case 'log': grass(x, ox, oy, tx, ty);
      x.fillStyle = C.grassD; x.fillRect(ox + 1, oy + 13, 15, 2);
      x.fillStyle = C.ink; x.fillRect(ox, oy + 6, 16, 8);
      x.fillStyle = C.wood; x.fillRect(ox + 1, oy + 7, 15, 6);
      x.fillStyle = C.woodD; x.fillRect(ox + 4, oy + 9, 8, 1); x.fillRect(ox + 7, oy + 11, 7, 1);
      x.fillStyle = C.woodL; x.fillRect(ox + 1, oy + 7, 3, 6); x.fillStyle = C.wood; x.fillRect(ox + 2, oy + 9, 1, 2);
      break;
    case 'stall': grass(x, ox, oy, tx, ty); {
      const L = n(-1, 0) !== 'stall', R = n(1, 0) !== 'stall';
      for (let k = 0; k < 3; k++) {
        const a = ox + 2 + k * 5;
        x.fillStyle = C.ink; x.fillRect(a, oy + 2, 4, 5);
        x.fillStyle = ['#e04a3a', '#f3c646', '#7fc35a'][(tx + k) % 3]; x.fillRect(a, oy + 3, 3, 3);
        x.fillStyle = '#ffffff'; x.fillRect(a, oy + 3, 1, 1);
      }
      x.fillStyle = C.ink; x.fillRect(ox, oy + 6, 16, 10);
      x.fillStyle = C.woodL; x.fillRect(ox + (L ? 1 : 0), oy + 7, 16 - (L ? 1 : 0) - (R ? 1 : 0), 2);
      for (let i = 0; i < 16; i += 4) {
        x.fillStyle = (i / 4) % 2 ? '#ffffff' : C.red;
        x.fillRect(ox + i + (L && i === 0 ? 1 : 0), oy + 9, 4 - (L && i === 0 ? 1 : 0) - (R && i === 12 ? 1 : 0), 6);
      }
      break; }
    case 'roof': {
      x.fillStyle = C.roof; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.roofD;
      for (let r = 3; r < 16; r += 4) { x.fillRect(ox, oy + r, 16, 1); for (let i = (r % 8 === 3 ? 0 : 2); i < 16; i += 4) x.fillRect(ox + i, oy + r - 1, 1, 1); }
      x.fillStyle = C.roofL; for (let r = 0; r < 16; r += 4) x.fillRect(ox, oy + r, 16, 1);
      x.fillStyle = C.ink;
      if (n(0, -1) !== 'roof') { x.fillRect(ox, oy, 16, 2); }
      if (n(-1, 0) !== 'roof') x.fillRect(ox, oy, 1, 16);
      if (n(1, 0) !== 'roof') x.fillRect(ox + 15, oy, 1, 16);
      if (n(0, 1) !== 'roof') { x.fillRect(ox, oy + 14, 16, 2); x.fillStyle = C.roofD; x.fillRect(ox, oy + 12, 16, 2); }
      break;
    }
    case 'hwall': case 'hwin': case 'door': {
      x.fillStyle = C.wall; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.wallD; x.fillRect(ox, oy, 16, 2);
      x.fillStyle = C.stoneD; x.fillRect(ox, oy + 13, 16, 3);
      x.fillStyle = C.woodD;
      if (!['hwall', 'hwin', 'door'].includes(n(-1, 0))) x.fillRect(ox, oy, 2, 13);
      if (!['hwall', 'hwin', 'door'].includes(n(1, 0))) x.fillRect(ox + 14, oy, 2, 13);
      x.fillStyle = C.ink; x.fillRect(ox, oy + 15, 16, 1);
      if (kind === 'hwin') {
        x.fillStyle = C.ink; x.fillRect(ox + 3, oy + 3, 10, 8);
        x.fillStyle = C.waterL; x.fillRect(ox + 4, oy + 4, 8, 6);
        x.fillStyle = C.ink; x.fillRect(ox + 7, oy + 4, 2, 6); x.fillRect(ox + 4, oy + 6, 8, 1);
        x.fillStyle = '#ffffff'; x.fillRect(ox + 4, oy + 4, 2, 1);
      }
      if (kind === 'door') {
        x.fillStyle = C.ink; x.fillRect(ox + 3, oy + 2, 10, 14);
        x.fillStyle = C.wood; x.fillRect(ox + 4, oy + 3, 8, 13);
        x.fillStyle = C.woodD; x.fillRect(ox + 7, oy + 3, 1, 13); x.fillRect(ox + 4, oy + 8, 8, 1);
        x.fillStyle = C.gold; x.fillRect(ox + 10, oy + 9, 1, 2);
      }
      break;
    }
    case 'fence': grass(x, ox, oy, tx, ty);
      if (n(0, -1) === 'fence' || n(0, 1) === 'fence' || n(0, -1) === 'roof') {
        x.fillStyle = C.ink; x.fillRect(ox + 6, oy, 4, 16);
        x.fillStyle = C.woodL; x.fillRect(ox + 7, oy, 2, 16);
        x.fillStyle = C.woodD; x.fillRect(ox + 7, oy + 5, 2, 1); x.fillRect(ox + 7, oy + 12, 2, 1);
      } else {
        x.fillStyle = C.ink; x.fillRect(ox, oy + 5, 16, 3); x.fillRect(ox, oy + 10, 16, 3);
        x.fillStyle = C.woodL; x.fillRect(ox, oy + 6, 16, 1); x.fillRect(ox, oy + 11, 16, 1);
      }
      break;
    case 'ctop':
      x.fillStyle = C.pineD; x.fillRect(ox, oy, 16, 16);
      bricks(x, ox, oy + 6, C.stone, C.stoneD, C.stoneL, ty);
      x.fillStyle = C.pineD; x.fillRect(ox, oy + 6, 16, 4);
      x.fillStyle = C.ink; x.fillRect(ox, oy + 2, 6, 8); x.fillRect(ox + 8, oy + 2, 6, 8);
      x.fillStyle = C.stone; x.fillRect(ox + 1, oy + 3, 4, 7); x.fillRect(ox + 9, oy + 3, 4, 7);
      x.fillStyle = C.stoneL; x.fillRect(ox + 1, oy + 3, 4, 1); x.fillRect(ox + 9, oy + 3, 4, 1);
      x.fillStyle = C.stone; x.fillRect(ox, oy + 10, 16, 6);
      x.fillStyle = C.stoneD; x.fillRect(ox, oy + 13, 16, 1);
      break;
    case 'cwall': bricks(x, ox, oy, C.stone, C.stoneD, C.stoneL, ty); break;
    case 'tower':
      bricks(x, ox, oy, C.stoneD, '#4a4c60', C.stone, ty);
      if (n(0, -1) !== 'tower') {
        x.fillStyle = C.pineD; x.fillRect(ox, oy, 16, 4);
        x.fillStyle = C.ink; x.fillRect(ox, oy + 2, 16, 2);
        x.fillStyle = C.purple; x.fillRect(ox + 7, oy - 0, 2, 2);
      }
      x.fillStyle = C.ink; x.fillRect(ox, oy, 1, 16); x.fillRect(ox + 15, oy, 1, 16);
      break;
    case 'cwin': bricks(x, ox, oy, C.stone, C.stoneD, C.stoneL, ty);
      x.fillStyle = C.ink; x.fillRect(ox + 6, oy + 3, 4, 10); x.fillRect(ox + 7, oy + 2, 2, 1);
      x.fillStyle = '#f3d36a'; x.fillRect(ox + 7, oy + 5, 2, 6);
      break;
    case 'gate': bricks(x, ox, oy, C.stone, C.stoneD, C.stoneL, ty);
      x.fillStyle = C.ink; x.fillRect(ox + 1, oy + 4, 14, 12); x.fillRect(ox + 3, oy + 2, 10, 2); x.fillRect(ox + 5, oy + 1, 6, 1);
      x.fillStyle = '#2a2040'; x.fillRect(ox + 2, oy + 5, 12, 11); x.fillRect(ox + 4, oy + 3, 8, 2);
      x.fillStyle = '#3d3060'; x.fillRect(ox + 2, oy + 12, 12, 4);
      x.fillStyle = C.ink; for (let i = 4; i < 13; i += 3) x.fillRect(ox + i, oy + 3, 1, 4); x.fillRect(ox + 2, oy + 6, 12, 1);
      break;
    // ---- home
    case 'htop': x.fillStyle = '#2a1c2e'; x.fillRect(ox, oy, 16, 16); x.fillStyle = '#3a2840'; x.fillRect(ox, oy + 14, 16, 2); break;
    case 'paper': case 'hwindow': case 'shelf': case 'hearth': {
      x.fillStyle = C.paper; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.paperD; for (let i = 1; i < 16; i += 4) x.fillRect(ox + i, oy, 1, 11);
      x.fillStyle = C.wood; x.fillRect(ox, oy + 11, 16, 5);
      x.fillStyle = C.woodL; x.fillRect(ox, oy + 11, 16, 1);
      x.fillStyle = C.woodD; x.fillRect(ox, oy + 15, 16, 1);
      if (kind === 'hwindow') {
        x.fillStyle = C.ink; x.fillRect(ox + 2, oy + 1, 12, 10);
        x.fillStyle = '#9fd8ff'; x.fillRect(ox + 3, oy + 2, 10, 8);
        x.fillStyle = C.leaf; x.fillRect(ox + 3, oy + 6, 4, 4); x.fillRect(ox + 9, oy + 7, 4, 3);
        x.fillStyle = C.woodL; x.fillRect(ox + 7, oy + 2, 2, 8); x.fillRect(ox + 3, oy + 5, 10, 1);
        x.fillStyle = C.woodD; x.fillRect(ox + 1, oy + 10, 14, 2);
      }
      if (kind === 'shelf') {
        x.fillStyle = C.ink; x.fillRect(ox + 1, oy, 14, 16);
        x.fillStyle = C.woodD; x.fillRect(ox + 2, oy + 1, 12, 14);
        for (const sy of [1, 8]) for (let i = 0; i < 6; i++) {
          const h = 5 + ((hash(tx, i, sy) * 2) | 0);
          x.fillStyle = ['#c04a3e', '#3f6fc4', '#e2b33a', '#4f9a4a', '#8a5ab0', '#d97a3a'][(hash(tx + i, sy, 2) * 6) | 0];
          x.fillRect(ox + 2 + i * 2, oy + sy + 7 - h, 2, h);
        }
        x.fillStyle = C.wood; x.fillRect(ox + 2, oy + 7, 12, 1); x.fillRect(ox + 2, oy + 14, 12, 1);
      }
      if (kind === 'hearth') {
        x.fillStyle = C.ink; x.fillRect(ox, oy + 1, 16, 15);
        x.fillStyle = C.stone; x.fillRect(ox + 1, oy + 2, 14, 14);
        x.fillStyle = C.stoneD; for (let r = 4; r < 16; r += 4) x.fillRect(ox + 1, oy + r, 14, 1);
        x.fillStyle = C.stoneL; x.fillRect(ox + 1, oy + 2, 14, 1);
        x.fillStyle = C.ink; x.fillRect(ox + 4, oy + 7, 8, 9); x.fillRect(ox + 5, oy + 6, 6, 1);
      }
      break;
    }
    case 'floor': planks(x, ox, oy, tx, ty); break;
    case 'rug': planks(x, ox, oy, tx, ty); {
      x.fillStyle = C.redD; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.red; x.fillRect(ox + 1, oy + 1, 14, 14);
      x.fillStyle = C.gold;
      if (n(0, -1) !== 'rug') x.fillRect(ox, oy + 1, 16, 1);
      if (n(0, 1) !== 'rug') x.fillRect(ox, oy + 14, 16, 1);
      if (n(-1, 0) !== 'rug') x.fillRect(ox + 1, oy, 1, 16);
      if (n(1, 0) !== 'rug') x.fillRect(ox + 14, oy, 1, 16);
      x.fillStyle = C.goldD; x.fillRect(ox + 7, oy + 5, 2, 6); x.fillRect(ox + 5, oy + 7, 6, 2);
      if (n(0, -1) !== 'rug') { x.fillStyle = C.floor; x.fillRect(ox, oy, 16, 1); }
      if (n(0, 1) !== 'rug') { x.fillStyle = C.floor; x.fillRect(ox, oy + 15, 16, 1); }
      if (n(-1, 0) !== 'rug') { x.fillStyle = C.floor; x.fillRect(ox, oy, 1, 16); }
      if (n(1, 0) !== 'rug') { x.fillStyle = C.floor; x.fillRect(ox + 15, oy, 1, 16); }
      break; }
    case 'bedT': planks(x, ox, oy, tx, ty); grid(x, BED_TOP, ox, oy, PAL.bed); break;
    case 'bedB': planks(x, ox, oy, tx, ty); grid(x, BED_BOT, ox, oy, PAL.bed); break;
    case 'table': case 'tableL': {
      planks(x, ox, oy, tx, ty);
      const L = !n(-1, 0).startsWith('table'), R = !n(1, 0).startsWith('table');
      x.fillStyle = C.floorK; x.fillRect(ox + (L ? 1 : 0), oy + 14, 16 - (L ? 2 : 0) - (R ? 1 : 0), 2);
      x.fillStyle = C.ink; x.fillRect(ox + (L ? 1 : 0), oy + 3, 16 - (L ? 1 : 0) - (R ? 1 : 0), 10);
      x.fillStyle = C.woodL; x.fillRect(ox + (L ? 2 : 0), oy + 4, 16 - (L ? 2 : 0) - (R ? 2 : 0), 6);
      x.fillStyle = C.wood; x.fillRect(ox + (L ? 2 : 0), oy + 10, 16 - (L ? 2 : 0) - (R ? 2 : 0), 2);
      x.fillStyle = C.ink; if (L) x.fillRect(ox + 2, oy + 12, 2, 3); if (R) x.fillRect(ox + 12, oy + 12, 2, 3);
      if (kind === 'tableL') {
        x.fillStyle = C.ink; x.fillRect(ox + 4, oy + 4, 9, 6);
        x.fillStyle = '#ffffff'; x.fillRect(ox + 5, oy + 5, 7, 4);
        x.fillStyle = '#c9c4d8'; x.fillRect(ox + 5, oy + 5, 1, 1); x.fillRect(ox + 6, oy + 6, 1, 1); x.fillRect(ox + 10, oy + 6, 1, 1); x.fillRect(ox + 11, oy + 5, 1, 1);
        x.fillStyle = '#b0b8d8'; x.fillRect(ox + 7, oy + 7, 3, 2);
      } else {
        x.fillStyle = C.ink; x.fillRect(ox + 5, oy + 3, 6, 5);
        x.fillStyle = '#e8e2d0'; x.fillRect(ox + 6, oy + 4, 4, 3);
      }
      break;
    }
    case 'pot': planks(x, ox, oy, tx, ty); grid(x, POT, ox, oy, PAL.pot); break;
    case 'exit':
      x.fillStyle = '#2a1c2e'; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.floor; x.fillRect(ox + 1, oy, 14, 10);
      x.fillStyle = C.floorK; x.fillRect(ox + 1, oy + 3, 14, 1); x.fillRect(ox + 1, oy + 7, 14, 1);
      x.fillStyle = '#7a8a3a'; x.fillRect(ox + 2, oy + 1, 12, 7);
      x.fillStyle = '#a3b24a'; for (let i = 3; i < 14; i += 2) x.fillRect(ox + i, oy + 2, 1, 5);
      x.fillStyle = '#5ab0e0'; x.fillRect(ox + 1, oy + 10, 14, 6);
      x.fillStyle = C.grass; x.fillRect(ox + 1, oy + 13, 14, 3);
      break;
    // ---- castle interior
    case 'ktop': x.fillStyle = '#1e1b2b'; x.fillRect(ox, oy, 16, 16); x.fillStyle = '#2a2640'; x.fillRect(ox, oy + 14, 16, 2); break;
    case 'kwall': case 'banner': case 'torch':
      bricks(x, ox, oy, C.cstone, C.cstoneD, C.cstoneL, ty);
      x.fillStyle = C.cstoneD; x.fillRect(ox, oy + 14, 16, 2);
      if (kind === 'banner') {
        x.fillStyle = C.ink; x.fillRect(ox + 3, oy, 10, 14); x.fillRect(ox + 5, oy + 14, 6, 1); x.fillRect(ox + 7, oy + 15, 2, 1);
        x.fillStyle = C.purple; x.fillRect(ox + 4, oy, 8, 13); x.fillRect(ox + 6, oy + 13, 4, 1);
        x.fillStyle = C.gold; x.fillRect(ox + 4, oy + 1, 8, 1); x.fillRect(ox + 7, oy + 4, 2, 1); x.fillRect(ox + 6, oy + 5, 4, 2); x.fillRect(ox + 7, oy + 7, 2, 1);
      }
      if (kind === 'torch') {
        x.fillStyle = C.ink; x.fillRect(ox + 6, oy + 7, 4, 6);
        x.fillStyle = C.woodD; x.fillRect(ox + 7, oy + 8, 2, 4);
        x.fillStyle = C.ink; x.fillRect(ox + 5, oy + 6, 6, 2);
      }
      break;
    case 'kfloor': stoneFloor(x, ox, oy, tx, ty); break;
    case 'carpet': {
      x.fillStyle = C.carpet; x.fillRect(ox, oy, 16, 16);
      x.fillStyle = C.carpetD; for (let i = 2; i < 16; i += 6) x.fillRect(ox + 6, oy + i, 4, 2);
      x.fillStyle = C.gold;
      const c = k => k === 'carpet' || k === 'throne';
      if (!c(n(-1, 0))) { x.fillRect(ox, oy, 2, 16); x.fillStyle = C.goldD; x.fillRect(ox + 2, oy, 1, 16); x.fillStyle = C.gold; }
      if (!c(n(1, 0))) { x.fillRect(ox + 14, oy, 2, 16); x.fillStyle = C.goldD; x.fillRect(ox + 13, oy, 1, 16); }
      break;
    }
    case 'throne': x.fillStyle = C.carpet; x.fillRect(ox, oy, 16, 16); grid(x, THRONE, ox, oy, PAL.throne); break;
    case 'kpillar': stoneFloor(x, ox, oy, tx, ty);
      x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(ox + 3, oy + 13, 12, 3);
      x.fillStyle = C.ink; x.fillRect(ox + 2, oy, 12, 16);
      x.fillStyle = C.cstoneL; x.fillRect(ox + 3, oy, 10, 15);
      x.fillStyle = '#9a96b2'; x.fillRect(ox + 4, oy, 2, 15);
      x.fillStyle = C.cstone; x.fillRect(ox + 10, oy, 2, 15); x.fillRect(ox + 3, oy + 12, 10, 3);
      break;
    case 'kexit':
      stoneFloor(x, ox, oy, tx, ty);
      x.fillStyle = '#100c1a'; x.fillRect(ox + 1, oy + 4, 14, 12); x.fillRect(ox + 3, oy + 2, 10, 2);
      break;
    default: x.fillStyle = '#f0f'; x.fillRect(ox, oy, 16, 16);
  }
}

// Little flames for torches/hearth, drawn every frame on top of the map.
export function flame(x, ox, oy, t, big) {
  const f = Math.floor(t * 10) % 3;
  const h = big ? 7 : 5;
  x.fillStyle = '#e8572a'; x.fillRect(ox - (big ? 3 : 2), oy - h + 2, big ? 7 : 5, h - 1);
  x.fillStyle = '#f39a2a'; x.fillRect(ox - 1 - (f === 1 ? 1 : 0), oy - h + 1, 3, h - 1);
  x.fillStyle = '#ffe47a'; x.fillRect(ox - (f === 2 ? 1 : 0), oy - h + 3 + (f === 0 ? 1 : 0), 2, h - 4);
  x.fillStyle = '#ffffff'; x.fillRect(ox, oy - 2, 1, 1);
}
