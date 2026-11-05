// Maps, people and words. {N} is replaced by the player's name.

// ---------------------------------------------------------------- legends
// solid: blocks walking. Every other tile is walkable.
const WORLD_LEGEND = {
  T: ['tree', 1], Y: ['pine', 1], '.': ['grass'], ',': ['grass2'], '"': ['tall'], f: ['flowers'],
  '=': ['path'], '~': ['water', 1], '#': ['bridge'], R: ['rock', 1], S: ['sign', 1], u: ['stump', 1],
  P: ['pillar', 1], x: ['rubble'], O: ['runestone', 1], L: ['log', 1], W: ['well', 1], m: ['stall', 1],
  '^': ['roof', 1], B: ['roofB', 1], N: ['roofN', 1], H: ['hwall', 1], w: ['hwin', 1], d: ['door', 1], D: ['door'], F: ['fence', 1],
  K: ['ctop', 1], C: ['cwall', 1], Q: ['tower', 1], v: ['cwin', 1], G: ['gate'],
};
const HOME_LEGEND = {
  '#': ['htop', 1], W: ['paper', 1], n: ['hwindow', 1], k: ['shelf', 1], h: ['hearth', 1], _: ['floor'],
  B: ['bedT', 1], b: ['bedB', 1], T: ['table', 1], L: ['tableL', 1], p: ['pot', 1], r: ['rug'], E: ['exit'],
};
const CASTLE_LEGEND = {
  '#': ['ktop', 1], W: ['kwall', 1], B: ['banner', 1], t: ['torch', 1], Z: ['throne', 1], _: ['kfloor'],
  '=': ['carpet'], P: ['kpillar', 1], E: ['kexit'],
};

// ---------------------------------------------------------------- maps
export const MAPS = {
  home: {
    legend: HOME_LEGEND,
    music: 'field',
    rows: [
      '##########',
      '#WnWkkWhW#',
      '#B_______#',
      '#b_______#',
      '#__TL____#',
      '#__rrr__p#',
      '#__rrr___#',
      '####E#####',
    ],
    warps: { '4,7': { map: 'world', x: 15, y: 40, dir: 'down' } },
    looks: {
      bedT: ['YOUR BED. STILL WARM.'],
      bedB: ['YOUR BED. STILL WARM.'],
      shelf: ['A BOOK CALLED "WINDS OF WONDER".', 'EVERY PAGE AFTER THE STILL NIGHT IS BLANK.'],
      hwindow: ['THE TREES OUTSIDE ARE STILL. NOT A BREATH OF WIND.'],
      hearth: ['THE FIRE CRACKLES. THE SMOKE GOES STRAIGHT UP.'],
      pot: ['AN EMPTY POT. YOU LOOK INSIDE ANYWAY.', 'NOTHING.'],
      table: ['A CUP OF TEA. IT HAS GONE COLD.'],
      tableL: ['A LETTER WITH A SILVER SEAL. IT READS:', '"{N}. COME TO THE CASTLE IN THE NORTH.', 'I HAVE SOMETHING TO SHOW YOU. -THE WIZARD"'],
      paper: [],
    },
  },
  world: {
    legend: WORLD_LEGEND,
    music: 'field',
    rows: [
      'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
      'YYYYYYYYYYYQKKKKKKKKKQYYYYYYYYYYYY',
      'YYYYYYYYYYYQCCvCCCvCCQYYYYYYYYYYYY',
      'YYYYYYYYYYYQCCCCCCCCCQYYYYYYYYYYYY',
      'YYYYYYYYYYYQCvCCGCCvCQYYYYYYYYYYYY',
      'YYYYYYYYYY.f...,=,...f.YYYYYYYYYYY',
      'YYYYYYYYYYY..R..=....YYYYYYYYYYYYY',
      'YYYYYYYYYYYYY...=...YYYYYYYYYYYYYY',
      'YYYYYYYYYYYYYY..=..YYYYYYYYYYYYYYY',
      'YY...,..YYY.=====YYYYY....YYYYYYYY',
      'Y..P...P..Y.=.YYYYYYY.u.....YYYYYY',
      'Y..x.O.x..Y.=SYYYYYYY.....u.YYYYYY',
      'Y.P...x.=====.YYYYYYY...,...YYYYYY',
      'Y...Px..u.Y.=======.........YYYYYY',
      'YY.....YYYYYY.....=YY..u..u.YYYYYY',
      'YYYYYYYYYYYYYYYYY.=.Y.......YYYYYY',
      'YYYYYYYYYYYYYYYYY.=.YYYYYYYYYYYYYY',
      'YYYYYYYYYYYYYYY...=.L...YYYYYYYYYY',
      'YYYYYYYYYYYYYY..,.=....,YYYYYYYYYY',
      '~~~~~~~~~~~~~~~~~~#~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~#~~~~~~~~~~~~~~~',
      'TTTTT.T...........=.......~~~~~~~~',
      'TTTTT...T."".T..f.=..T..~~~~~~~~~~',
      'TTTTTf.........R..=...f.~~~~~~~~~~',
      'TTTTT,....f.......=....~~~~~~~~~~~',
      'TTT..............S=====~~~~~~~~~~~',
      'TT..BBBBB..NNNN...=..,.~~~~~~~~~~~',
      'TT..BBBBB..NNNN...=...."~~~~~~~~~~',
      'TT..HwdwH..HdwH...=.f.....~~~~~~~~',
      'TT....=.....=.....=..f..f...~~~~~T',
      'TT.f..=======.....=..."..TTTTTTTTT',
      'TT.f.....==========......TTTTTTTTT',
      'TT.......W........=...R...TTTTTTTT',
      'TT.,..........ff..=.....T.TTTTTTTT',
      'TT..mmm......f.f..="".....TTTTTTTT',
      'TT........,...f...=..".T..TTTTTTTT',
      'TT.f..""..........=...TTTTTTTTTTTT',
      'TT.........f.^^^^.=...TTTTTTTTTTTT',
      'TTTTTT.f....F^^^^F=.f.TTTTTTTTTTTT',
      'TTTTTT......FHwDHF=...TTTTTTTTTTTT',
      'TTTTTT.....RF..=..=.,.TTTTTTTTTTTT',
      'TTTTTT.......======...TTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    warps: {
      '15,39': { map: 'home', x: 4, y: 6, dir: 'up' },
      '16,4': { map: 'castle', x: 4, y: 8, dir: 'up' },
    },
    looks: {
      '17,25': ['NORTH: CASTLE\nEAST: LAKE\nWEST: VILLAGE'],
      '13,11': ['WEST: THE TOWER OF WINDS\nNORTH: CASTLE'],
      '6,28': ['LOCKED. NOBODY IS HOME.'],
      '12,28': ['YOU KNOCK. NO ANSWER.', 'A NOTE ON THE DOOR SAYS "GONE TO SEE THE WIZARD."'],
      runestone: ['OLD WORDS ARE CUT INTO THE STONE:', '"THE WIND DID NOT DIE. IT WENT TO LIVE WITH THE ONE WHO LISTENS."'],
      pillar: ['A BROKEN PILLAR. ALL THAT IS LEFT OF THE TOWER OF WINDS.'],
      well: ['A DEEP WELL. YOU SHOUT DOWN IT.', 'NOTHING SHOUTS BACK.'],
      stump: ['A STUMP. SOMEONE TRIED TO COUNT THE RINGS AND GAVE UP.'],
      log: ['A MOSSY LOG. GOOD FOR SITTING.'],
      hwin: ['YOU PEEK IN THE WINDOW. NOBODY IS HOME.'],
      water: [],
    },
  },
  castle: {
    legend: CASTLE_LEGEND,
    music: 'castle',
    rows: [
      '#########',
      '#WBtWtBW#',
      '#__=Z=__#',
      '#P_===_P#',
      '#__===__#',
      '#P_===_P#',
      '#__===__#',
      '#P_===_P#',
      '#__===__#',
      '####E####',
    ],
    warps: { '4,9': { map: 'world', x: 16, y: 5, dir: 'down' } },
    looks: {
      banner: ['A PURPLE BANNER. IT HANGS DEAD STILL.'],
      throne: ['THE WIZARD\'S CHAIR.'],
      torch: ['THE FLAME DOES NOT FLICKER. NOT EVEN A LITTLE.'],
    },
  },
};

// ---------------------------------------------------------------- people
const P = (o) => ({ kind: 'person', skin: '#f5d0a9', boots: '#4a2d1a', acc: 'none', ...o });
export const LOOKS = {
  oldman: P({ hair: '#e8e4da', tunic: '#7d7a8c', beard: true, skin: '#e8b98a' }),
  lady: P({ hair: '#c2452d', tunic: '#e07aa0', long: true }),
  kid: P({ hair: '#3a2a1e', tunic: '#e8903a', kid: true, skin: '#b97a50' }),
  merchant: P({ hair: '#3a2a1e', tunic: '#4f9a4a', acc: 'cap', cap: '#2f6f8a', skin: '#e0ac7e' }),
  fisher: P({ hair: '#7a4a22', tunic: '#3f6fc4', acc: 'cap', cap: '#d9b45a', beard: true, beardColor: '#7a4a22', skin: '#e8b98a' }),
  guard: P({ hair: '#3a2a1e', tunic: '#3f55c6', acc: 'helmet', skin: '#e0ac7e' }),
  gate: P({ hair: '#3a2a1e', tunic: '#8f2330', acc: 'helmet', skin: '#8a5534' }),
  woodcutter: P({ hair: '#c2452d', tunic: '#b03a2e', beard: true, beardColor: '#c2452d' }),
  bard: P({ hair: '#d9a441', tunic: '#7a4ab0', acc: 'cap', cap: '#3a9a5a' }),
  sleeper: P({ hair: '#5a3a22', tunic: '#a5683a', sleep: true, skin: '#e0ac7e' }),
  cat: { kind: 'cat' }, chicken: { kind: 'chicken' }, frog: { kind: 'frog' }, wizard: { kind: 'wizard' },
};
for (const k in LOOKS) LOOKS[k].key = k;

// talk: first chat. again: later chats (falls back to talk).
export const NPCS = [
  { id: 'cat', name: 'CAT', map: 'home', x: 6, y: 3, look: 'cat', wander: 2, slow: true,
    talk: ['MEW.'], again: ['THE CAT STARES AT THE DOOR.', 'MEW.'] },

  { id: 'guard', name: 'GUARD', map: 'world', x: 18, y: 21, look: 'guard', dir: 'down', bump: true, spear: true,
    talk: ['HALT! WHO GOES THERE?', '...{N}? OH. THE WIZARD SAID YOU WOULD COME.', 'GO ON THEN. THE CASTLE IS NORTH, PAST THE WOODS.'],
    again: ['THE CASTLE IS NORTH. STICK TO THE PATH.'] },
  { id: 'fisher', name: 'FISHER', map: 'world', x: 22, y: 26, look: 'fisher', dir: 'right',
    talk: ['NOTHING HAS BITTEN SINCE THE STILL NIGHT.', 'NO WIND, NO WAVES. THE LAKE IS FLAT AS GLASS.'],
    again: ['STILL NOTHING.'] },
  { id: 'frog', name: 'FROG', map: 'world', x: 25, y: 28, look: 'frog', wander: 1, slow: true, talk: ['RIBBIT.'] },
  { id: 'oldman', name: 'OLD TOM', map: 'world', x: 10, y: 32, look: 'oldman', dir: 'left',
    talk: ['WHEN I WAS A BOY THE WIND NEVER STOPPED. IT SANG IN THE TREES ALL DAY.', 'THEN CAME THE STILL NIGHT. IT STOPPED. JUST LIKE THAT.', 'TEN YEARS NOW. I STILL MISS THE NOISE.'],
    again: ['SOME SAY THE WIZARD KNOWS WHERE THE WIND WENT.'] },
  { id: 'merchant', name: 'MERCHANT', map: 'world', x: 5, y: 33, look: 'merchant', dir: 'down',
    talk: ['WELCOME! ...SORRY. SOLD OUT.', 'EVERYONE WANTED A CHARM TO KEEP THE WIZARD OUT OF THEIR HEAD.', 'DOES NOT WORK. TRUST ME. HIS CASTLE IS PAST THE BRIDGE.'],
    again: ['COME BACK NEXT WEEK. MAYBE.'] },
  { id: 'lady', name: 'ROSE', map: 'world', x: 14, y: 34, look: 'lady', wander: 1,
    talk: ['THE WIZARD? HE LIVES IN THE CASTLE UP NORTH.', 'HE KNEW MY CAT\'S NAME. I NEVER TOLD HIM.', 'NOBODY KNOWS IT. NOT EVEN THE CAT.'],
    again: ['GO NORTH OVER THE BRIDGE. YOU CAN\'T MISS IT.'] },
  { id: 'kid', name: 'PIP', map: 'world', x: 8, y: 36, look: 'kid', wander: 3,
    talk: ['MY GRAN SAYS THE WIND CAN HEAR WHAT YOU THINK.', 'SO I TRY NOT TO THINK ABOUT CAKE.'],
    again: ['...I AM THINKING ABOUT CAKE.'] },
  { id: 'hen1', name: 'HEN', map: 'world', x: 3, y: 29, look: 'chicken', wander: 2, talk: ['BAWK!'] },
  { id: 'hen2', name: 'HEN', map: 'world', x: 16, y: 36, look: 'chicken', wander: 2, talk: ['BAWK BAWK.'] },
  { id: 'woodcutter', name: 'WOODCUTTER', map: 'world', x: 24, y: 11, look: 'woodcutter', dir: 'down',
    talk: ['SEE HOW THESE TREES ALL LEAN NORTH? TOWARD THE CASTLE.', 'LIKE THEY ARE LISTENING FOR SOMETHING.'],
    again: ['I DON\'T CUT THE ONES THAT LEAN. FEELS RUDE.'] },
  { id: 'bard', name: 'BARD', map: 'world', x: 21, y: 17, look: 'bard', dir: 'left', notes: true,
    talk: ['I WROTE A SONG ABOUT THE WIZARD.', 'HE HUMMED IT BACK TO ME. BEFORE I EVER PLAYED IT.'],
    again: ['LA LA LAAA... NO. THAT\'S NOT IT.'] },
  { id: 'sleeper', name: '???', map: 'world', x: 15, y: 17, look: 'sleeper', sleep: true,
    talk: ['ZZZ...'], again: ['ZZZ... FIVE MORE MINUTES... ZZZ...'] },
  { id: 'gate', name: 'GATE GUARD', map: 'world', x: 17, y: 5, look: 'gate', dir: 'down', spear: true,
    talk: ['THE WIZARD IS WAITING FOR YOU, {N}.', 'A WORD OF ADVICE. DON\'T THINK TOO LOUD IN THERE.'],
    again: ['GO ON IN.'] },

  { id: 'wizard', name: 'WIZARD', map: 'castle', x: 4, y: 3, look: 'wizard', dir: 'down', tall: true },
];

// ---------------------------------------------------------------- story beats
export const SCRIPT = {
  wake: ['YOU WAKE UP. THE WIND IS QUIET TODAY.', 'SOMEONE LEFT A LETTER ON THE TABLE.', 'USE THE PAD TO WALK. PRESS A TO TALK OR LOOK.'],
  comeCloser: ['COME CLOSER, {N}.'],
  wizard1: [
    'AH. {N}. YOU CAME.',
    'I AM THE WIZARD. BUT YOU KNEW THAT.',
    'TEN YEARS AGO THE WIND STOPPED. THE STILL NIGHT, THEY CALL IT.',
    'THEY THINK THE WIND IS GONE. IT IS NOT. IT CAME HERE. TO ME.',
    'IT GOES WHERE IT LIKES. IT HEARS WHAT PEOPLE THINK. AND IT TELLS ME.',
  ],
  ask: 'TELL ME. ARE YOU THINKING OF A PLAYING CARD?',
  askNo: ['THEN THINK OF ONE NOW. ANY CARD AT ALL.', 'TAKE YOUR TIME. I AM VERY OLD. I CAN WAIT.'],
  askAgain: 'DO YOU HAVE ONE?',
  wizard2: ['GOOD. DON\'T SAY IT. JUST SEE IT IN YOUR MIND. CLEAR AS DAY.', 'NOW... LET THE WIND IN.'],
  // word mode (URL "?=" with a ciphered word)
  askWord: 'TELL ME. ARE YOU THINKING OF A WORD?',
  askNoWord: ['THEN THINK OF ONE NOW. ANY WORD AT ALL.', 'TAKE YOUR TIME. I AM VERY OLD. I CAN WAIT.'],
  wizard2Word: ['GOOD. DON\'T SAY IT. SPELL IT OUT IN YOUR HEAD. ONE LETTER AT A TIME.', 'NOW... LET THE WIND IN.'],
  wizard3: ['THE WIND IS NEVER WRONG.', 'THANK YOU, {N}. IT FEELS GOOD TO HEAR IT BLOW AGAIN.'],
};

export const VALUE_NAMES = [null, 'ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];
export const SUIT_NAMES = { C: 'CLUBS', H: 'HEARTS', S: 'SPADES', D: 'DIAMONDS' };
export const CHASED = ['C', 'H', 'S', 'D'];
export function cardName(v, s) { return `${VALUE_NAMES[v]} OF ${SUIT_NAMES[s]}`; }

// Title-screen value grid (reading order), King is the band underneath.
export const VALUE_GRID = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];

// Parse a URL force like "7D", "10h", "QS". Returns {v,s} or null.
export function parseForce(str) {
  const m = /^(10|[2-9]|[ajqk])([chsd])/i.exec(str || '');
  if (!m) return null;
  const t = m[1].toUpperCase();
  const v = t === 'A' ? 1 : t === 'J' ? 11 : t === 'Q' ? 12 : t === 'K' ? 13 : parseInt(t, 10);
  return { v, s: m[2].toUpperCase() };
}

// Word force cipher: each letter is typed one key to the RIGHT on its QWERTY row,
// wrapping at the row's end. "hello" is sent as "jraap". Spaces may be + - _ or %20.
const QWERTY = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
function shiftKey(ch, by) {
  for (const row of QWERTY) {
    const i = row.indexOf(ch);
    if (i >= 0) return row[(i + by + row.length) % row.length];
  }
  return ch;
}
export function encodeWord(word) { return [...word.toLowerCase()].map(c => (c === ' ' ? '+' : shiftKey(c, 1))).join(''); }
export function decodeWord(code) {
  let s = code;
  try { s = decodeURIComponent(s.replace(/\+/g, ' ')); } catch (e) { /* keep raw */ }
  return [...s.toLowerCase().replace(/[-_]/g, ' ')].map(c => shiftKey(c, -1)).join('').replace(/\s+/g, ' ').trim().toUpperCase();
}

// Hero classes for the character generator.
export const CLASSES = [
  { name: 'KNIGHT', acc: 'helmet', tunics: ['#3f55c6', '#7d7a8c', '#8f2330'] },
  { name: 'RANGER', acc: 'hood', tunics: ['#3a8a4a', '#6b8a3a', '#2f6f5a'] },
  { name: 'BARD', acc: 'cap', tunics: ['#c04a3e', '#e8903a', '#7a4ab0'] },
  { name: 'MAGE', acc: 'hood', tunics: ['#6a4aa8', '#3f4fa8', '#2c2f6a'] },
  { name: 'ROGUE', acc: 'none', tunics: ['#4a4a5a', '#6b4428', '#2f3a4a'] },
  { name: 'CLERIC', acc: 'none', tunics: ['#e8e4da', '#d9b45a', '#a8c8e8'] },
];
export const SKINS = ['#f5d0a9', '#e0ac7e', '#b97a50', '#8a5534'];
export const HAIRS = ['#3a2a1e', '#7a4a22', '#d9a441', '#c2452d', '#e8e4da', '#2c2f4a', '#5a3a22'];
