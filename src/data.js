// Maps, people and words. {N} is replaced by the player's name.

// ---------------------------------------------------------------- legends
// solid: blocks walking. Every other tile is walkable.
const WORLD_LEGEND = {
  T: ['tree', 1], Y: ['pine', 1], '.': ['grass'], ',': ['grass2'], '"': ['tall'], f: ['flowers'],
  '=': ['path'], '~': ['water', 1], '#': ['bridge'], R: ['rock', 1], S: ['sign', 1], u: ['stump', 1],
  P: ['pillar', 1], x: ['rubble'], O: ['runestone', 1], L: ['log', 1], W: ['well', 1], m: ['stall', 1],
  '^': ['roof', 1], B: ['roofB', 1], N: ['roofN', 1], H: ['hwall', 1], w: ['hwin', 1], d: ['door', 1], D: ['door'], F: ['fence', 1],
  l: ['lamp', 1], K: ['ctop', 1], C: ['cwall', 1], Q: ['tower', 1], v: ['cwin', 1], G: ['gate'],
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
      'YYYYYYYYYY.f...l=,.l.f.YYYYYYYYYYY',
      'YYYYYYYYYYY..R..=....YYYYYYYYYYYYY',
      'YYYYYYYYYYYYY...=...YYYYYYYYYYYYYY',
      'YYYYYYYYYYYYYY..=..YYYYYYYYYYYYYYY',
      'YY...,..YYY.=====YYYYY....YYYYYYYY',
      'Y..P...P..Yl=.YYYYYYY.u.....YYYYYY',
      'Y..x.O.x..Y.=SYYYYYYY.....u.YYYYYY',
      'Y.P...x.=====.YYYYYYY...,...YYYYYY',
      'Y...Px..u.Y.=======.........YYYYYY',
      'YY.....YYYYYY.....=YY..u..u.YYYYYY',
      'YYYYYYYYYYYYYYYYY.=.Y.......YYYYYY',
      'YYYYYYYYYYYYYYYYYl=.YYYYYYYYYYYYYY',
      'YYYYYYYYYYYYYYY...=.L...YYYYYYYYYY',
      'YYYYYYYYYYYYYY..,.=....,YYYYYYYYYY',
      '~~~~~~~~~~~~~~~~~~#~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~#~~~~~~~~~~~~~~~',
      'TTTTT.T...........=.......~~~~~~~~',
      'TTTTT...T."".T..f.=l.T..~~~~~~~~~~',
      'TTTTTf.........R..=...f.~~~~~~~~~~',
      'TTTTT,....f.......=....~~~~~~~~~~~',
      'TTT..............S=====~~~~~~~~~~~',
      'TT..BBBBB..NNNN...=..,.~~~~~~~~~~~',
      'TT..BBBBB..NNNN...=l..."~~~~~~~~~~',
      'TT..HwdwH..HdwH...=.f.....~~~~~~~~',
      'TT....=.....=.....=..f..f...~~~~~T',
      'TT.f..=======.....=..."..TTTTTTTTT',
      'TT.f.....==========......TTTTTTTTT',
      'TT.......W........=...R...TTTTTTTT',
      'TT.,..........ff.l=.....T.TTTTTTTT',
      'TT..mmm......f.f..="".....TTTTTTTT',
      'TT........,...f...=..".T..TTTTTTTT',
      'TT.f..""..........=...TTTTTTTTTTTT',
      'TT.........f.^^^^.=...TTTTTTTTTTTT',
      'TTTTTT.f....F^^^^F=.f.TTTTTTTTTTTT',
      'TTTTTT......FHwDHF=...TTTTTTTTTTTT',
      'TTTTTT.....RF..=..=l,.TTTTTTTTTTTT',
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
      well: ['A DEEP WELL. YOU STARE DOWN IT.', 'IT STARES BACK.'],
      stump: ['A STUMP. SOMEONE TRIED TO COUNT THE RINGS AND GAVE UP.'],
      log: ['A MOSSY LOG. GOOD FOR SITTING.'],
      hwin: ['YOU PEEK IN THE WINDOW. A CANDLE BURNS. NOBODY IS HOME.'],
      lamp: ['AN OLD LANTERN. NOBODY EVER FILLS IT, BUT IT NEVER GOES OUT.'],
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
const P = (o) => ({ kind: 'person', skin: '#e8c09a', boots: '#3e2a1a', acc: 'none', ...o });
export const LOOKS = {
  oldman: P({ hair: '#d8d4ca', tunic: '#6a6458', cloak: '#4a4038', beard: true, skin: '#d8a882' }),
  lady: P({ hair: '#8a3a22', tunic: '#7a3a4a', cloak: '#3e4a2e', long: true }),
  kid: P({ hair: '#3a2a1e', tunic: '#8a6a3a', cloak: '#5a4630', kid: true, skin: '#b97a50' }),
  merchant: P({ hair: '#3a2a1e', tunic: '#5a6a34', cloak: '#6a3a22', acc: 'cap', cap: '#6a2a2a', skin: '#d8a882' }),
  fisher: P({ hair: '#6a4422', tunic: '#3e5468', cloak: '#5a5040', acc: 'cap', cap: '#8a7448', beard: true, beardColor: '#6a4422', skin: '#d8a882' }),
  guard: P({ hair: '#3a2a1e', tunic: '#2e3e6a', cloak: '#6a6c74', acc: 'helmet', skin: '#d8a882' }),
  gate: P({ hair: '#3a2a1e', tunic: '#6a1e24', cloak: '#6a6c74', acc: 'helmet', skin: '#8a5534' }),
  woodcutter: P({ hair: '#8a3a22', tunic: '#7a2e24', cloak: '#4a3a24', beard: true, beardColor: '#8a3a22' }),
  bard: P({ hair: '#b8903a', tunic: '#5a3a7a', cloak: '#2e4a3a', acc: 'cap', cap: '#2e5a3a' }),
  sleeper: P({ hair: '#5a3a22', tunic: '#7a5232', sleep: true, skin: '#d8a882' }),
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

// Title-screen value grid: three per row in reading order, 13 is the band underneath.
export const VALUE_GRID = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]];

// Parse a URL force like "7D", "12h", "1S" (numbers only: 1 = Ace, 11-13 = J Q K).
export function parseForce(str) {
  const m = /^(1[0-3]|[1-9])([chsd])/i.exec(str || '');
  return m ? { v: parseInt(m[1], 10), s: m[2].toUpperCase() } : null;
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

// The four paths the player can choose. Two fight up close, two from afar.
// Looks (hair, skin) come from the player's name; the outfit comes from the class.
export const CLASSES = [
  { id: 'knight', name: 'KNIGHT', weapon: 'SWORD', range: 'CLOSE', hp: 18, mp: 2,
    look: { acc: 'helmet', tunic: '#2e3e6a', cloak: '#6a1e24' } },
  { id: 'ranger', name: 'RANGER', weapon: 'BOW', range: 'FAR', hp: 14, mp: 4,
    look: { acc: 'hood', tunic: '#3e5a2e', hood: '#2e4a2a' } },
  { id: 'mage', name: 'MAGE', weapon: 'STAFF', range: 'FAR', hp: 10, mp: 16,
    look: { acc: 'hood', tunic: '#3e2a6a', hood: '#4e2e8a' } },
  { id: 'bard', name: 'BARD', weapon: 'LUTE', range: 'CLOSE', hp: 12, mp: 8,
    look: { acc: 'cap', tunic: '#7a2e2e', cap: '#2e5a3a', cloak: '#4a3a2a' } },
];

// What people (and animals) shout when your weapon hits them. Nobody gets hurt.
export const OUCH = {
  person: ['OW!', 'HEY!', 'RUDE!', 'STOP THAT!', 'WHAT WAS THAT FOR?', 'I SAW THAT!'],
  guard: ['OI! WATCH IT!', 'THAT IS A CRIME.', 'DO NOT TEST ME.'],
  gate: ['OI! WATCH IT!', 'THAT IS A CRIME.', 'DO NOT TEST ME.'],
  oldman: ['MY BACK!', 'IN MY DAY...', 'YOUNG FOOL!'],
  kid: ['MUM!', 'DO IT AGAIN!', 'NOT FAIR!'],
  bard: ['MY LUTE!', 'OFF KEY!', 'A CRITIC!'],
  sleeper: ['WHA-? ...ZZZ', 'MMF. ZZZ...'],
  cat: ['HSSS!', 'MRRAW!'],
  chicken: ['BAWK!!', 'BA-GAWK!'],
  frog: ['RIBBIT?!', 'CROAK!'],
  wizard: ['HM.', 'CUTE.', 'NO.'],
};
// The secret: up up down down left right left right B A.
export const KONAMI = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'B', 'A'];
export const EGG = {
  hello: ['HEH HEH HEH. YOU KNOW THE OLD WORDS.', 'NOBODY HAS SAID THEM IN A HUNDRED YEARS.', 'TAKE THIS STAFF. AND THIS HAT. THEY SUIT YOU.', 'POINT IT AT SOMEONE AND PRESS B. YOU WILL SEE.', 'AND DON\'T TELL THE OTHER WIZARD.'],
  got: ['YOU GOT THE CHICKEN STAFF!', 'YOU GOT A WIZARD HAT!'],
};
// Turn speech into chicken. Keeps the punctuation so it still "reads" like the original.
const BAWKS = ['BAWK', 'BUK', 'BUK-BUK', 'BAGAWK', 'CLUCK', 'BAWK', 'BUK', 'BRAAWK'];
export function squawk(str) {
  let k = 0;
  return String(str).replace(/[A-Z0-9'{}-]+/gi, w => BAWKS[(w.length * 7 + k++ * 3) % BAWKS.length]);
}

// Said once, the next time you talk to someone you hit.
export const GRUDGE = ['THAT HURT, YOU KNOW.', 'STILL SORE FROM THAT.', 'I HAVE NOT FORGOTTEN.'];
export const SKINS = ['#e8c09a', '#d8a882', '#b07a52', '#7e5234'];
export const HAIRS = ['#2e2018', '#6a4422', '#b8903a', '#8a3a22', '#c8c4ba', '#1e2028', '#4a3022'];
