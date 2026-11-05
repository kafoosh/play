// Tiny chiptune engine: two pulse voices, a triangle bass and a noise drum,
// scheduled ahead on the WebAudio clock. No audio files.

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function midi(name) {
  const m = /^([A-G])(#?)(-?\d)$/.exec(name);
  if (!m) throw new Error('bad note ' + name);
  return 12 * (parseInt(m[3], 10) + 1) + NOTE[m[1]] + (m[2] ? 1 : 0);
}

// "E5:6 D5:2 -:4 | ..." -> [{at, len, midi}], total length in 16th steps.
export function parseSeq(str) {
  const ev = []; let at = 0;
  for (const tok of str.split(/[\s|]+/)) {
    if (!tok || tok === '|') continue;
    const [n, l] = tok.split(':');
    const len = l ? parseInt(l, 10) : 2;
    if (n !== '-') ev.push({ at, len, midi: midi(n) });
    at += len;
  }
  return { ev, len: at };
}
// chords: [[tones, steps], ...]; pattern: indexes into tones, one per 8th note.
function arp(chords, pattern, step = 2) {
  const ev = []; let at = 0;
  for (const [tones, steps] of chords) {
    for (let i = 0; i < steps / step; i++) ev.push({ at: at + i * step, len: step, midi: midi(tones[pattern[i % pattern.length]]) });
    at += steps;
  }
  return { ev, len: at };
}
function drums(bar, bars) {
  const ev = [];
  for (let b = 0; b < bars; b++) for (let i = 0; i < bar.length; i++) if (bar[i] !== '.') ev.push({ at: b * bar.length + i, len: 1, drum: bar[i] });
  return { ev, len: bars * bar.length };
}

const T = {
  Am: ['A2', 'E3', 'A3', 'C4'], F: ['F2', 'C3', 'F3', 'A3'], G: ['G2', 'D3', 'G3', 'B3'], E: ['E2', 'B2', 'E3', 'G#3'],
  D: ['D2', 'A2', 'D3', 'F#3'], A: ['A2', 'E3', 'A3', 'C#4'], Bm: ['B2', 'F#3', 'B3', 'D4'], Em: ['E2', 'B2', 'E3', 'G3'],
  C: ['C3', 'G3', 'C4', 'E4'], Cl: ['C2', 'G2', 'C3', 'E3'], B: ['B1', 'F#2', 'B2', 'D#3'],
  Dm: ['D2', 'A2', 'D3', 'F3'], Fl: ['F2', 'C3', 'F3', 'A3'], Gl: ['G2', 'D3', 'G3', 'B3'], E7: ['E2', 'B2', 'D3', 'G#3'],
};
const bars = (names, steps = 16) => names.map(n => [T[n], steps]);

export const SONGS = {
  title: {
    bpm: 84, loop: true,
    ch: [
      { type: 'pulse25', vol: 0.16, ...parseSeq('E5:6 D5:2 C5:4 B4:4 | A4:8 C5:4 F5:4 | E5:6 D5:2 B4:4 G4:4 | G#4:12 -:4 | E5:6 D5:2 C5:4 E5:4 | A5:8 G5:4 F5:4 | E5:4 D5:4 C5:4 B4:4 | A4:12 -:4') },
      { type: 'tri', vol: 0.32, ...arp(bars(['Am', 'F', 'G', 'E', 'Am', 'F', 'E', 'Am']), [0, 1, 2, 3, 2, 1, 2, 1]) },
    ],
  },
  // The road: D dorian, unhurried, a little lonely.
  field: {
    bpm: 96, loop: true,
    ch: [
      { type: 'pulse12', vol: 0.15, ...parseSeq(
        'D5:6 E5:2 F5:4 E5:4 | C5:8 E5:4 G5:4 | A5:6 G5:2 F5:4 E5:4 | E5:12 -:4 |' +
        'D5:6 E5:2 F5:4 A5:4 | G5:8 E5:4 C5:4 | B4:6 C5:2 D5:4 G4:4 | A4:12 -:4 |' +
        'F5:4 A5:4 C6:6 A5:2 | G5:8 E5:8 | F5:4 E5:4 D5:4 F5:4 | E5:12 -:4 |' +
        'F5:4 A5:4 C6:4 D6:4 | B5:6 A5:2 G5:4 B5:4 | A5:6 G5:2 E5:4 C5:4 | D5:12 -:4') },
      { type: 'tri', vol: 0.3, ...arp(bars(['Dm', 'Cl', 'Dm', 'Am', 'Dm', 'Cl', 'Gl', 'Am', 'Fl', 'Cl', 'Dm', 'Am', 'Fl', 'Gl', 'Am', 'Dm']), [0, 1, 2, 3, 2, 1, 2, 1]) },
      { type: 'drum', vol: 0.28, ...drums('k.......h.....h.', 16) },
    ],
  },
  castle: {
    bpm: 92, loop: true,
    ch: [
      { type: 'pulse12', vol: 0.15, ...parseSeq('E5:4 -:2 G5:2 F#5:4 E5:4 | F5:8 E5:4 C5:4 | B4:4 E5:4 G5:4 B5:4 | A5:8 F#5:8 | G5:4 F#5:2 E5:2 F#5:4 G5:4 | E5:8 C5:4 G4:4 | F#5:4 D#5:4 B4:4 D#5:4 | F#5:12 -:4') },
      { type: 'tri', vol: 0.34, ...arp(bars(['Em', 'F', 'Em', 'D', 'Em', 'Cl', 'B', 'B']), [0, 1, 2, 3, 2, 1, 2, 1]) },
      { type: 'drum', vol: 0.35, ...drums('k.......k...h...', 8) },
    ],
  },
  // After the reveal: bittersweet, with a lift at the end.
  end: {
    bpm: 84, loop: true,
    ch: [
      { type: 'pulse25', vol: 0.14, ...parseSeq('E5:8 A5:4 B5:4 | C6:8 B5:4 A5:4 | G5:8 E5:4 G5:4 | A5:12 -:4 | E5:8 A5:4 B5:4 | C6:6 D6:2 E6:4 C6:4 | B5:4 A5:4 G#5:4 B5:4 | A5:16') },
      { type: 'tri', vol: 0.3, ...arp(bars(['Am', 'Fl', 'Cl', 'Am', 'Am', 'Fl', 'E7', 'Am']), [0, 1, 2, 3, 2, 1, 2, 1]) },
      { type: 'drum', vol: 0.2, ...drums('k...............', 8) },
    ],
  },
  // The reveal: a minor arpeggio that opens into major.
  fanfare: {
    bpm: 120, loop: false,
    ch: [
      { type: 'pulse25', vol: 0.17, ...parseSeq('A4:2 C5:2 E5:2 A5:2 C6:2 E6:2 C#6:4 E6:12') },
      { type: 'pulse12', vol: 0.08, ...parseSeq('E4:4 A4:4 C5:4 E5:4 E5:12') },
      { type: 'tri', vol: 0.32, ...parseSeq('A2:8 F2:4 E2:4 A2:12') },
    ],
  },
};
for (const s of Object.values(SONGS)) {
  s.len = Math.max(...s.ch.map(c => c.len));
  for (const c of s.ch) { c.at = new Map(); for (const e of c.ev) c.at.set(e.at, e); }
}

// ---------------------------------------------------------------- engine
let ac = null, master, musicBus, sfxBus, noise, waves = {};
let muted = false, cur = null, want = null;
try { muted = localStorage.getItem('oddpaq-mute') === '1'; } catch (e) { /* storage blocked */ }

function pulseWave(d) {
  const N = 48, re = new Float32Array(N), im = new Float32Array(N);
  for (let n = 1; n < N; n++) { re[n] = Math.sin(2 * Math.PI * n * d) / (n * Math.PI); im[n] = (1 - Math.cos(2 * Math.PI * n * d)) / (n * Math.PI); }
  return ac.createPeriodicWave(re, im);
}

// iOS mutes Web Audio on the silent switch unless the page's audio session is
// 'playback'. Claim it only while sound is running; hand it back ('auto') when
// suspended so other apps can play. Browsers without the API (Android) skip this.
function setSession(t) { try { const s = navigator.audioSession; if (s && s.type !== t) s.type = t; } catch (e) { /* not supported */ } }

// Run the context only while the page is on screen and sound is on. Android keeps
// Web Audio going in a backgrounded tab (where it stutters), and iOS marks it
// 'interrupted' when you leave Safari, so: suspend when hidden, resume when back.
// Every suspend/resume is allowed to fail quietly; the next tap tries again.
let away = false;
function sync() {
  if (!ac || ac.state === 'closed') return;
  if (muted || away || document.visibilityState === 'hidden') {
    if (ac.state === 'running') ac.suspend().catch(() => {});
    setSession('auto');
  } else {
    setSession('playback');
    if (ac.state !== 'running') ac.resume().catch(() => {});
  }
}
if (typeof document !== 'undefined') { // (the tests load this file without a page)
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { away = true; sync(); });
  window.addEventListener('pageshow', () => { away = false; sync(); });
  document.addEventListener('freeze', () => { away = true; sync(); });
  document.addEventListener('resume', () => { away = false; sync(); });
}

// Called on every tap and key press: builds the context the first time, and
// wakes it up again after the phone has paused it.
export function unlock() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!muted) setSession('playback');
    try { ac = new AC(); } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.6; master.connect(ac.destination);
    musicBus = ac.createGain(); musicBus.gain.value = 0.7; musicBus.connect(master);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
    waves = { pulse12: pulseWave(0.125), pulse25: pulseWave(0.25), pulse50: pulseWave(0.5) };
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // A silent blip inside the gesture fully wakes iOS audio.
    const s = ac.createBufferSource(); s.buffer = ac.createBuffer(1, 1, 22050); s.connect(ac.destination); s.start(0);
    setInterval(tick, 30);
    ac.onstatechange = () => { if (ac.state !== 'running') retry = 0; };
  }
  away = false;
  sync();
  if (want && !cur) { const w = want; want = null; music(w); }
}
let retry = 0;
export function isMuted() { return muted; }
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('oddpaq-mute', muted ? '1' : '0'); } catch (e) { /* storage blocked */ }
  if (master) master.gain.setTargetAtTime(muted ? 0 : 0.6, ac.currentTime, 0.02);
  sync();
  return muted;
}

const hz = m => 440 * Math.pow(2, (m - 69) / 12);

function tone(type, m, t, dur, vol, dest) {
  const o = ac.createOscillator(), g = ac.createGain();
  if (type === 'tri') o.type = 'triangle'; else if (type === 'sine') o.type = 'sine'; else o.setPeriodicWave(waves[type] || waves.pulse50);
  o.frequency.value = hz(m);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.006);
  if (type !== 'tri') g.gain.setTargetAtTime(vol * 0.55, t + 0.02, 0.12);
  g.gain.setTargetAtTime(0, t + Math.max(0.02, dur - 0.03), 0.012);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + 0.1);
}
function drum(kind, t, vol, dest) {
  if (kind === 'k') {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(vol * 1.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.2);
    return;
  }
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noise;
  const len = kind === 's' ? 0.12 : 0.035;
  f.type = kind === 's' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 's' ? 1800 : 7000;
  g.gain.setValueAtTime(vol * (kind === 's' ? 0.9 : 0.35), t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  s.connect(f); f.connect(g); g.connect(dest);
  s.start(t, Math.random() * 0.5); s.stop(t + len + 0.02);
}

function tick() {
  // If the phone paused us while we're on screen, keep trying to come back (about
  // once a second). Where a tap is needed, unlock() on the next tap does it.
  if (ac.state !== 'running') {
    if (!muted && !away && document.visibilityState === 'visible' && (retry++ % 33) === 0) ac.resume().catch(() => {});
    return;
  }
  if (!cur) return;
  const song = cur.song;
  if (cur.next < ac.currentTime - 0.1) cur.next = ac.currentTime + 0.05; // resumed after a pause
  while (cur && cur.next < ac.currentTime + 0.15) {
    const step = song.loop ? cur.step % song.len : cur.step;
    for (const c of song.ch) {
      const e = c.at.get(song.loop ? step % c.len : step);
      if (!e) continue;
      if (c.type === 'drum') drum(e.drum, cur.next, c.vol, cur.gain);
      else tone(c.type, e.midi, cur.next, e.len * cur.sd, c.vol, cur.gain);
    }
    cur.step++; cur.next += cur.sd;
    if (!song.loop && cur.step >= song.len) cur = null;
  }
}

export function music(name) {
  if (cur && cur.name === name) return;
  stopMusic();
  if (!name) return;
  if (!ac) { want = name; return; }
  const g = ac.createGain(); g.connect(musicBus);
  const song = SONGS[name];
  cur = { name, song, step: 0, next: ac.currentTime + 0.05, sd: 60 / song.bpm / 4, gain: g };
}
export function stopMusic() {
  want = null;
  if (!cur) return;
  const g = cur.gain; cur = null;
  g.gain.setTargetAtTime(0, ac.currentTime, 0.04);
  setTimeout(() => g.disconnect(), 400);
}

// ---------------------------------------------------------------- effects
export function blip(low) {
  if (!ac || muted) return;
  tone('pulse50', low ? 52 : 76, ac.currentTime, 0.03, 0.06, sfxBus);
}
export function sfx(name) {
  if (!ac || muted) return;
  const t = ac.currentTime;
  const seq = (notes, d, type = 'pulse25', v = 0.12) => notes.forEach((n, i) => tone(type, midi(n), t + i * d, d * 1.1, v, sfxBus));
  switch (name) {
    case 'select': seq(['E6', 'B6'], 0.05); break;
    case 'move': tone('pulse50', midi('A5'), t, 0.03, 0.06, sfxBus); break;
    case 'bump': tone('pulse50', 40, t, 0.07, 0.1, sfxBus); break;
    case 'door': seq(['G4', 'E4', 'C4'], 0.06, 'pulse50', 0.1); break;
    case 'start': seq(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.045); break;
    case 'twinkle': seq(['E7', 'B6'], 0.03, 'pulse12', 0.05); break;
    case 'sparkle': seq(['C6', 'E6', 'G6', 'B6', 'D7', 'G7'], 0.04, 'pulse12', 0.08); break;
    case 'swish': {
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noise;
      f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(3500, t + 0.12);
      g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + 0.2);
      break;
    }
    case 'twang': {
      const o = ac.createOscillator(), g = ac.createGain(); o.setPeriodicWave(waves.pulse25);
      o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(180, t + 0.12);
      g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.16);
      break;
    }
    case 'zap': {
      const o = ac.createOscillator(), g = ac.createGain(); o.setPeriodicWave(waves.pulse12);
      o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(1400, t + 0.15);
      g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.22);
      break;
    }
    case 'strum': seq(['D4', 'F4', 'A4', 'D5', 'F5'], 0.025, 'tri', 0.22); break;
    case 'hit': {
      tone('pulse50', 45, t, 0.06, 0.12, sfxBus);
      const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = noise;
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      s.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + 0.1);
      break;
    }
    case 'fizzle': seq(['G5', 'D5', 'G4'], 0.05, 'pulse12', 0.06); break;
    case 'poof': {
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noise;
      f.type = 'lowpass'; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(300, t + 0.3);
      g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + 0.4);
      seq(['C6', 'G5'], 0.06, 'pulse12', 0.05);
      break;
    }
    case 'plop': tone('tri', midi('C5'), t, 0.08, 0.2, sfxBus); tone('tri', midi('G4'), t + 0.05, 0.08, 0.16, sfxBus); break;
    case 'splash': case 'sizzle': {
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), d = name === 'splash' ? 0.35 : 0.7;
      s.buffer = noise; f.type = name === 'splash' ? 'lowpass' : 'highpass';
      if (name === 'splash') { f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(400, t + d); } else f.frequency.value = 4000;
      g.gain.setValueAtTime(name === 'splash' ? 0.5 : 0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + d + 0.05);
      break;
    }
    case 'evil': seq(['A4', 'G#4', 'D#4', 'D4', 'A3'], 0.14, 'pulse25', 0.12); break;
    case 'item': seq(['G4', 'C5', 'E5', 'G5', 'C6', 'E6'], 0.07, 'pulse25', 0.12); break;
    case 'flash': {
      seq(['C4', 'G4', 'C5', 'E5', 'G5', 'C6'], 0.025, 'pulse25', 0.12);
      const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = noise;
      g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      s.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + 0.9);
      break;
    }
  }
}
// Wind: filtered noise that swells over `dur` seconds.
export function wind(dur = 3) {
  if (!ac || muted) return;
  const t = ac.currentTime;
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noise; s.loop = true;
  f.type = 'bandpass'; f.Q.value = 3;
  f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1600, t + dur * 0.6); f.frequency.exponentialRampToValueAtTime(700, t + dur);
  g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.5, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.4);
  s.connect(f); f.connect(g); g.connect(sfxBus);
  s.start(t); s.stop(t + dur + 0.5);
}

// for tests: the current state of the sound engine
export const audioState = () => (ac ? ac.state : 'none');
export const audioCtx = () => ac;
