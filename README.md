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

1. **Value**: tap the sky. The area above the START button is an invisible grid:

   ```
   +----+----+----+----+
   | 1  | 2  | 3  | 4  |      1 = Ace
   +----+----+----+----+
   | 5  | 6  | 7  | 8  |
   +----+----+----+----+
   | 9  | 10 | 11 | 12 |      11 = Jack, 12 = Queen
   +----+----+----+----+
   |         13        |   <- the band just above START (King)
   +-------------------+
   ```

   Values are always numbers, here and in the URL: 1 = Ace, 11 = Jack, 12 = Queen,
   13 = King. The revealed card still shows a real J, Q or K.

   The grid covers the full width, from the top of the screen down to just above
   START, in four equal rows. Every tap makes a little sparkle wherever you touch, so
   the value tap looks like playing with the screen. The last tap counts.

2. **Suit**: tap **START** in one of its four quarters, left to right in CHaSeD order:
   **Clubs, Hearts, Spades, Diamonds**. This also starts the game.

If you skip the value tap, the card defaults to an Ace. If the game is started with the
A button or keyboard instead of a tap on START, the suit defaults to Spades.

### Cheat sheet

**Triple-tap `@ODDPAQ`** at the bottom of the title screen to see the value grid, the
suit order and the card that is currently armed. Tap anywhere to close it.

### Backup: URL force

Open `play.oddpaq.com/7D` (or `play.oddpaq.com/?=7D`) to arm the 7 of Diamonds before
the page appears. The address bar is reset to the plain site straight away. Anything
may follow the card in the path form (`/7D-x9`, `/QH/foo`); in the `?=` form see
"Card or word?" below. Values are numbers `1`–`13` (`12H` = Queen of Hearts, `1S` = Ace of Spades), suits
`C H S D`, any case. While a URL force is armed, the title-screen taps are ignored, so the
spectator can press START themselves. The cheat sheet shows `(URL)` in this mode.

### Word force (`?=` with a ciphered word)

To reveal a **word** instead of a card, send the spectator to the site with the word
after `?=`, ciphered as **QWERTY + 1**: type each letter using the key one to its
**right** on the same keyboard row, wrapping round at the end of the row.

```
hello  ->  play.oddpaq.com/?=jraap
```

| real   | q w e r t y u i o p | a s d f g h j k l | z x c v b n m |
|--------|---------------------|-------------------|---------------|
| type   | w e r t y u i o p q | s d f g h j k l a | x c v b n m z |

So the row ends wrap: `p` → `q`, `l` → `a`, `m` → `z`. For more than one word, put `+`,
`-` or `_` between them (`?=jraap+eptaf` = HELLO WORLD). Case doesn't matter.

The address bar is reset to the plain site before the page appears, and title-screen
taps are ignored. The wizard then asks **"ARE YOU THINKING OF A WORD?"** and the word
appears on a scroll ("THE WIND SAYS:"). Short words (up to 10 letters) are shown big;
longer phrases wrap onto up to four lines. The cheat sheet shows `WORD: HELLO`.

**Card or word?** After `?=`, anything starting with a number is a **card** (`?=7D`,
`?=12h`, `?=1s90x`) and anything made only of letters (plus `+ - _`) is a **word**.
There are no exceptions. The `/7D` path form is always a card.

### The reveal

The spectator is guided north by the letter on the table, the signs and most of the
villagers. In the castle the wizard asks **"ARE YOU THINKING OF A PLAYING CARD?"**
Answering NO makes him wait and ask again. After YES the wind comes back, the screen
flashes and the armed card appears with its name, for example **SEVEN OF DIAMONDS**.
The end screen keeps the card on show.

## Look and controls

The game fills the whole screen in a medieval fantasy style set at dusk: cobbled roads,
timber-framed houses with thatch and slate roofs, dark fir woods, a stone castle. Lanterns,
windows and torches glow, and motes of magic drift in the air. It works in portrait and
landscape, on phones and on desktop. The pixel size is chosen so the art always stays
crisp, and at least 10 tiles are visible across the short side.

- **Phone:** while walking around, a see-through D-pad (bottom left) and **A** button
  (bottom right) float over the game. They are hidden on the title, name, hero and
  ending screens, which are tap-only. In portrait the camera and text box stay above
  the controls; in landscape the text box sits between them. Tapping the text box also
  advances it, and YES/NO can be tapped directly. The ♫ button (top right) mutes.
- **Keyboard:** arrows or WASD to walk; Z, X, Space or Enter for A. On the name screen
  you can just type, with Backspace and Enter.

People's names show on a tab above their text box (GUARD, WIZARD and so on).

## Run locally

```bash
python3 -m http.server 8000   # or: npm start
```

Open http://localhost:8000. Debug shortcuts with a test hero (arms 7♦ if nothing is
armed): `?scene=world`, `?scene=north`, `?scene=castle`, `?scene=hero`, `?scene=name`,
`?scene=end`.

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
src/main.js       game loop, input, scenes (title, name, hero, play, end), dialogue, reveal
src/data.js       maps, NPCs and every line of text
src/art.js        5x7 pixel font, sprites, tiles, playing card
src/audio.js      chiptune engine (pulse, triangle, noise) and the songs
tests/            node --test checks
```

To change a line of dialogue, edit `src/data.js`. `{N}` is replaced with the player's
name. Text boxes hold 23 characters a line and 3 lines a page; longer text runs onto
more pages automatically.
