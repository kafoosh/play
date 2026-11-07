# ODDPAQ: Winds of Wonder

A tiny 8-bit fantasy RPG that is secretly a mind-reading trick. The spectator names
their hero, wakes up in a small room, walks out through a village and some dark woods,
and meets the wizard in the castle. The wizard names the card they are thinking of.

It is a plain static site: no build step, no libraries, no image or audio files. All the
pixel art, the font and the chiptune music are drawn and played from code in `src/`.
Live at **https://play.oddpaq.com/**.

A play-through takes about 2–3 minutes.

## How the trick works (performer notes)

Arm the card on the **title screen**, then hand over the phone.

1. **Value**: tap the sky. The sky is painted in five colour bands: four equal purple
   bands, then an orange band at the horizon. The four purple bands are the rows, split
   into three equal columns across the screen:

   ```
   +------+------+------+
   |  1   |  2   |  3   |   purple band 1 (top)
   +------+------+------+
   |  4   |  5   |  6   |   purple band 2
   +------+------+------+
   |  7   |  8   |  9   |   purple band 3
   +------+------+------+
   |  10  |  11  |  12  |   purple band 4
   +------+------+------+
   |         13         |   orange band: mountains, trees, castle, down to the grass edge
   +--------------------+
   ```

   The sky fits itself to the screen: on any phone, tablet or computer, upright or
   sideways, all five bands are the same height. The orange band is measured only down
   to the valleys of the mountain outline; the mountains, castle and trees below that are
   still orange (13), they just don't make the band bigger. On a wide screen the castle
   reaches up into the lowest purple band or two; taps there count as the band colour
   behind it. Go by the colour. Taps on the grass below the horizon don't change
   anything (they just sparkle), so a stray tap near START is harmless.

   Values are always numbers, here and in the URL: 1 = Ace, 11 = Jack, 12 = Queen,
   13 = King. The revealed card still shows a real J, Q or K.

   Every tap makes a little sparkle wherever you touch, so the value tap looks like
   playing with the screen. The last tap counts.

   **Confirmation:** a sky tap shows the number you hit in sparkle-dots for a split
   second (under a tenth of a second), then it falls apart into ordinary tap sparkles,
   just like a tap on the grass.

2. **Suit**: tap the (wide) **START** button in one of its four quarters, left to right in CHaSeD order:
   **Clubs, Hearts, Spades, Diamonds**. This also starts the game. The 2nd and 4th
   quarters (Hearts, Diamonds) are a very slightly darker parchment, so you can see
   the four sections if you look for them.

If you skip the value tap, the card defaults to an Ace. If the game is started with the
A button or keyboard instead of a tap on START, the suit defaults to Spades.

### Cheat sheet

**Triple-tap the empty grass at the bottom middle** of the title screen (below START)
to see the value grid (each row painted in its sky colour), a little START button with
its C H S D quarters laid over it, and the card that is currently armed. Tap anywhere
to close it.

### Backup: URL force

Open `play.oddpaq.com/7D` (or `play.oddpaq.com/?=7D`) to arm the 7 of Diamonds before
the page appears. The address bar is reset to the plain site straight away. Anything
may follow the card in the path form (`/7D-x9`, `/QH/foo`); in the `?=` form see
"Card or word?" below. Values are numbers `1`–`13` (`12H` = Queen of Hearts, `1S` = Ace of Spades), suits
`C H S D`, any case. While a URL force is armed, the title-screen taps are ignored, so the
spectator can press START themselves. The cheat sheet shows `(URL)` in this mode.

### Word force (a ciphered word in the address)

To reveal a **word** instead of a card, send the spectator to the site with the word
after the slash, ciphered as **QWERTY + 1**: type each letter using the key one to its
**right** on the same keyboard row, wrapping round at the end of the row.

```
hello  ->  play.oddpaq.com/jraap        (or play.oddpaq.com/?=jraap)
```

| real   | q w e r t y u i o p | a s d f g h j k l | z x c v b n m |
|--------|---------------------|-------------------|---------------|
| type   | w e r t y u i o p q | s d f g h j k l a | x c v b n m z |

So the row ends wrap: `p` → `q`, `l` → `a`, `m` → `z`. For more than one word, put `+`,
`-` or `_` between them (`/jraap+eptaf` = HELLO WORLD). Case doesn't matter.

The address bar is reset to the plain site before the page appears, and title-screen
taps are ignored. The wizard then asks **"ARE YOU THINKING OF A WORD?"** and the word
appears on a scroll ("THE WIND SAYS:"). Short words (up to 10 letters) are shown big;
longer phrases wrap onto up to four lines. The cheat sheet shows `WORD: HELLO`.

**Card or word?** Anything starting with a number is a **card** (`/7D`, `/12h`,
`/1s90x`, or the same after `?=`). Anything made only of letters (plus `+ - _`) is a
**word** (`/jraap`, or `?=jraap`). The one exception is `/!card`, the fortune teller below.

### Fortune teller: a self-working card trick (`/!card`)

Send the spectator to **`play.oddpaq.com/!card`** (or `?=!card`). You never touch the
phone and arm nothing: the game learns the card itself. The address bar is reset to the
plain site, and title-screen taps are ignored. The cheat sheet shows `FORTUNE TELLER (URL)`.
Every other address works exactly as before.

The spectator needs a real deck with both jokers. As they step out of the house, a
fortune teller (after the magician Dani DaOrtiz: red beanie, glasses, long dark hair, goatee, all in black) stops them and talks them through it:

1. Lay the two jokers face up, side by side. Take any five cards; put the rest aside.
2. Shuffle the five face down. Peek at the top card "for good luck" and memorise it.
3. Deal the five face down onto the jokers, alternating, starting with either joker.
4. Put either pile on the other. Then spread the cards, split them anywhere and put
   either half on top of the other, as many times as they like.
5. Spread the packet between their hands.
6. On her table, show where the two jokers lie: move the arrow (D-pad, or tap a gap),
   A puts a joker there, B takes one back. UNDO or YES once both are down. She gives a
   "reading" of the jokers.
7. "EENY... MEENY... MINY... ONE FROM THE PAST, ONE FROM THE PRESENT, ONE FOR THE
   FUTURE." She turns three of the face-down cards, left to right. They flip each one she points at and enter it
   with the value and suit chips. She gives a reading of the colours and suits.
8. She tells them to remember their card, put the rest back in the deck and keep their
   own card face up in the middle.

On the way, the hermit in the woods asks if they have a lucky card, and tells them to
think of it if the wizard asks (on NO, he reminds them it's the card they peeked at).
At the castle the wizard does his usual "are you thinking of a card?" and names it.
The end screen shows a face-down spread with their card face up, outjogged in the middle.

**How it works.** The peeked card is dealt first, so it lands directly on the joker that
gets three cards. Stacking and cutting only rotate the seven-card cycle, so it stays
just above that joker. A hand spread pushes the top card furthest right, so in the
spread (read left to right) their card sits just to the right of that joker:

- **three cards between the jokers:** the card just right of the left-hand joker;
- **two cards between them:** the card just right of the right-hand joker, or the
  first card of the spread if that joker is last.

This assumes the usual left-to-right spread. A spread the other way round still looks
valid but points at the wrong end of the gap.

Her three picks are the leftmost, middle and rightmost of the five face-down cards, so
they're spread evenly. If their card isn't one of those, it takes the place of the
nearest one (a tie is decided at random). So their card is always one of the three, and
the game knows which entry is theirs. Their card can be any of the five face-down
cards, depending on where the jokers fell. Any other joker spacing means the deal went
wrong: she says the jokers are arguing and has them deal again with a new card.

### Award: Look At All Those Chickens

Turn every person in the land into a chicken with the chicken staff at the same time
(17 people, 18 in fortune mode; the witches count, the wizard and the animals don't).
A banner slides in, and the end screen remembers it.

### Along the way

- In any conversation, **B** goes back a page, even to a question already answered.
- In the woods past the bridge, a **hermit** spots you ("!"), walks over and asks if
  you've thought of a playing card (or have a word in mind, in word mode). YES lets you
  pass. NO gets a nudge to have something in mind before seeing the wizard, then lets
  you pass. It's a handy check before the reveal.
- If the bridge **guard** ends up on the bridge (say, after you hit him), he walks off it
  by himself, shoving you or anyone else out of the way, so the bridge can't get blocked.
- The **Story Teller** sits by a log east of the path. He lists a few tales about
  musicians for another time, and says he's "QUITE THE EXPERT AT THE BARD FABLE"
  (*The Expert at the Card Table*).
- **Bard Christian**, a hooded friar with a lute, plays to the ruins of the Tower of
  Winds. The low strings call a Black Tiger, the high ones a White Ghost.
- The **Fan Seller** by the well cries "TALLY HO! TALLY HO!" With no wind, everyone's
  building fans. Fan fronts are sold out, so all she has left are fan backs. "TALLY HO!
  FAN BACKS!"
- The pet in your house is a cream long-haired dachshund. The witches have a black cat, Soot.

### Secret: the evil wizard

While walking around, enter **up, up, down, down, left, right, left, right, B, A** (on a
keyboard: arrows, then O, P). An evil wizard flies down out of the sky and gives the
hero a **chicken staff** and a **wizard hat** (worn from then on). The staff replaces
the hero's weapon: press B and it fires a spark (aimed like the bow) that turns whoever
it hits into a chicken for the rest of the game. Chickens still talk, but everything
they say comes out as squawks ("BAWK BUK-BUK BAGAWK."), keeping the punctuation. A
second bolt turns them back; they're a bit shaken ("...WHAT JUST HAPPENED? I HAD
FEATHERS."). The village's real chickens, hit by the staff, gain the power of speech
and have an existential crisis ("I THINK, THEREFORE I BAWK."); another bolt takes the
words away again. The egg only happens once per game.

The castle wizard can be zapped too. He becomes a chicken that keeps his hat and staff,
and squawks his whole speech, YES/NO question included. The reveal still works: the card
or word appears as usual, and the only real words he says are the answer itself
("BUK BUK... SEVEN OF DIAMONDS!"). Another bolt turns him back.

### Music

The title theme is unchanged. The road theme is a slow D-dorian tune over a drone-like
bass, the castle theme is in E minor, the reveal is a minor arpeggio that opens into
major, and the ending is bittersweet A minor.

### Sound

Sound starts on the first tap (browsers need a touch before they play audio). It pauses
when you leave the browser or switch apps, and comes back when you return. If a phone
refuses to restart sound by itself, the next tap anywhere brings it back. This follows
the approach in Modern-Ouija-Mini, so a backgrounded tab on Android doesn't keep playing
(and stuttering). On iPhone it asks for playback audio, so it plays with the silent switch
on (recent iOS).

## Run locally

```bash
python3 -m http.server 8000   # or: npm start
```

Open http://localhost:8000. Debug shortcuts with a test hero (arms 7♦ if nothing is
armed): `?scene=world`, `?scene=north`, `?scene=castle`, `?scene=class`, `?scene=name`,
`?scene=end`. Add `&cls=0`–`3` to pick the test hero's path (knight, ranger, mage, bard).

Tests (map walkability, NPC placement, every character of every line drawable by the
pixel font and fitting the text box, music timing, URL force parsing, word cipher):

```bash
npm test
```

## Deploy (GitHub Pages)

1. Push to `main`.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. Under **Settings → Pages → Custom domain**, enter `play.oddpaq.com`. The `CNAME`
   file in the repo says the same.
4. At your DNS provider, add a `CNAME` record for `play` pointing to `kafoosh.github.io`.

The workflow (`.github/workflows/pages.yml`) runs the tests, then publishes only the
game files. It also copies `index.html` to `404.html` so the `/7D` URL force works.

## Project layout

```
index.html        page shell, controls, URL force script (card or word)
styles.css        handheld-style layout (portrait and landscape)
src/main.js       game loop, input, scenes (title, name, path, play, end), dialogue, weapons, reveal
src/data.js       maps, NPCs and every line of text
src/art.js        5x7 pixel font, sprites, tiles, playing card
src/audio.js      chiptune engine (pulse, triangle, noise) and the songs
tests/            node --test checks
```

To change a line of dialogue, edit `src/data.js`. `{N}` is replaced with the player's
name. Text boxes hold 23 characters a line and 3 lines a page; longer text runs onto
more pages automatically.
