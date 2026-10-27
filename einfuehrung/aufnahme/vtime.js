// Virtuelle Zeit: Timer, requestAnimationFrame, Date und CSS-Animationen laufen nur,
// wenn der Recorder window.__advance(ms) aufruft. So entsteht jedes Bild exakt.
(() => {
  const START = new Date('2026-10-27T09:12:00').getTime();
  let vt = 0;
  let nextId = 1;
  const timers = new Map();
  const rafs = new Map();
  const RD = Date;

  window.setTimeout = (fn, ms = 0, ...a) => {
    const id = nextId++;
    timers.set(id, { t: vt + Math.max(0, Number(ms) || 0), fn, a });
    return id;
  };
  window.setInterval = (fn, ms = 0, ...a) => {
    const id = nextId++;
    const iv = Math.max(1, Number(ms) || 0);
    timers.set(id, { t: vt + iv, fn, a, iv });
    return id;
  };
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id);
  window.requestAnimationFrame = (fn) => {
    const id = nextId++;
    rafs.set(id, fn);
    return id;
  };
  window.cancelAnimationFrame = (id) => rafs.delete(id);
  window.requestIdleCallback = (fn) => window.setTimeout(() => fn({ didTimeout: false, timeRemaining: () => 10 }), 1);
  window.cancelIdleCallback = (id) => timers.delete(id);
  performance.now = () => vt;

  class VDate extends RD {
    constructor(...a) {
      if (a.length) super(...a);
      else super(START + vt);
    }
    static now() {
      return START + vt;
    }
  }
  VDate.parse = RD.parse;
  VDate.UTC = RD.UTC;
  window.Date = VDate;

  const animStart = new Map();
  function syncAnimations() {
    for (const a of document.getAnimations()) {
      if (!animStart.has(a)) {
        animStart.set(a, vt - (Number(a.currentTime) || 0));
        a.pause();
      }
      const t = vt - animStart.get(a);
      const timing = a.effect && a.effect.getComputedTiming();
      const end = timing ? timing.endTime : Infinity;
      if (Number.isFinite(end) && t >= end) {
        a.finish();
        animStart.delete(a);
      } else {
        a.currentTime = t;
      }
    }
  }

  window.__advance = (ms) => {
    const end = vt + ms;
    for (let guard = 0; guard < 10000; guard++) {
      let best = null;
      for (const [id, tm] of timers) if (tm.t <= end && (!best || tm.t < best[1].t)) best = [id, tm];
      if (!best) break;
      const [id, tm] = best;
      vt = Math.max(vt, tm.t);
      if (tm.iv) tm.t += tm.iv;
      else timers.delete(id);
      try {
        typeof tm.fn === 'function' ? tm.fn(...tm.a) : 0;
      } catch (e) {
        console.error(e);
      }
    }
    vt = end;
    const list = [...rafs.values()];
    rafs.clear();
    for (const fn of list) {
      try {
        fn(vt);
      } catch (e) {
        console.error(e);
      }
    }
    syncAnimations();
    return vt;
  };

  // Großer, ruhiger Mauszeiger wie in Apple-Produktvideos
  const install = () => {
    const c = document.createElement('div');
    c.id = '__cur';
    c.innerHTML =
      '<svg width="30" height="38" viewBox="0 0 30 38"><path d="M3 2 L3 30 L10 23.5 L14.6 34 L19.2 32 L14.7 21.8 L24 21.8 Z" fill="#111" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg>';
    c.style.cssText =
      'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.28));transform-origin:3px 2px;will-change:transform;opacity:0';
    document.documentElement.appendChild(c);
    let x = -100, y = -100, s = 1;
    const apply = () => (c.style.transform = `translate(${x - 3}px, ${y - 2}px) scale(${s})`);
    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; c.style.opacity = '1'; apply(); }, true);
    window.__cursorScale = (v) => { s = v; apply(); };
    window.__cursorHide = (h) => (c.style.opacity = h ? '0' : '1');
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
