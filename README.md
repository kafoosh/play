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
**word** (`/jraap`, or `?=jraap`). There are no exceptions.

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

- **Phone:** from the name screen onwards, a see-through D-pad (bottom left) and
  **A** (talk / pick) and **B** (weapon / delete / back) buttons (bottom right, same
  size) float over the game. The name is spelled on a QWERTY keyboard with the D-pad
  and A, then **NEXT**; the path is chosen with left/right and A. Only the title and
  ending screens are tap-only. In portrait the camera and text box stay above
  the controls; in landscape the text box sits between them. Tapping the text box also
  advances it, and YES/NO can be tapped directly. The ♫ button (top right) mutes.
- **Keyboard:** WASD or arrows to walk; **P** (or Enter/Space) is A; **O** is B. On a
  computer the on-screen buttons simply read P and O (instead of A and B), and the
  opening text says which key talks. On the name screen
  you can just type, with Backspace and Enter.

People's names show on a tab above their text box (GUARD, WIZARD and so on).

### Heroes and weapons

After the name, the player chooses one of four paths. Hair and skin come from their
name; the outfit and weapon come from the path.

| Path   | Weapon | Range | How it works (B button) |
|--------|--------|-------|-------------------------|
| KNIGHT | Sword  | Close | Sweeps the blade in a short arc in front of you. |
| RANGER | Bow    | Far   | Fires an arrow that aims itself at the nearest person roughly in front of you. |
| MAGE   | Staff  | Far   | Casts a glowing spark, aimed the same way. |
| BARD   | Lute   | Close | A loud chord that hits everyone right around you. |

No aiming is needed: face roughly the right way and press B. Nobody gets hurt. People
and animals blink, hop back a step and a small word floats up ("OW!", "MY BACK!", "BAWK!!").
The next time you talk to someone you hit, they mention it first. The wizard is not
impressed.

### Side quest: the frog, the key and the witches

The blue house in the village is locked. A short trail of wet, water-blue frog prints
leads away from under its window toward the lake.
Hit the frog (by the lake) with your weapon, or just talk to it (it
doesn't show a speech bubble like the others, so it isn't obvious), and it coughs up a
rusty key.
It always lands on open ground you can reach (never in the water, and never behind the
frog), and nobody wanders onto it. Walk into the frog and it hops out of your way; in a
dead end by the lake it hops back past you instead. Pick it up, then press A at the blue door: "LOCKED." / "...WAIT. THE KEY!" and it opens. Inside are three witches, stuck in for three days since their own frog swallowed the
door key and escaped out the window. Each tells her part of the story when you talk to
her, and lets slip a hint about a sister you haven't spoken to yet; talk to all three (any order). The third one tosses you a can of **Crimson Cow** (silver and blue): you
hold it up, drink it (it does nothing, but you feel energised), and when you step back
outside you've grown a pair of wings: "HUH. I GUESS CRIMSON COW GIVES YOU FEATHERS."

### Side quest: the worms, the rod and the big red herring

- Talk to the dachshund at home a third time and it flops onto its back and wriggles
  for belly scratches.
- In the top-left corner of the ruins (by the runestone) there's a pile of wriggling
  worms. Press A on it to pick one up: "I'D LOVE FISHING WITH YOU, EVEN IF YOU ARE A WORM."
- The bard across the bridge used to fish the lake, until the wizard hummed his tune back
  to him. Now he plays all day, so he gives you his old fishing rod. (If you're already
  carrying a worm it goes straight on the hook; otherwise press A on the worms again.)
- Press A facing water with the rod: no worm and you need to bait the hook; anywhere but
  the lake beside the old fisher and "THIS DOESN'T LOOK LIKE A GOOD PLACE TO FISH."
- By the fisher: you cast, get a bite and reel in a red fish ("MAYBE A SNAPPER OR
  SOMETHING"). The fisher can't believe it, cooks it on a little fire, tells you it's a
  BIG RED HERRING and hands it back. You eat it: "WOW! A BIG RED HERRING. WHAT A GREAT USE OF MY TIME!" "RED HERRING" is always drawn slightly bold. It only bites once.

### Along the way

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
