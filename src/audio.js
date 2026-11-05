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
  field: {
    bpm: 132, loop: true,
    ch: [
      { type: 'pulse25', vol: 0.14, ...parseSeq(
        'F#5:2 A5:2 D6:4 A5:2 F#5:2 G5:2 A5:2 | B5:4 A5:2 G5:2 D5:4 -:2 G5:2 | F#5:2 E5:2 D5:2 E5:2 F#5:4 A5:4 | E5:8 C#5:4 -:4 |' +
        'F#5:2 A5:2 D6:4 C#6:2 B5:2 A5:4 | B5:2 C#6:2 D6:4 B5:4 G5:4 | A5:4 G5:2 F#5:2 E5:4 C#5:4 | D5:8 -:8 |' +
        'D5:4 F#5:4 B5:6 A5:2 | G5:4 F#5:2 E5:2 D5:4 B4:4 | E5:4 G5:4 B5:4 A5:2 G5:2 | F#5:4 E5:4 A4:8 |' +
        'D5:4 F#5:4 B5:4 D6:4 | D6:4 B5:4 G5:4 B5:4 | A5:4 C#6:4 E6:4 C#6:4 | A5:12 -:4') },
      { type: 'pulse50', vol: 0.05, ...arp(bars(['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D', 'Bm', 'G', 'Em', 'A', 'Bm', 'G', 'A', 'A']).map(([t, s]) => [t.map(n => n.replace(/\d/, d => +d + 2)), s]), [3, 2, 1, 2], 4) },
      { type: 'tri', vol: 0.34, ...arp(bars(['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D', 'Bm', 'G', 'Em', 'A', 'Bm', 'G', 'A', 'A']), [0, 2, 1, 2, 0, 2, 1, 3]) },
      { type: 'drum', vol: 0.5, ...drums('k.h.s.h.k.h.s.hh', 16) },
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
  end: {
    bpm: 100, loop: true,
    ch: [
      { type: 'pulse25', vol: 0.15, ...parseSeq('E5:4 G5:4 C6:6 B5:2 | A5:4 E5:4 C5:8 | F5:4 A5:4 C6:4 A5:4 | G5:8 D5:8 | E5:4 G5:4 C6:4 E6:4 | D6:4 C6:4 A5:8 | F5:4 A5:4 B5:4 D6:4 | C6:12 -:4') },
      { type: 'tri', vol: 0.32, ...arp([[T.C, 16], [T.Am, 16], [T.F, 16], [T.G, 16], [T.C, 16], [T.Am, 16], [T.F, 8], [T.G, 8], [T.C, 16]], [0, 1, 2, 3, 2, 1, 2, 1]) },
      { type: 'drum', vol: 0.3, ...drums('k...h...s...h...', 8) },
    ],
  },
  fanfare: {
    bpm: 140, loop: false,
    ch: [
      { type: 'pulse25', vol: 0.18, ...parseSeq('C5:2 E5:2 G5:2 C6:4 B5:2 C6:2 D6:2 E6:12') },
      { type: 'pulse50', vol: 0.08, ...parseSeq('G4:2 C5:2 E5:2 G5:4 G5:2 A5:2 B5:2 C6:12') },
      { type: 'tri', vol: 0.34, ...parseSeq('C3:8 G2:4 C3:4 C3:12') },
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

export function unlock() {
  if (!ac) {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
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
  }
  if (ac.state === 'suspended') ac.resume();
  if (want && !cur) { const w = want; want = null; music(w); }
}

export function setPaused(p) { if (ac) p ? ac.suspend() : ac.resume(); }
export function isMuted() { return muted; }
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('oddpaq-mute', muted ? '1' : '0'); } catch (e) { /* storage blocked */ }
  if (master) master.gain.setTargetAtTime(muted ? 0 : 0.6, ac.currentTime, 0.02);
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
  if (!cur || ac.state !== 'running') return;
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
