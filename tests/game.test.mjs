// Run with: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, NPCS, LOOKS, SCRIPT, parseForce, cardName, VALUE_GRID, encodeWord, decodeWord, CLASSES, OUCH, GRUDGE, EGG, squawk, KONAMI, QUEST, FISH, FORTUNE, AWARD, fortuneTarget, jokerReading, cardReading } from '../src/data.js';
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
  const flat = v => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(flat) : Object.values(v).flatMap(flat));
  for (const v of Object.values(QUEST)) all.push(...flat(v));
  for (const v of Object.values(FISH)) all.push(...v);
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

test('fishing quest: worm pile, bard and the fisher\'s lake spot can all be reached', () => {
  const seen = reach(MAPS.world, [15, 40]), row = MAPS.world.rows[9];
  assert.equal(row[2], 'V', 'worm pile in the top-left of the ruins');
  assert.ok(seen.has('2,10') || seen.has('3,9'), 'can stand next to the worms');
  assert.ok(seen.has('20,17') || seen.has('21,18') || seen.has('22,17'), 'next to the bard');
  // a lake tile you can face from within 4 steps of the fisher
  const lakeFacing = [...seen].some(k => {
    const [x, y] = k.split(',').map(Number);
    if (Math.abs(x - 22) + Math.abs(y - 26) > 4) return false;
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => x + dx >= 23 && MAPS.world.rows[y + dy][x + dx] === '~');
  });
  assert.ok(lakeFacing, 'lake spot by the fisher');
});

// ---------------------------------------------------------------- the fortune teller
// Every way to do the trick: deal to either joker first, either pile on top, any cut.
test('fortune: the jokers always point at the peeked card', () => {
  let tried = 0;
  for (const start of [0, 1]) for (const onTop of [0, 1]) {
    const piles = [['J'], ['J']]; // face-up jokers, then cards dealt on top
    for (let i = 0; i < 5; i++) piles[(start + i) % 2].push(i); // card 0 is the peeked card
    const [a, b] = piles.map(pl => pl.slice().reverse()); // top card first
    const stack = onTop ? [...a, ...b] : [...b, ...a];
    for (let cut = 0; cut < 7; cut++) {
      // spread between the hands: the top card ends up on the right
      const row = [...stack.slice(cut), ...stack.slice(0, cut)].reverse();
      const [p, q] = row.map((c, i) => (c === 'J' ? i : -1)).filter(i => i >= 0);
      assert.equal(row[fortuneTarget(p, q)], 0, `start ${start} top ${onTop} cut ${cut}`);
      assert.equal(row[fortuneTarget(q, p)], 0, 'order of the two jokers does not matter');
      tried++;
    }
  }
  assert.equal(tried, 28);
});

test('fortune: any other joker spacing is a bad deal', () => {
  for (let p = 0; p < 7; p++) for (let q = p + 1; q < 7; q++) {
    const between = q - p - 1, t = fortuneTarget(p, q);
    if (between === 2 || between === 3) assert.ok(t >= 0 && t < 7 && t !== p && t !== q);
    else assert.equal(t, -1, `${p},${q}`);
  }
});

test('fortune: every line can be drawn and fits the box', () => {
  const all = [];
  for (const [k, v] of Object.entries(FORTUNE)) if (k !== 'ui') all.push(...[].concat(v));
  for (let p = 0; p < 7; p++) for (let q = p + 1; q < 7; q++) if (fortuneTarget(p, q) >= 0)
    for (const r of [() => 0, () => 0.99]) all.push(...jokerReading(p, q, r));
  const suits = ['C', 'H', 'S', 'D'];
  for (let i = 0; i < 400; i++) {
    const cards = [0, 1, 2].map(j => ({ v: 1 + ((i * 7 + j * 5) % 13), s: suits[(i + j * (i % 3 + 1)) % 4] }));
    all.push(...cardReading(cards));
  }
  for (const s of all) {
    assert.equal(typeof s, 'string');
    for (const ch of s.replace(/\{N\}/g, 'ABCDEFGH')) assert.ok(GLYPH_SET.has(ch), `missing glyph "${ch}" in: ${s}`);
    for (const line of wrap(s.replace(/\{N\}/g, 'ABCDEFGH'), 23)) assert.ok(line.length <= 23, `too long: ${line}`);
  }
  // the table headings share a line with the undo chip or the pick
  for (const v of Object.values(FORTUNE.ui).flat()) assert.ok(v.length <= 18, `heading too long: ${v}`);
});

test('fortune teller stands by the house and the path stays open', () => {
  const seer = NPCS.find(n => n.id === 'seer');
  assert.ok(seer && seer.fortuneOnly);
  assert.ok(Math.abs(seer.x - 15) + Math.abs(seer.y - 40) <= 3, 'near the front door');
  const seen = reach(MAPS.world, [15, 40], [`${seer.x},${seer.y}`]);
  assert.ok(seen.has('16,4'), 'castle gate still reachable');
});

test('award banner text fits', () => {
  for (const v of Object.values(AWARD)) {
    assert.equal(v.length, 3);
    for (const l of v) { assert.ok(l.length <= 18, l); for (const ch of l) assert.ok(GLYPH_SET.has(ch), l); }
    assert.ok(('AWARD - ' + v.slice(1).join(' ')).length <= 36);
    for (const ch of v.slice(1).join(' ')) assert.ok(GLYPH5_SET.has(ch), `tiny font: ${ch}`);
  }
});
