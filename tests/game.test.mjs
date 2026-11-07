// Run with: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, NPCS, LOOKS, SCRIPT, parseForce, cardName, VALUE_GRID, encodeWord, decodeWord, CLASSES, OUCH, GRUDGE, EGG, squawk, KONAMI, QUEST, FISH, FORTUNE, AWARD, fortuneTarget, fortunePicks, jokerReading, cardReading, TOME, TOME_WORDS, FAV, BOOK, bookNext, bookWord, bookLine, letterQuestion, withArticle } from '../src/data.js';
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
    // the fortune teller (/!card) and the apprentice (/!book) never appear in the same game
    const mode = n.fortuneOnly ? 'card:' : n.bookOnly ? 'book:' : '';
    const k = `${mode}${n.map}:${n.x},${n.y}`;
    assert.ok(!used.has(k), `${n.id} shares a tile`); used.add(k);
  }
});

test('all text can be drawn by the pixel font and fits the box', () => {
  const all = [];
  for (const m of Object.values(MAPS)) for (const v of Object.values(m.looks)) all.push(...v);
  for (const n of NPCS) all.push(...(n.talk || []), ...(n.again || []), ...(n.cycle || []));
  for (const v of Object.values(SCRIPT)) all.push(...[].concat(v));
  for (const c of CLASSES) all.push(c.name, c.weapon);
  all.push(...GRUDGE, ...EGG.hello, ...EGG.got, ...EGG.restored);
  for (const w of Object.values(EGG.woke)) all.push(...w.talk, ...w.again);
  const flat = v => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(flat) : Object.values(v).flatMap(flat));
  for (const v of Object.values(QUEST)) all.push(...flat(v));
  for (const v of Object.values(FISH)) all.push(...v);
  for (const n of NPCS) for (const l of [...(n.talk || []), ...(n.cycle || [])]) all.push(squawk(l));
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

test('fortune: past, present and future are spread out and include their card', () => {
  for (let p = 0; p < 7; p++) for (let q = p + 1; q < 7; q++) {
    const t = fortuneTarget(p, q);
    if (t < 0) continue;
    const cards = [0, 1, 2, 3, 4, 5, 6].filter(i => i !== p && i !== q), base = [cards[0], cards[2], cards[4]];
    for (const r of [0, 0.99]) {
      const picks = fortunePicks(p, q, () => r);
      assert.ok(picks.includes(t), `their card at ${t} for jokers ${p},${q}`);
      assert.deepEqual(picks, picks.slice().sort((a, b) => a - b), 'left to right');
      assert.equal(new Set(picks).size, 3);
      // leftmost, middle and rightmost, with their card in place of the nearest one
      const swapped = base.filter(i => !picks.includes(i));
      if (base.includes(t)) assert.deepEqual(picks, base);
      else {
        assert.equal(swapped.length, 1);
        const dist = Math.abs(swapped[0] - t);
        assert.ok(base.every(i => Math.abs(i - t) >= dist), 'nearest one replaced');
      }
    }
  }
});

test('fortune: one line for the jokers, two for the cards', () => {
  for (let p = 0; p < 7; p++) for (let q = p + 1; q < 7; q++) if (fortuneTarget(p, q) >= 0)
    for (const r of [0, 0.5, 0.99]) assert.equal(jokerReading(p, q, () => r).length, 1);
  assert.ok(cardReading([{ v: 2, s: 'H' }, { v: 9, s: 'C' }, { v: 5, s: 'S' }]).length <= 2);
  // the joker line fits on one page of the text box
  for (let p = 0; p < 7; p++) for (let q = p + 1; q < 7; q++) if (fortuneTarget(p, q) >= 0)
    for (const r of [0, 0.5, 0.99]) assert.ok(wrap(jokerReading(p, q, () => r)[0], 23).length <= 3);
});

// ---------------------------------------------------------------- the apprentice's book
const ALL_TOME = [...new Set(TOME_WORDS.flat())];
// Ask questions the way the game does, answering honestly for `word`.
function play(page, word, answer = (L, i) => word.includes(L)) {
  const answers = [];
  for (let L, i = 0; (L = bookNext(page, answers)); i++) answers.push([L, answer(L, i)]);
  return answers;
}

test('book: every short word is filler, every word worth picking has five letters or more', () => {
  const FILLER = new Set('A AN THE AND OF IN ON TO BY FOR BUT NOT NO SO AS AT IT ITS HE HAD THEM ONCE ONLY THEN ALL I II III'.split(' '));
  for (const p of TOME) for (const w of `${p.title} ${p.text}`.match(/[A-Z]+/g)) {
    if (w.length < 5) assert.ok(FILLER.has(w), `"${w}" is short but might get picked`);
  }
  assert.ok(ALL_TOME.length <= 30, 'small enough to be told apart (and to fit the bit masks)');
  assert.ok(!ALL_TOME.includes('WIND') && ALL_TOME.includes('WINDS'));
});

test('book: the page fits the book screen and every word can be drawn', () => {
  for (const p of TOME) {
    assert.ok(p.title.length <= 23, `title too long: ${p.title}`);
    assert.ok(wrap(p.text, 23).length <= 8, `page too long: ${p.title}`);
    for (const ch of p.title + p.text) assert.ok(GLYPH_SET.has(ch), `missing glyph "${ch}"`);
  }
  for (const [L, ws] of Object.entries(FAV)) {
    assert.equal(ws.length, 2);
    for (const w of ws) { assert.ok(w.includes(L), `${w} has no ${L}`); assert.ok(!ALL_TOME.includes(w), `${w} is in the book`); }
  }
});

test('book: closed on the right page, four questions name the word (a fifth at most)', () => {
  let four = 0, n = 0;
  TOME_WORDS.forEach((ws, page) => {
    for (const w of ws) {
      const a = play(page, w);
      assert.equal(bookWord(page, a), w, `page ${page + 1}: ${w}`);
      assert.ok(a.length <= 5, `${w}: ${a.length} questions`);
      assert.ok(a.length >= 3, `${w}: the apprentice, the guard and the hermit each ask one`);
      n++; if (a.length <= 4) four++;
    }
  });
  assert.ok(four >= n - 4, `${four} of ${n} in four questions`);
});

test('book: closed on the wrong page, the questions still find the word', () => {
  TOME_WORDS.forEach((ws, page) => {
    for (const w of ALL_TOME.filter(x => !ws.includes(x))) {
      const a = play(page, w);
      assert.equal(bookWord(page, a), w, `closed on page ${page + 1}, word ${w}`);
      assert.ok(a.length <= 7, `${w}: ${a.length} questions`);
    }
  });
});

test('book: a wrong answer still ends on a word, and no question is asked once it is known', () => {
  for (const w of TOME_WORDS[1]) {
    const a = play(1, w, (L, i) => (i === 2 ? !w.includes(L) : w.includes(L)));
    assert.ok(ALL_TOME.includes(bookWord(1, a)));
    assert.equal(bookNext(1, play(1, w)), null);
  }
  assert.ok(ALL_TOME.includes(bookWord(0, [['Z', true], ['Q', true]])), 'nonsense answers still give a word');
});

test('book: questions only use letters the hermit has words for', () => {
  for (let page = 0; page < 3; page++) for (const w of ALL_TOME) for (const [L] of play(page, w)) assert.ok(FAV[L], L);
  assert.equal(withArticle('R'), 'AN R'); assert.equal(withArticle('D'), 'A D'); assert.equal(withArticle('U'), 'A U');
});

test('book: every line can be drawn and fits the box', () => {
  const flat = v => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(flat) : Object.values(v).flatMap(flat));
  const all = [];
  for (const L of Object.keys(FAV)) {
    all.push(letterQuestion(L));
    for (const s of flat(BOOK)) all.push(bookLine(s, L));
    assert.ok(wrap(BOOK.askClosed, 23).length <= 3, 'the YES/NO question fits one box');
    assert.ok(wrap(letterQuestion(L), 23).length <= 3, 'the question fits one box');
  }
  for (const s of all) {
    const t = s.replace(/\{N\}/g, 'ABCDEFGH');
    assert.ok(!/[{}]/.test(t), `unfilled: ${s}`);
    for (const ch of t) assert.ok(GLYPH_SET.has(ch), `missing glyph "${ch}" in: ${s}`);
    for (const line of wrap(t, 23)) assert.ok(line.length <= 23, `too long: ${line}`);
  }
});

test('book: the book and its arrow fit on the narrowest screen', () => {
  const w = 160 - 24, chars = Math.floor((w - 14) / 6); // as Tome.geom() works it out
  for (const p of TOME) {
    assert.ok(p.title.length * 6 - 1 <= w - 4, `title too wide: ${p.title}`);
    assert.ok(wrap(p.text, chars).length <= 9, `page too long at ${chars} letters a line: ${p.title}`);
  }
  assert.ok(4 + w + 4 + 2 + 7 + 2 <= 160 - 4, 'cover, book, arrow and its bob, with room to spare');
});

test('apprentice stands by the house in book mode only', () => {
  const a = NPCS.find(n => n.id === 'apprentice');
  assert.ok(a && a.bookOnly && !a.fortuneOnly);
  assert.ok(Math.abs(a.x - 15) + Math.abs(a.y - 40) <= 3, 'near the front door');
  assert.ok(reach(MAPS.world, [15, 40], [`${a.x},${a.y}`]).has('16,4'), 'path stays open');
});
