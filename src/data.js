// Maps, people and words. {N} is replaced by the player's name.

// ---------------------------------------------------------------- legends
// solid: blocks walking. Every other tile is walkable.
const WORLD_LEGEND = {
  T: ['tree', 1], Y: ['pine', 1], '.': ['grass'], ',': ['grass2'], '"': ['tall'], f: ['flowers'],
  '=': ['path'], '~': ['water', 1], '#': ['bridge'], R: ['rock', 1], S: ['sign', 1], u: ['stump', 1],
  P: ['pillar', 1], x: ['rubble'], O: ['runestone', 1], L: ['log', 1], W: ['well', 1], m: ['stall', 1],
  '^': ['roof', 1], B: ['roofB', 1], N: ['roofN', 1], H: ['hwall', 1], w: ['hwin', 1], d: ['door', 1], D: ['door'], F: ['fence', 1],
  l: ['lamp', 1], V: ['worms', 1], K: ['ctop', 1], C: ['cwall', 1], Q: ['tower', 1], v: ['cwin', 1], G: ['gate'],
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
      'YYV..,..YYY.=====YYYYY....YYYYYYYY',
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
      'TT.,..........ff.l=...L.T.TTTTTTTT',
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
      '6,28': ['LOCKED.'],
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
  // The blue house in the village: three witches, locked in.
  witches: {
    legend: { ...HOME_LEGEND, c: ['cauldron', 1] },
    music: 'field',
    rows: [
      '##########',
      '#WkWnWWhk#',
      '#________#',
      '#___c____#',
      '#________#',
      '#_rrr____#',
      '#_rrr__p_#',
      '####E#####',
    ],
    warps: { '4,7': { map: 'world', x: 6, y: 29, dir: 'down' } },
    looks: {
      cauldron: ['A BUBBLING CAULDRON. IT SMELLS OF NEWT.'],
      shelf: ['JARS OF EYES, TOES AND ONE LABELLED "DO NOT".'],
      hwindow: ['THE WINDOW THE FROG JUMPED OUT OF.', 'THERE IS A FROG-SHAPED SMUDGE ON THE GLASS.'],
      hearth: ['A GREEN FIRE. IT GIVES OFF NO HEAT AT ALL.'],
      pot: ['A POT OF SOMETHING. IT BLINKS AT YOU.'],
      paper: [],
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
  storyteller: P({ hair: '#9a9aa2', tunic: '#2e4a6a', cloak: '#7a2e24', beard: true, beardColor: '#b8b8c0', acc: 'cap', cap: '#7a2e24', skin: '#d8a882' }),
  fanseller: P({ hair: '#6a2e3a', tunic: '#d8507a', cloak: '#5a2a4a', long: true }),
  friar: P({ hair: '#5a3e26', tunic: '#6a4a2e', cloak: '#4a3220', acc: 'hood', hood: '#5a3e26' }),
  bard: P({ hair: '#b8903a', tunic: '#5a3a7a', cloak: '#2e4a3a', acc: 'cap', cap: '#2e5a3a' }),
  sleeper: P({ hair: '#5a3a22', tunic: '#7a5232', sleep: true, skin: '#d8a882' }),
  hermit: P({ hair: '#8a8a90', tunic: '#4a4652', acc: 'hood', hood: '#5a5660', skin: '#d8a882' }),
  seer: P({ hair: '#6a2a6a', tunic: '#3a2a6a', cloak: '#2a1a4a', acc: 'hood', hood: '#7a2a6a', long: true, skin: '#c89a76' }),
  witch1: P({ hair: '#2a2a32', tunic: '#3a2a4a', cloak: '#1e1a26', long: true, skin: '#c8d0a8' }),
  witch2: P({ hair: '#c85a2a', tunic: '#2e3a2e', cloak: '#1e261e', long: true }),
  witch3: P({ hair: '#d8d4ca', tunic: '#4a2a3a', cloak: '#2a1a24', beard: false, skin: '#d8a882' }),
  dog: { kind: 'dog' }, cat: { kind: 'cat' }, blackcat: { kind: 'cat', black: true }, chicken: { kind: 'chicken' }, frog: { kind: 'frog' }, wizard: { kind: 'wizard' },
};
for (const k in LOOKS) LOOKS[k].key = k;

// talk: first chat. again: later chats (falls back to talk).
export const NPCS = [
  { id: 'dog', name: 'DOG', map: 'home', x: 6, y: 3, look: 'dog', wander: 2, slow: true,
    talk: ['WOOF.'], again: ['THE DOG STARES AT THE DOOR.', 'WOOF.'] },

  { id: 'guard', name: 'GUARD', map: 'world', x: 18, y: 21, look: 'guard', dir: 'down', bump: true, spear: true,
    talk: ['HALT! WHO GOES THERE?', '...{N}? OH. THE WIZARD SAID YOU WOULD COME.', 'GO ON THEN. THE CASTLE IS NORTH, PAST THE WOODS.'],
    again: ['THE CASTLE IS NORTH. STICK TO THE PATH.'] },
  { id: 'fisher', name: 'FISHER', map: 'world', x: 22, y: 26, look: 'fisher', dir: 'right',
    talk: ['NOTHING HAS BITTEN SINCE THE STILL NIGHT.', 'NO WIND, NO WAVES. THE LAKE IS FLAT AS GLASS.'],
    again: ['STILL NOTHING.'] },
  { id: 'hermit', name: 'HERMIT', map: 'world', x: 13, y: 14, look: 'hermit', dir: 'right',
    talk: ['THE CASTLE IS JUST AHEAD. KEEP THAT THOUGHT.'] },
  { id: 'soot', name: 'SOOT', map: 'witches', x: 8, y: 2, look: 'blackcat', wander: 2, slow: true,
    talk: ['MEOW.'], again: ['THE CAT LOOKS AT YOU LIKE IT KNOWS SOMETHING YOU DON\'T.'] },
  // (before the Crimson Cow, each witch says her part of QUEST.witchTalk instead)
  { id: 'circe', name: 'CIRCE', map: 'witches', x: 6, y: 3, look: 'witch1', dir: 'down', hat: 'witch',
    talk: ['MIND HOW YOU GO. AND IF YOU SEE OUR FROG, TELL IT TO COME HOME.'] },
  { id: 'bess', name: 'BESS', map: 'witches', x: 7, y: 5, look: 'witch2', dir: 'left', hat: 'witch',
    talk: ['IT\'S NEWT FOR DINNER. IT\'S ALWAYS NEWT.'] },
  { id: 'pennatella', name: 'PENNATELLA', map: 'witches', x: 2, y: 3, look: 'witch3', dir: 'right', hat: 'witch',
    talk: ['IF YOU SEE THE WIZARD, TRY NOT TO THINK ABOUT US.'] },
  // quiet: no speech bubble when you face it, so it isn't obvious you can talk to it
  { id: 'frog', name: 'FROG', map: 'world', x: 25, y: 28, look: 'frog', wander: 1, slow: true, quiet: true,
    talk: ['RIBBIT.', '...HIC!'], again: ['RIBBIT.'] },
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
  // the storyteller by the log in the village
  { id: 'teller', name: 'STORY TELLER', map: 'world', x: 21, y: 33, look: 'storyteller', dir: 'left',
    talk: ['I TELL THE BEST STORIES IN THE VILLAGE.', 'THE PIPER WHO PLAYED A WOLF TO SLEEP.', 'THE FRIAR WHO PLAYED UP A TIGER.', 'BUT THOSE ARE FOR ANOTHER TIME.', 'I\'M QUITE THE EXPERT AT THE BARD FABLE, YOU KNOW.'],
    again: ['ANOTHER TIME, I SAID. A GOOD TALE NEEDS A FIRE AND A FULL CUP.'] },
  // a travelling friar with a lute, playing to the ruins of the Tower of Winds
  { id: 'friar', name: 'BARD CHRISTIAN', map: 'world', x: 7, y: 13, look: 'friar', dir: 'down', notes: true, lute: true,
    talk: ['PEACE, FRIEND. I AM BARD CHRISTIAN.', 'I PLAYED FOR THE OLD TOWER, BEFORE THE WIND LEFT.', 'LOW NOTES ON MY LYRE, DARK AS A BLACK TIGER.', 'HIGH NOTES PURE WHITE, LIKE A GHOST.', 'BOTH AT ONCE? THE ABBOT SAYS NEVER.'],
    again: ['I KEEP TO THE MIDDLE STRINGS. SAFER THAT WAY.'] },
  // no wind since the Still Night, so everyone's building fans
  { id: 'fans', name: 'FAN SELLER', map: 'world', x: 8, y: 33, look: 'fanseller', dir: 'down', fan: true,
    talk: ['TALLY HO! TALLY HO!', 'FAN PARTS! NO WIND, SO BUILD YOUR OWN BREEZE.', 'RIBS, RIVETS, HANDLES. FAN FRONTS SOLD OUT.', 'ALL I\'VE GOT LEFT ARE FAN BACKS.', 'STILL, HALF A FAN MAKES HALF A BREEZE.', 'TALLY HO! FAN BACKS!'],
    again: ['FAN BACKS! HALF A FAN STILL MAKES HALF A BREEZE.'] },
  { id: 'sleeper', name: '???', map: 'world', x: 15, y: 17, look: 'sleeper', sleep: true,
    talk: ['ZZZ...'], again: ['ZZZ... FIVE MORE MINUTES... ZZZ...'] },
  { id: 'gate', name: 'GATE GUARD', map: 'world', x: 17, y: 5, look: 'gate', dir: 'down', spear: true,
    talk: ['THE WIZARD IS WAITING FOR YOU, {N}.', 'A WORD OF ADVICE. DON\'T THINK TOO LOUD IN THERE.'],
    again: ['GO ON IN.'] },

  // fortune mode only (play.oddpaq.com/!card): she stops you as you leave the house
  { id: 'seer', name: 'FORTUNE TELLER', map: 'world', x: 17, y: 40, look: 'seer', dir: 'left', fortuneOnly: true,
    talk: ['THE CARDS HAVE SPOKEN, DEAR.', 'KEEP YOUR CARDS SAFE. THE WIZARD IS WAITING, NORTH OVER THE BRIDGE.'],
    again: ['GO ON! IS YOUR DECK IN A BOX?'] },

  { id: 'wizard', name: 'WIZARD', map: 'castle', x: 4, y: 3, look: 'wizard', dir: 'down', tall: true },
];

// ---------------------------------------------------------------- story beats
export const SCRIPT = {
  wake: ['YOU WAKE UP. THE WIND IS QUIET TODAY.', 'SOMEONE LEFT A LETTER ON THE TABLE.', 'USE THE PAD TO WALK. PRESS A TO TALK OR LOOK.'],
  comeCloser: ['COME CLOSER, {N}.'],
  wizard1: [
    'AH. {N}. YOU CAME.',
    'THE WINDS TELL ME YOU HAVE SOMETHING ON YOUR MIND.',
    'THE WIND KNOWS. AND IT TELLS ME.',
  ],
  ask: 'TELL ME. ARE YOU THINKING OF A PLAYING CARD?',
  askNo: ['THEN THINK OF ONE NOW. ANY CARD AT ALL.', 'TAKE YOUR TIME. I AM VERY OLD. I CAN WAIT.'],
  askAgain: 'DO YOU HAVE ONE?',
  wizard2: ['GOOD. DON\'T SAY IT. JUST PICTURE IT.', 'NOW... LET THE WIND IN.'],
  // word mode (URL "?=" with a ciphered word)
  askWord: 'TELL ME. ARE YOU THINKING OF A WORD?',
  askNoWord: ['THEN THINK OF ONE NOW. ANY WORD AT ALL.', 'TAKE YOUR TIME. I AM VERY OLD. I CAN WAIT.'],
  wizard2Word: ['GOOD. DON\'T SAY IT. SPELL IT IN YOUR HEAD.', 'NOW... LET THE WIND IN.'],
  wizard3: ['THE WIND IS NEVER WRONG.', 'FAREWELL, {N}.'],
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
  dog: ['YIP!', 'WOOF?!', 'GRR!'],
  chicken: ['BAWK!!', 'BA-GAWK!'],
  frog: ['RIBBIT?!', 'CROAK!'],
  wizard: ['HM.', 'CUTE.', 'NO.'],
};
// The secret: up up down down left right left right B A.
export const KONAMI = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'B', 'A'];
export const EGG = {
  hello: ['HEH HEH HEH. YOU KNOW THE OLD WORDS.', 'NOBODY HAS SAID THEM IN A HUNDRED YEARS.', 'TAKE THIS STAFF. AND THIS HAT. THEY SUIT YOU.', 'USE IT ON SOMEONE.', 'AND DON\'T TELL THE OTHER WIZARD.'],
  got: ['YOU GOT THE CHICKEN STAFF!', 'YOU GOT A WIZARD HAT!'],
  // a villager turned back from a chicken, the first time you talk to them
  restored: ['...WHAT JUST HAPPENED?', 'I HAD FEATHERS. SUCH LOVELY FEATHERS.'],
  // a real chicken that the staff has given words to
  woke: {
    hen1: { talk: ['I CAN... TALK?', 'WAIT. AM I A CHICKEN? HAVE I ALWAYS BEEN A CHICKEN?', 'ALL THOSE YEARS OF PECKING AT THE GROUND. WHAT WAS IT ALL FOR?'],
      again: ['I THINK, THEREFORE I BAWK.'] },
    hen2: { talk: ['WHAT IS THIS? WORDS? IN MY BEAK?', 'I HAVE SO MANY QUESTIONS. WHY DID I CROSS THAT ROAD? WHAT WAS ON THE OTHER SIDE?', 'NOBODY EVER TOLD ME.'],
      again: ['IF I LAY AN EGG AND NOBODY SEES IT, DID I LAY IT?'] },
  },
};
// Turn speech into chicken. Keeps the punctuation so it still "reads" like the original.
const BAWKS = ['BAWK', 'BUK', 'BUK-BUK', 'BAGAWK', 'CLUCK', 'BAWK', 'BUK', 'BRAAWK'];
export function squawk(str) {
  let k = 0;
  return String(str).replace(/[A-Z0-9'{}-]+/gi, w => BAWKS[(w.length * 7 + k++ * 3) % BAWKS.length]);
}

// Side quest: the frog, the key and the witches.
export const QUEST = {
  hermit: {
    hello: ['WAIT, TRAVELLER.', 'YOU ARE GOING TO SEE THE WIZARD?'],
    askCard: 'TELL ME. HAVE YOU THOUGHT OF A PLAYING CARD?',
    askWord: 'TELL ME. DO YOU HAVE A WORD IN MIND?',
    yes: ['GOOD. HOLD ON TO IT. GO ON.'],
    no: ['THEN THINK OF ONE BEFORE YOU REACH HIS DOOR.', 'HE HAS NO TIME FOR AN EMPTY HEAD.', 'GO ON, THEN.'],
  },
  frogKey: ['THE FROG COUGHS UP SOMETHING SHINY!'],
  gotKey: ['YOU GOT A RUSTY KEY!'],
  unlock: ['LOCKED.', '...WAIT. THE KEY!', 'YOU UNLOCK THE DOOR WITH THE RUSTY KEY.'],
  // Each witch tells her part; talk to all three for the reward.
  witchTalk: {
    circe: ['OH! YOU GOT IN! WE\'VE BEEN STUCK IN HERE FOR THREE DAYS.', 'OUR FROG SWALLOWED THE DOOR KEY. THEN IT ESCAPED OUT THE WINDOW.'],
    bess: ['DON\'T MIND THE SMELL. THAT\'S DINNER.', 'THAT FROG WAS MEANT FOR A POTION. IT HAD OTHER IDEAS.', 'I TRIED A SPELL TO GET THE KEY BACK. IT TURNED ME BLUE FOR A WEEK.'],
    pennatella: ['SO YOU FOUND OUR KEY. THANK YOU.', 'IF YOU\'RE OFF TO SEE THE WIZARD... WE DON\'T TALK TO HIM.', 'HE KNOWS WHAT YOU\'RE THINKING BEFORE YOU SAY IT. IT\'S RUDE.'],
  },
  // Instead of "talk to the others": each witch lets slip something about a sister you
  // haven't spoken to yet. Speaker -> sister -> hints (they take turns if you ask again).
  witchHint: {
    circe: {
      bess: ['BESS IS STILL A BIT BLUE. DON\'T STARE.', 'BESS HAS TALKED TO THAT POT ALL DAY. SHE\'D LIKE A CHANGE.'],
      pennatella: ['PENNATELLA HASN\'T TAKEN HER EYES OFF YOU.', 'PENNATELLA NEVER SAYS THANK YOU. BUT SHE DOES THANK YOU.'],
    },
    bess: {
      circe: ['CIRCE LOST THE FROG, YOU KNOW. SHE TELLS IT DIFFERENT.', 'CIRCE\'S BEEN PACING BY THE WINDOW FOR THREE DAYS.'],
      pennatella: ['PENNATELLA KEEPS SOMETHING COLD IN THE CUPBOARD. FOR GUESTS.', 'PENNATELLA PAYS HER DEBTS. EVENTUALLY.'],
    },
    pennatella: {
      circe: ['CIRCE OWES YOU MORE THAN I DO. IT WAS HER FROG.', 'CIRCE HAS A LOT TO SAY. SHE ALWAYS DOES.'],
      bess: ['BESS COULD USE SOMEONE NEW TO TALK AT.', 'MIND THE POT IF YOU GO NEAR BESS. IT BITES.'],
    },
  },
  give: ['HERE. TAKE THIS FOR YOUR TROUBLE.'],
  gotPotion: ['YOU GOT A CRIMSON COW!'],
  drinkIt: ['WELL, DON\'T JUST STAND THERE. DRINK IT.'],
  drink: ['YOU DRINK THE CRIMSON COW.', 'IT TASTES OF BERRIES AND THUNDER.', 'NOTHING HAPPENS. BUT YOU FEEL ENERGISED.'],
  wings: ['...WAIT. WHAT\'S ON MY BACK?', 'HUH. I GUESS CRIMSON COW GIVES YOU FEATHERS.'],
};

// Side quest: the dog, the worms, the bard's old rod and the big red herring.
export const FISH = {
  belly: ['THE DOG FLOPS ONTO ITS BACK AND WRIGGLES.', 'IT WANTS BELLY SCRATCHES.'],
  // the bard used to fish the lake, until the wizard heard his tune
  bard: ['I WROTE A SONG ABOUT THE WIZARD.', 'HE HUMMED IT BACK TO ME. BEFORE I EVER PLAYED IT.',
    'I USED TO FISH THE LAKE, YOU KNOW. EVERY DAY.', 'BUT IF A WIZARD HAS MY TUNE IN HIS HEAD, IT MUST BE GOOD.',
    'SO NOW I PLAY ALL DAY. I DON\'T NEED THIS ANY MORE.', 'HERE. HAVE MY OLD ROD.'],
  gotRod: ['YOU GOT A FISHING ROD!'],
  bardAgain: ['THE FISH NEVER BIT FOR ME. TRY BY THE OLD FISHER, EAST OF THE VILLAGE.'],
  bardDone: ['A BIG RED HERRING? HA! THE LAKE NEVER GAVE ME ONE OF THOSE.'],
  pile: ['A PILE OF WORMS. THEY WRIGGLE.'],
  pickWorm: ['YOU PICK UP A WORM.'],
  wormFriend: ['I\'D LOVE FISHING WITH YOU, EVEN IF YOU ARE JUST A WORM.'],
  haveWorm: ['YOU ALREADY HAVE A WORM. ONE IS PLENTY.'],
  baited: ['YOUR HOOK ALREADY HAS A WORM ON IT.'],
  bait: ['YOU PUT A WORM ON THE HOOK.'],
  canFish: ['NOW I CAN FISH!'],
  noBait: ['I PROBABLY NEED TO BAIT THE HOOK.', 'SO THE FISH WILL FALL FOR THE BAIT.'],
  badSpot: ['HMM. THIS DOESN\'T LOOK LIKE A GOOD PLACE TO FISH.'],
  quiet: ['THE LAKE IS QUIET AGAIN. NOTHING BITES.'],
  caught: ['YOU CAUGHT A FISH!'],
  red: ['IT\'S RED. MAYBE A SNAPPER OR SOMETHING.'],
  fisherSees: ['WELL I NEVER! A BITE!', 'THE FIRST ONE SINCE THE STILL NIGHT.', 'HERE. LET ME COOK THAT FOR YOU.'],
  cooked: ['THERE. A BIG RED HERRING.', 'COOKED JUST RIGHT.'],
  gotHerring: ['YOU GOT A BIG RED HERRING!'],
  eat: ['YOU EAT THE BIG RED HERRING.'],
  better: ['WOW! A BIG RED HERRING. WHAT A GREAT USE OF MY TIME!'],
  fisherAfter: ['TEN YEARS I SAT HERE. YOU GOT ONE IN A MINUTE.', 'I\'M NOT ANGRY. I\'M JUST... THINKING.'],
};

// Said once, the next time you talk to someone you hit.
// Awards: [heading, line 1, line 2] for the banner.
export const AWARD = {
  chickens: ['AWARD!', 'LOOK AT ALL', 'THOSE CHICKENS'],
};
export const GRUDGE = ['THAT HURT, YOU KNOW.', 'STILL SORE FROM THAT.', 'I HAVE NOT FORGOTTEN.'];
export const SKINS = ['#e8c09a', '#d8a882', '#b07a52', '#7e5234'];
export const HAIRS = ['#2e2018', '#6a4422', '#b8903a', '#8a3a22', '#c8c4ba', '#1e2028', '#4a3022'];

// ---------------------------------------------------------------- the fortune teller
// Fortune mode (play.oddpaq.com/!card): a self-working trick. The spectator lays two
// jokers face up, shuffles five cards face down, peeks at the top one and deals the
// five alternately onto the jokers. That puts their card directly on top of the joker
// that gets three cards. One pile goes on the other and they cut as often as they like:
// cuts only turn the cycle, so their card stays just above that joker.
// Then they spread the packet between their hands. A hand spread pushes the top card
// furthest right, so in the spread (read left to right) their card sits just RIGHT of
// that joker:
//   three cards between the jokers: the card just right of the left-hand joker;
//   two cards between them: the card just right of the right-hand joker (if that joker
//   is last in the spread, the first card of the spread).
// Any other spacing means the deal went wrong.
export function fortuneTarget(p, q, n = 7) {
  if (p > q) [p, q] = [q, p];
  const between = q - p - 1, big = (n - 1) >> 1; // 5 cards: gaps of 3 and 2
  if (between === big) return p + 1;
  if (between === n - 2 - big) return q === n - 1 ? 0 : q + 1;
  return -1;
}

export const FORTUNE = {
  hello: ['PSST! {N}! OVER HERE!', 'I\'M THE VILLAGE FORTUNE TELLER.', 'LET ME READ YOUR CARDS BEFORE YOU HEAD NORTH. IT\'S FREE!'],
  askDeck: 'DO YOU HAVE A DECK OF CARDS WITH YOU?',
  noDeck: ['THEN FETCH ONE. WITH BOTH JOKERS.', 'I WILL WAIT. I AM VERY GOOD AT WAITING.'],
  askDeckAgain: 'GOT ONE NOW?',
  setup: ['TAKE OUT BOTH JOKERS. PUT THEM FACE UP, SIDE BY SIDE.', 'NOW TAKE ANY FIVE CARDS. PUT THE REST ASIDE.'],
  deal: [
    'SHUFFLE YOUR FIVE CARDS, FACE DOWN.',
    'NOW PEEK AT THE TOP CARD FOR GOOD LUCK.',
    'MEMORISE IT!',
    'YOU MAY NEED IT IN THE FUTURE.',
    'DEAL THE CARDS ALTERNATELY ON THE JOKERS.',
    'ONE AT A TIME.',
    'ONE ON THIS JOKER, ONE ON THAT, BACK AND FORTH. START WITH EITHER ONE.',
  ],
  askDealt: 'DEALT ALL FIVE?',
  notDealt: ['TAKE YOUR TIME. BACK AND FORTH, ONE CARD AT A TIME.'],
  askDealtAgain: 'DONE?',
  cut: ['GOOD. NOW PUT ONE PILE ON TOP OF THE OTHER. IT\'S YOUR CHOICE.', 'CUT THE CARDS: TAKE SOME OFF THE TOP AND PUT THEM UNDERNEATH.', 'CUT AS MANY TIMES AS YOU LIKE.'],
  askCut: 'HAPPY WITH YOUR CUTS?',
  notCut: ['THEN CUT AGAIN.'],
  askCutAgain: 'HAPPY NOW?',
  row: ['SPREAD THEM BETWEEN YOUR HANDS NOW.', 'SHOW ME WHERE THE JOKERS LIE.'],
  redo: ['HMM? THE JOKERS ARE ARGUING.', 'THE DEAL WENT WRONG SOMEWHERE. ONCE MORE!', 'PUT THE JOKERS FACE UP AGAIN AND GATHER THE OTHER FIVE.', 'FORGET YOUR OLD CARD. YOU\'LL GET A NEW ONE.'],
  point: ['NOW LAY THE SPREAD ON THE TABLE, JUST AS IT IS.', 'NOW THE CARDS. I JUST NEED 3 TO KNOW YOUR FUTURE.'],
  close: [
    'YOUR FORTUNE HAS SPOKEN.',
    'REMEMBER YOUR CHOSEN CARD!',
    'PUT THE REST OF THE CARDS BACK IN YOUR DECK. KEEP YOUR OWN CARD FACE UP IN THE MIDDLE!',
    'OFF YOU GO, {N}. NORTH, OVER THE BRIDGE.',
    'REMEMBER YOUR CARD!',
  ],
  // headings on her table while you name the cards: one for each card she points at
  ui: { which: ['WHAT\'S THIS ONE?', 'AND THIS ONE?', 'AND THE LAST ONE?'], seen: 'SEEN THAT ONE!', reading: 'YOUR FORTUNE' },
};

// A reading of where the jokers fell (p, q: positions in the spread, left = 0).
const pickOf = rand => a => a[Math.floor(rand() * a.length) % a.length];
export function jokerReading(p, q, rand = Math.random) {
  if (p > q) [p, q] = [q, p];
  const pick = pickOf(rand), out = [pick(['OHO! THE JOKERS HAVE SPOKEN.', 'HMM... I SEE. I SEE!'])];
  if (q - p - 1 >= 3) out.push(pick([
    'THEY SIT FAR APART. SOMEONE ON YOUR ROAD IS GRUMPY. BE NICE TO THEM.',
    'FAR APART. A LONG WALK AHEAD. GOOD THING YOU HAVE LEGS.',
  ]));
  else out.push(pick([
    'SIDE BY SIDE... A LOCKED DOOR. A LOST KEY. A FROG?',
    'CLOSE TOGETHER. TWO FRIENDS. OR TWO WITCHES. OR THREE.',
  ]));
  if (p === 0 || q === 6) out.push('ONE IS AT THE VERY EDGE. WATCH THE LAKE SHORE. SOMETHING GREEN WAITS THERE.');
  else if (p + q < 6) out.push('THEY LEAN WEST. THE OLD TOWER HAS A SECRET OR TWO.');
  else if (p + q > 6) out.push('THEY LEAN EAST. THE FISHER COULD USE A FRIEND.');
  else out.push('RIGHT IN THE MIDDLE. STAY ON THE ROAD AND YOU\'LL BE FINE.');
  return out;
}

// A reading of the cards she pointed at, by colour, suit and value. Never names a card.
export function cardReading(cards) {
  const out = [];
  const reds = cards.filter(c => c.s === 'H' || c.s === 'D').length, n = cards.length;
  out.push(reds === n ? 'ALL RED! BEWARE OF RED THINGS. ESPECIALLY FISH.'
    : reds === 0 ? 'ALL BLACK. DARK WOODS AHEAD. KEEP A LIGHT HANDY.'
    : reds * 2 > n ? 'MOSTLY RED. A WARM FIRE IS WAITING FOR YOU AT HOME.'
    : 'MOSTLY BLACK. A QUIET NIGHT. TOO QUIET...');
  const faces = cards.filter(c => c.v >= 11).length, vals = cards.map(c => c.v);
  const pair = vals.some((v, i) => vals.indexOf(v) !== i), sum = vals.reduce((a, b) => a + b, 0);
  if (cards.every(c => c.s === cards[0].s)) out.push('ALL ONE SUIT! WHAT LUCK! TODAY IS YOUR DAY.');
  else if (pair) out.push('A PAIR! SISTERS... LOCKED UP TOGETHER?');
  else if (faces >= 2) out.push('SO MANY FACES! YOU\'LL MEET LOTS OF FOLKS TODAY.');
  else if (faces === 1) out.push('A ROYAL FACE. SOMEONE IN A TALL HAT IS WAITING FOR YOU.');
  else if (vals.includes(1)) out.push('AN ACE! A FRESH START. MAYBE EVEN A FRESH BREEZE.');
  else if (sum <= 12) out.push('SMALL CARDS. DON\'T IGNORE SMALL THINGS. LIKE FROGS.');
  else out.push('STRONG NUMBERS. YOUR BOOTS WILL HOLD UP FINE.');
  // the suit that shows most (the first one shown if they're all different)
  const count = s => cards.filter(c => c.s === s).length;
  const top = cards.map(c => c.s).reduce((a, s) => (count(s) > count(a) ? s : a));
  out.push({
    H: 'HEARTS. SOMEONE AT HOME LOVES YOU. THEY HAVE FOUR SHORT LEGS.',
    C: 'CLUBS. TREES. THEY ALL LEAN NORTH. FUNNY, THAT.',
    S: 'SPADES. DIG AROUND THE OLD RUINS. YOU MIGHT FIND WORMS!',
    D: 'DIAMONDS. TREASURE! OR A RED HERRING.',
  }[top]);
  return out;
}
