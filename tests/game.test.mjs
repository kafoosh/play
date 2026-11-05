// Run with: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, NPCS, LOOKS, SCRIPT, parseForce, cardName, VALUE_GRID, encodeWord, decodeWord, CLASSES, OUCH, GRUDGE, EGG, squawk, KONAMI, QUEST } from '../src/data.js';
import { GLYPH_SET, GLYPH5_SET, wrap } from '../src/art.js';
import { SONGS } from '../src/audio.js';

const solid = (map, x, y) => {
  const r = map.rows[y];
  if (!r || x < 0 || x >= r.length) return true;
  return !!map.legend[r[x]][1];
};
function reach(map, from, blocked = []) {
  const seen = new Set([from.join()]), q = [from];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = [x + dx, y + dy].join();
      if (seen.has(k) || solid(map, x + dx, y + dy) || blocked.includes(k)) continue;
      seen.add(k); q.push([x + dx, y + dy]);
    }
  }
  return seen;
}

test('maps are rectangular and every tile is in the legend', () => {
  for (const [name, m] of Object.entries(MAPS)) {
    const w = m.rows[0].length;
    m.rows.forEach((r, y) => {
      assert.equal(r.length, w, `${name} row ${y} width`);
      for (const ch of r) assert.ok(m.legend[ch], `${name} unknown tile "${ch}"`);
    });
  }
});

test('warps land on walkable tiles', () => {
  for (const m of Object.values(MAPS)) for (const w of Object.values(m.warps)) {
    assert.ok(!solid(MAPS[w.map], w.x, w.y), `warp target ${w.map} ${w.x},${w.y}`);
  }
});

test('house exit can reach the castle gate (guard moved aside)', () => {
  const seen = reach(MAPS.world, [15, 40]);
  assert.ok(seen.has('16,4'), 'gate reachable');
  assert.ok(seen.has('17,21'), 'guard has room to step aside');
});

test('in the castle the player can reach the wizard', () => {
  assert.ok(reach(MAPS.castle, [4, 8]).has('4,4'));
});

test('npcs stand on walkable tiles, one per tile', () => {
  const used = new Set();
  for (const n of NPCS) {
    assert.ok(LOOKS[n.look], `${n.id} look`);
    assert.ok(!solid(MAPS[n.map], n.x, n.y), `${n.id} on solid tile`);
    const k = `${n.map}:${n.x},${n.y}`;
    assert.ok(!used.has(k), `${n.id} shares a tile`); used.add(k);
  }
});

test('all text can be drawn by the pixel font and fits the box', () => {
  const all = [];
  for (const m of Object.values(MAPS)) for (const v of Object.values(m.looks)) all.push(...v);
  for (const n of NPCS) all.push(...(n.talk || []), ...(n.again || []));
  for (const v of Object.values(SCRIPT)) all.push(...[].concat(v));
  for (const c of CLASSES) all.push(c.name, c.weapon);
  all.push(...GRUDGE, ...EGG.hello, ...EGG.got, ...EGG.restored);
  for (const w of Object.values(EGG.woke)) all.push(...w.talk, ...w.again);
  for (const v of Object.values(QUEST)) all.push(...(typeof v === 'string' ? [v] : Array.isArray(v) ? v : Object.values(v).flat()));
  for (const n of NPCS) for (const l of n.talk || []) all.push(squawk(l));
  for (const s of all) {
    const t = s.replace(/\{N\}/g, 'ABCDEFGH');
    for (const ch of t.replace(/\n/g, '')) assert.ok(GLYPH_SET.has(ch), `missing glyph "${ch}" in: ${s}`);
    for (const line of wrap(t, 23)) assert.ok(line.length <= 23, `too long: ${line}`);
  }
});

test('every song channel loops on the same length', () => {
  for (const [name, s] of Object.entries(SONGS)) for (const c of s.ch) assert.equal(c.len, s.len, name);
});

test('URL force parsing', () => {
  assert.deepEqual(parseForce('7D'), { v: 7, s: 'D' });
  assert.deepEqual(parseForce('10h99x'), { v: 10, s: 'H' });
  assert.deepEqual(parseForce('12s'), { v: 12, s: 'S' });
  assert.deepEqual(parseForce('13H'), { v: 13, s: 'H' });
  assert.deepEqual(parseForce('11c'), { v: 11, s: 'C' });
  assert.deepEqual(parseForce('1C'), { v: 1, s: 'C' });
  assert.equal(parseForce('14D'), null);
  assert.equal(parseForce('QS'), null); // letters are words now, never cards
  assert.equal(parseForce('AC'), null);
  assert.equal(cardName(13, 'C'), 'KING OF CLUBS');
});

test('value grid covers A to Q once (K is the band)', () => {
  assert.deepEqual(VALUE_GRID.flat(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test('word cipher is QWERTY + 1 with wrap-around', () => {
  assert.equal(encodeWord('hello'), 'jraap');
  assert.equal(decodeWord('jraap'), 'HELLO');
  assert.equal(decodeWord('JRAAP'), 'HELLO');
  assert.equal(encodeWord('quiz'), 'wiox');       // z -> x, p would wrap to q
  assert.equal(decodeWord('qsdys+aszq'), 'PASTA LAMP');
  assert.equal(decodeWord('jraap%20jraap'), 'HELLO HELLO');
  assert.equal(decodeWord('jraap-jraap'), 'HELLO HELLO');
  for (const w of ['PALM', 'ZEBRA', 'MAGIC', 'QUILL', 'LAKE']) assert.equal(decodeWord(encodeWord(w)), w);
});

test('classes mix close and far weapons', () => {
  const r = CLASSES.map(c => c.range);
  assert.ok(r.includes('CLOSE') && r.includes('FAR'));
  for (const c of CLASSES) assert.ok(['knight', 'ranger', 'mage', 'bard'].includes(c.id));
});

test('shouts fit the tiny font and stay short', () => {
  for (const v of Object.values(OUCH)) for (const line of v) {
    for (const ch of line) assert.ok(GLYPH5_SET.has(ch), `tiny font missing "${ch}" in ${line}`);
    assert.ok(line.length <= 18, `too long: ${line}`);
  }
});

test('chicken speech keeps punctuation and only squawks', () => {
  const out = squawk("HALT! WHO GOES THERE? IT'S {N}.");
  assert.match(out, /^[A-Z-]+! [A-Z-]+ [A-Z-]+ [A-Z-]+\? [A-Z-]+ [A-Z-]+\.$/);
  for (const w of out.split(/[ !?.]+/).filter(Boolean)) assert.ok(['BAWK', 'BUK', 'BUK-BUK', 'BAGAWK', 'CLUCK', 'BRAAWK'].includes(w), w);
  assert.deepEqual(KONAMI, ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'B', 'A']);
});

test('witches house: door outside, way back out, the frog can be reached', () => {
  const seen = reach(MAPS.world, [15, 40]);
  assert.ok(seen.has('6,29'), 'tile below the blue door');
  assert.ok(seen.has('25,28') || seen.has('24,28'), 'frog area');
  assert.ok(reach(MAPS.witches, [4, 6]).has('4,7'), 'exit reachable inside');
  assert.ok(seen.has('13,14'), 'hermit spot');
});
