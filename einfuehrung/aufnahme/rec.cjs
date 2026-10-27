// Recorder: steuert die virtuelle Zeit, bewegt den Mauszeiger weich und speichert jedes Bild.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FPS = 30;
const DT = 1000 / FPS;
const DIR = __dirname;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // easeInOutCubic

async function open({ dpr = 1.5, query = '' } = {}) {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--lang=de-DE'], env: { ...process.env, LANG: 'de_DE.UTF-8', LANGUAGE: 'de' } });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dpr, locale: 'de-DE', timezoneId: 'Europe/Berlin' });
  await ctx.addInitScript({ path: path.join(DIR, 'vtime.js') });
  await ctx.addInitScript({ path: path.join(DIR, 'mock.js') });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror', String(e)));
  const cdp = await ctx.newCDPSession(page);
  await page.goto('http://localhost:4173/' + query, { waitUntil: 'load' });

  const r = {
    page,
    browser,
    x: 1100,
    y: 700,
    out: null,
    n: 0,
    log: [],
    async clip(name) {
      this.out = path.join(DIR, 'clips', name);
      fs.rmSync(this.out, { recursive: true, force: true });
      fs.mkdirSync(this.out, { recursive: true });
      this.n = 0;
      this.log = [];
    },
    mark(label) {
      this.log.push({ label, t: +(this.n / FPS).toFixed(3) });
    },
    async tick(capture = true) {
      await page.evaluate((dt) => window.__advance(dt), DT);
      if (!capture || !this.out) return;
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, optimizeForSpeed: true });
      fs.writeFileSync(path.join(this.out, `f${String(this.n).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'));
      this.n++;
    },
    async warm(sec) {
      for (let i = 0; i < Math.round(sec * FPS); i++) await this.tick(false);
    },
    async wait(sec) {
      for (let i = 0; i < Math.round(sec * FPS); i++) await this.tick();
    },
    async pos(target) {
      if (typeof target !== 'string') return target;
      const box = await page.locator(target).first().boundingBox();
      if (!box) throw new Error('nicht gefunden: ' + target);
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    },
    async move(target, sec = 0.8, off = { x: 0, y: 0 }) {
      const p = await this.pos(target);
      const tx = p.x + (off.x || 0), ty = p.y + (off.y || 0);
      const fx = this.x, fy = this.y;
      const n = Math.max(1, Math.round(sec * FPS));
      for (let i = 1; i <= n; i++) {
        const k = ease(i / n);
        // leichter Bogen statt gerader Linie
        const arc = Math.sin(Math.PI * k) * Math.min(60, Math.hypot(tx - fx, ty - fy) * 0.08);
        this.x = fx + (tx - fx) * k;
        this.y = fy + (ty - fy) * k - arc;
        await page.mouse.move(this.x, this.y);
        await this.tick();
      }
    },
    async click(target, sec = 0.8) {
      if (target) await this.move(target, sec);
      await this.wait(0.12);
      for (const s of [0.94, 0.88]) { await page.evaluate((v) => window.__cursorScale(v), s); await this.tick(); }
      await page.mouse.down();
      await this.tick();
      await page.mouse.up();
      for (const s of [0.92, 0.97, 1]) { await page.evaluate((v) => window.__cursorScale(v), s); await this.tick(); }
    },
    async type(text, cps = 18) {
      const per = Math.max(1, Math.round(FPS / cps));
      for (const ch of text) {
        await page.keyboard.type(ch);
        for (let i = 0; i < per; i++) await this.tick();
      }
    },
    async key(k) {
      await page.keyboard.press(k);
      await this.tick();
    },
    async scroll(sel, dy, sec = 0.8) {
      const n = Math.round(sec * FPS);
      let done = 0;
      for (let i = 1; i <= n; i++) {
        const target = Math.round(dy * ease(i / n));
        await page.evaluate(([s, d]) => document.querySelector(s).scrollBy(0, d), [sel, target - done]);
        done = target;
        await this.tick();
      }
    },
    async done() {
      if (this.out) fs.writeFileSync(path.join(this.out, 'marks.json'), JSON.stringify({ frames: this.n, fps: FPS, marks: this.log }, null, 1));
    },
  };
  await page.mouse.move(r.x, r.y);
  return r;
}

module.exports = { open, FPS };
