// Baut das Einführungsvideo aus Bildschirmaufnahmen (assets/clips), Sprecher (assets/voice)
// und Musik (assets/music): node build.mjs
// Erzeugt index.html, compositions/*.html und assets/clips/final/*.mp4.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const W = 1920;
const H = 1080;
const LEAD = 0.4; // Sprecher setzt so viel nach dem Bildanker ein
const TAIL = 0.8; // Ruhe nach dem letzten Wort
const XFADE = 0.4; // Überblendung zwischen zwei Szenen ohne Kapitelkarte
const CARD = 2.2;

const C = {
  ground: '#ebe7df',
  ink: '#23211e',
  muted: '#7a746c',
  gold: '#8a6a3a',
};

// ---------- Inhalte ----------

const texts = Object.fromEntries(JSON.parse(fs.readFileSync('sprechertext.json', 'utf8')).map((s) => [s.id, s]));

// Kamera: [zeit, zoom, mitteX, mitteY, dauer]. Zeit als Zahl (Sekunden in der Szene),
// 'w:Wort' (wenn der Sprecher das Wort sagt) oder 'm:marke' (Aktion in der Aufnahme).
const FULL = [1, 960, 540];
const MAIL = [1.75, 505, 560];
const CENTER = [1.4, 980, 520];
const AGENT = [1.6, 980, 860];
const RIGHT = [1.75, 1420, 540];
const HEADER = [2.1, 980, 150];
const MODAL = [1.22, 960, 540];

const scenes = [
  { type: 'card', id: 'k-start', title: 'Kontrollzentrum', sub: 'Deine Einführung', logo: true, dur: 3.2 },
  { id: 's01', clip: 'c01', vStart: 0.9, cam: [[0, 0.8, 960, 540], [1.2, 0.8, 960, 540], [3.0, ...FULL, 5.5]] },
  {
    id: 's02', clip: 'c02', vStart: 0.4,
    cam: [[0, ...FULL], ['w:Links', ...MAIL, 1.1], ['w:Mitte', ...CENTER, 1.2], ['w:darunter', ...AGENT, 1.0], ['w:Rechts', ...RIGHT, 1.2], ['w:Nah', ...FULL, 1.6]],
  },
  {
    id: 's03', clip: 'c03', anchor: ['event-open', 'Ein', 7],
    cam: [[0, ...FULL], [0.6, ...HEADER, 1.4], ['m:event-open', ...MODAL, 1.0], [-1.6, ...FULL, 1.2]],
  },
  { type: 'card', id: 'k-anmelden', title: 'Anmelden', sub: 'Ein Konto für alles.' },
  { id: 's04', clip: 'c04', vStart: 0.4, cam: [[0, 2.1, 960, 540], [0.1, 2.5, 960, 540, 6.8]] },
  { type: 'card', id: 'k-mail', title: 'E-Mails', sub: 'Sortiert, zusammengefasst, beantwortet.' },
  {
    id: 's05', clip: 'c05', anchor: ['filter', 'Filtern'],
    cam: [[0, ...FULL], [0.3, ...MAIL, 1.4], ['m:postfach', 2.2, 505, 260, 1.0], [-1.8, ...MAIL, 1.0]],
  },
  {
    id: 's06', clip: 'c06', vStart: 2.0,
    cam: [[0, ...MAIL], ['m:open', ...FULL, 0.8], [3.0, 1.35, 960, 520, 1.4], ['m:claim', 2.0, 960, 250, 1.0]],
  },
  {
    id: 's07', clip: 'c07', anchor: ['send1', 'Senden'],
    cam: [[0, 2.0, 960, 250], [0.2, 1.6, 960, 470, 1.0], ['m:edit', 1.7, 960, 720, 1.2], ['m:send1', 1.9, 1150, 880, 1.0], ['m:send2', ...FULL, 1.2]],
  },
  { type: 'card', id: 'k-kalender', title: 'Kalender', sub: 'Deine Termine im Blick.' },
  {
    id: 's08', clip: 'c08', anchor: ['woche', 'Woche'],
    cam: [[0, ...FULL], [0.2, 1.8, 1420, 470, 1.4], ['m:event', ...MODAL, 1.0], [-1.4, ...FULL, 1.0]],
  },
  { type: 'card', id: 'k-aufgaben', title: 'Aufgaben', sub: 'Alles Offene auf einen Blick.' },
  {
    id: 's09', clip: 'c09', anchor: ['liste', 'Klick'],
    cam: [[0, ...FULL], [0.2, ...CENTER, 1.6], ['m:liste', ...MODAL, 1.0], [-1.2, ...FULL, 1.0]],
  },
  { type: 'card', id: 'k-ordner', title: 'Ordner', sub: 'Jede Datei in Sekunden.' },
  {
    id: 's10', clip: 'c10', anchor: ['suche', 'Tipp'],
    cam: [[0, ...FULL], [0.2, 1.9, 1420, 300, 1.4], ['m:ordner', ...MODAL, 1.0], [-1.2, ...FULL, 1.0]],
  },
  { type: 'card', id: 'k-claude', title: 'Claude', sub: 'Dein Assistent im Büro.' },
  {
    id: 's11', clip: 'c11', anchor: ['ask', 'Claude', 3.4],
    cam: [[0, ...FULL], [0.2, 1.7, 980, 900, 1.4], ['m:ask', 1.45, 980, 700, 1.4]],
  },
  {
    id: 's12', clip: 'c12', vStart: 4.0,
    cam: [[0, 1.45, 980, 700], ['m:ask', 1.35, 1010, 620, 1.4], [-4.0, 1.7, 1250, 760, 1.2], [-1.3, ...FULL, 1.0]],
  },
  {
    id: 's13', clip: 'c13', anchor: ['orbit', 'Symbole'],
    cam: [[0, ...FULL], [0.2, 1.9, 980, 900, 1.2], ['m:orbit', 1.3, 980, 520, 1.2]],
  },
  { type: 'card', id: 'k-routinen', title: 'Routinen', sub: 'Arbeit, die von selbst passiert.' },
  {
    id: 's14', clip: 'c14', anchor: ['open', 'Routinen', 0],
    cam: [[0, ...FULL], [0.2, 2.2, 1150, 150, 1.0], ['m:open', 1.25, 960, 430, 1.0], [6.2, 1.25, 960, 640, 1.4], [-1.0, ...FULL, 0.9]],
  },
  { type: 'card', id: 'k-tipps', title: 'Gut zu wissen', sub: 'Kleine Helfer für jeden Tag.' },
  {
    id: 's15', clip: 'c15', anchor: ['dunkel', 'dunklem'],
    cam: [[0, ...FULL], [0.2, 2.3, 1150, 140, 1.2], ['m:dunkel', ...FULL, 1.0], ['m:hinweise', 2.3, 1150, 140, 1.0], ['m:kuerzel', ...MODAL, 1.0], [-1.0, ...FULL, 0.9]],
  },
  { id: 's16', clip: 'c16', vStart: 0.5, cam: [[0, ...FULL], [0.6, 0.8, 960, 540, 3.2]] },
  { type: 'card', id: 'k-ende', title: 'Willkommen im Team.', sub: 'KMS Kontrollzentrum', logo: true, dur: 4.2 },
];

// ---------- Hilfen ----------

const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const norm = (s) => s.toLowerCase().replace(/[«»„“"',.!?:;]/g, '');
const r3 = (n) => Math.round(n * 1000) / 1000;

function wordTime(words, w) {
  const hit = words.find((x) => norm(x.text).startsWith(norm(w)));
  if (!hit) throw new Error(`Wort nicht gefunden: ${w}`);
  return hit.start;
}

// Kamera in Transform umrechnen; Ränder der Aufnahme bleiben immer außerhalb des Bildes
function camState(s, cx, cy) {
  let x, y;
  if (s < 1) {
    x = (W - W * s) / 2;
    y = (H - H * s) / 2;
  } else {
    x = Math.min(0, Math.max(W - W * s, W / 2 - cx * s));
    y = Math.min(0, Math.max(H - H * s, H / 2 - cy * s));
  }
  return { x: r3(x), y: r3(y), scale: s, borderRadius: s < 0.999 ? 22 : 0 };
}

// ---------- Planung ----------

fs.mkdirSync('compositions', { recursive: true });
fs.mkdirSync('assets/clips/final', { recursive: true });

let t = 0;
let track = 0;
const plan = [];
let prev = null;
for (const sc of scenes) {
  if (sc.type === 'card') {
    const d = sc.dur ?? CARD;
    plan.push({ ...sc, start: r3(t), dur: d, track: (track++ % 2) + 1 });
    t += d;
    prev = sc;
    continue;
  }
  const voiceFile = `assets/voice/${sc.id}.mp3`;
  const words = JSON.parse(fs.readFileSync(`assets/voice/${sc.id}.words.json`, 'utf8'));
  const marks = JSON.parse(fs.readFileSync(`assets/clips/${sc.clip}.marks.json`, 'utf8')).marks;
  const markT = (m) => {
    const hit = marks.find((x) => x.label === m);
    if (!hit) throw new Error(`Marke fehlt: ${sc.clip} ${m}`);
    return hit.t;
  };
  const vDur = dur(voiceFile);
  const cDur = dur(`assets/clips/${sc.clip}.mp4`);
  let delay = 0;
  let vStart = sc.vStart ?? LEAD;
  if (sc.anchor) {
    const [m, w, wordOffset] = sc.anchor;
    const wt = wordOffset ?? wordTime(words, w);
    const d = LEAD + wt - markT(m);
    if (d >= 0) delay = d;
    else vStart = markT(m) - wt;
  }
  const sceneDur = r3(Math.max(delay + cDur, vStart + vDur + TAIL));
  const overlap = prev && prev.type !== 'card' ? XFADE : 0;
  const start = r3(t - overlap);
  const at = (v) => {
    if (typeof v === 'number') return v < 0 ? sceneDur + v : v;
    if (v.startsWith('w:')) return vStart + wordTime(words, v.slice(2));
    if (v.startsWith('m:')) return delay + markT(v.slice(2));
    throw new Error(v);
  };
  const cam = sc.cam.map(([time, s, cx, cy, d]) => ({ t: r3(at(time)), s, cx, cy, d: d ?? 1.2 }));
  plan.push({
    ...sc, start, dur: sceneDur, delay: r3(delay), vStart: r3(start + vStart), vDur: r3(vDur), cam,
    track: (track++ % 2) + 1, fadeIn: prev?.type === 'card' ? 'card' : prev ? 'xfade' : 'none',
  });
  t = start + sceneDur;
  prev = sc;
}
// Ausgang zur Kapitelkarte markieren
for (let i = 0; i < plan.length - 1; i++) if (plan[i].type !== 'card' && plan[i + 1].type === 'card') plan[i].fadeOut = true;
const total = r3(t);

// ---------- Aufnahmen mit Vorlauf/Nachlauf ----------

for (const p of plan.filter((p) => p.clip)) {
  const out = `assets/clips/final/${p.id}.mp4`;
  const meta = `${out}.json`;
  const want = JSON.stringify({ src: p.clip, delay: p.delay, mtime: fs.statSync(`assets/clips/${p.clip}.mp4`).mtimeMs });
  if (fs.existsSync(out) && fs.existsSync(meta) && fs.readFileSync(meta, 'utf8') === want) continue;
  execFileSync('ffmpeg', [
    '-loglevel', 'error', '-y', '-i', `assets/clips/${p.clip}.mp4`,
    '-vf', `tpad=start_mode=clone:start_duration=${p.delay}:stop_mode=clone:stop_duration=6`,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out,
  ]);
  fs.writeFileSync(meta, want);
}

// ---------- Szenen schreiben ----------

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function sceneHtml(p) {
  const tw = [];
  const first = camState(p.cam[0].s, p.cam[0].cx, p.cam[0].cy);
  tw.push(`tl.set('#${p.id}-cam', ${JSON.stringify(first)}, 0);`);
  for (const k of p.cam.slice(1)) {
    tw.push(`tl.to('#${p.id}-cam', { ...${JSON.stringify(camState(k.s, k.cx, k.cy))}, duration: ${k.d}, ease: 'power2.inOut' }, ${k.t});`);
  }
  if (p.fadeIn === 'card') {
    tw.push(`tl.fromTo('#${p.id}-fade', { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'expo.out' }, 0);`);
  } else if (p.fadeIn === 'xfade') {
    tw.push(`tl.fromTo('#${p.id}-fade', { opacity: 0 }, { opacity: 1, duration: ${XFADE}, ease: 'power1.inOut' }, 0);`);
  }
  if (p.fadeOut) {
    tw.push(`tl.to('#${p.id}-fade', { opacity: 0, filter: 'blur(8px)', duration: 0.32, ease: 'power3.in' }, ${r3(p.dur - 0.34)});`);
  }
  return `<template>
  <style>
    #root { position: absolute; inset: 0; background: ${C.ground}; overflow: hidden; }
    #${p.id}-fade { position: absolute; inset: 0; }
    #${p.id}-cam {
      position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px;
      transform-origin: 0 0; overflow: hidden; background: #f3f1ec;
      box-shadow: 0 30px 80px rgba(40, 32, 20, 0.18), 0 6px 18px rgba(40, 32, 20, 0.10);
    }
    #${p.id}-video { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; object-fit: cover; }
  </style>
  <div id="root" data-composition-id="${p.id}" data-width="${W}" data-height="${H}">
    <div id="${p.id}-fade">
      <div id="${p.id}-cam">
        <video id="${p.id}-video" class="clip" data-start="0" data-duration="${p.dur}" data-track-index="0" muted playsinline src="assets/clips/final/${p.id}.mp4"></video>
      </div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${tw.join('\n    ')}
    window.__timelines["${p.id}"] = tl;
  </script>
</template>
`;
}

function cardHtml(p) {
  const words = p.title.split(' ');
  const titleSpans = words.map((w, i) => `<span class="w" id="${p.id}-w${i}">${esc(w)}</span>`).join(' ');
  const tw = [];
  const t0 = p.logo ? 0.45 : 0.2;
  if (p.logo) {
    tw.push(`tl.fromTo('#${p.id}-logo', { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out' }, 0.1);`);
  }
  words.forEach((_, i) => {
    tw.push(`tl.fromTo('#${p.id}-w${i}', { opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.16, ease: 'power4.out' }, ${r3(t0 + i * 0.08)});`);
  });
  tw.push(`tl.fromTo('#${p.id}-sub', { color: '${C.ground}' }, { color: '${C.muted}', duration: 0.5, ease: 'power2.out' }, ${r3(t0 + words.length * 0.08 + 0.15)});`);
  if (p.id !== 'k-ende') {
    tw.push(`tl.to('#${p.id}-box', { opacity: 0, filter: 'blur(8px)', duration: 0.22, ease: 'power3.in' }, ${r3(p.dur - 0.26)});`);
  }
  const centered = p.logo;
  return `<template>
  <style>
    #root { position: absolute; inset: 0; background: ${C.ground}; overflow: hidden; font-family: 'Outfit', sans-serif; }
    #${p.id}-box {
      position: absolute; ${centered ? 'left: 0; right: 0; top: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;' : `left: 240px; right: 240px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center;`}
    }
    #${p.id}-logo { width: 260px; height: auto; margin-bottom: 40px; }
    #${p.id}-title { color: ${C.ink}; font-size: ${centered ? 92 : 112}px; font-weight: 600; letter-spacing: -0.025em; line-height: 1.05; margin: 0; }
    #${p.id}-sub { color: ${C.muted}; font-size: 36px; font-weight: 400; margin: 22px 0 0; letter-spacing: 0; }
    .w { display: inline-block; }
  </style>
  <div id="root" data-composition-id="${p.id}" data-width="${W}" data-height="${H}">
    <div id="${p.id}-box">
      ${p.logo ? `<img id="${p.id}-logo" src="assets/kms-logo.svg" alt="KMS" />` : ''}
      <h1 id="${p.id}-title">${titleSpans}</h1>
      <p id="${p.id}-sub">${esc(p.sub)}</p>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${tw.join('\n    ')}
    window.__timelines["${p.id}"] = tl;
  </script>
</template>
`;
}

for (const p of plan) fs.writeFileSync(`compositions/${p.id}.html`, p.type === 'card' ? cardHtml(p) : sceneHtml(p));

// ---------- Musik leiser, solange gesprochen wird ----------

const BED = 0.5;
const DUCK = 0.16;
const points = [{ t: 0, v: BED }];
for (const p of plan.filter((p) => p.vStart != null)) {
  points.push({ t: r3(Math.max(0, p.vStart - 0.35)), v: BED }, { t: r3(p.vStart), v: DUCK });
  points.push({ t: r3(p.vStart + p.vDur), v: DUCK }, { t: r3(p.vStart + p.vDur + 0.6), v: BED });
}
points.sort((a, b) => a.t - b.t);
const automation = JSON.stringify({ version: 1, lanes: [{ target: 'volume', points }] }).replace(/"/g, '&quot;');

// ---------- Hauptkomposition ----------

const hosts = plan
  .map((p, i) => `      <div id="${p.id}" data-composition-id="${p.id}" data-composition-src="compositions/${p.id}.html" data-start="${p.start}" data-duration="${p.dur}" data-track-index="${p.track}" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:${i + 1}"></div>`)
  .join('\n');
const voices = plan
  .filter((p) => p.vStart != null)
  .map((p) => `      <audio id="vo-${p.id}" class="clip" data-start="${p.vStart}" data-duration="${p.vDur}" data-track-index="10" data-volume="1" src="assets/voice/${p.id}.mp3"></audio>`)
  .join('\n');

const index = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.ground}; }
      #root { position: relative; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}">
${hosts}
${voices}
      <audio id="musik" class="clip" data-start="0" data-duration="${total}" data-track-index="11" data-volume="1" data-fade-in="1.5" data-fade-out="3.5" data-playback-rate="${r3(Math.min(1, dur('assets/music/musik.mp3') / (total + 0.2)))}" data-automation="${automation}" src="assets/music/musik.mp3"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync('index.html', index);

console.log(`Länge ${total.toFixed(1)} s`);
for (const p of plan) console.log(`${p.id.padEnd(12)} ${String(p.start).padStart(7)} +${p.dur}${p.delay ? `  Vorlauf ${p.delay}` : ''}${p.vStart != null ? `  Sprecher ab ${p.vStart}` : ''}`);
