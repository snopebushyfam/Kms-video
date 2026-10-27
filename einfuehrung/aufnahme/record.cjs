// Nimmt alle Szenen des Einführungsvideos auf (eine Sitzung, Zustand läuft durch).
const { open } = require('./rec.cjs');

const only = process.argv[2] ? process.argv[2].split(',') : null;
const want = (c) => !only || only.includes(c);

(async () => {
  if (want('c04')) {
    const r = await open({ query: '?login' });
    await r.warm(3);
    await r.clip('c04');
    await r.wait(7.5);
    await r.done();
    await r.browser.close();
  }

  const r = await open();
  const p = r.page;
  await r.warm(4);
  // Einzelne Szenen später neu aufnehmen: Zustand wie nach Szene 7 herstellen (ohne Aufnahme)
  if (only && !only.includes('c06') && !only.includes('c01')) {
    await p.click('[data-mail="m1"]'); await r.warm(1);
    await p.click('[data-action="send"]'); await r.warm(0.3);
    await p.click('[data-action="send"]'); await r.warm(4);
  }

  if (want('c01')) {
    await r.clip('c01');
    await r.wait(9);
    await r.done();
  }
  if (want('c02')) {
    await r.clip('c02');
    await r.wait(15.5);
    await r.done();
  }
  if (want('c03')) {
    await r.clip('c03');
    await r.move('[data-today^="event:"]', 1.2);
    await r.wait(0.8);
    await r.move('[data-today^="mail:"]', 0.7);
    await r.wait(0.6);
    await r.move('[data-today="routines"]', 0.7);
    await r.wait(0.8);
    await r.click('[data-today^="event:"]', 0.9);
    r.mark('event-open');
    await r.wait(2.6);
    await r.key('Escape');
    await r.wait(1.2);
    await r.done();
  }
  if (want('c05')) {
    await r.clip('c05');
    await r.move('[data-mail="m1"]', 1.1);
    r.mark('dringend');
    await r.wait(1.6);
    await r.move('[data-mail="m3"]', 0.8);
    r.mark('normal');
    await r.wait(1.6);
    await r.click('[data-cat="Schaden"]', 0.9);
    r.mark('filter');
    await r.wait(2.4);
    await r.click('[data-cat="Schaden"]', 0.3);
    await r.wait(1.2);
    await r.click('[data-mailbox="me"]', 1);
    r.mark('postfach');
    await r.wait(2.2);
    await r.click('[data-mailbox="info@kms-verwaltung.de"]', 0.7);
    await r.wait(2.4);
    await r.done();
  }
  if (want('c06')) {
    await r.clip('c06');
    await r.click('[data-mail="m1"]', 1.1);
    r.mark('open');
    await r.wait(1.2);
    await r.move('.modal__block--ai p', 0.9);
    await r.wait(1.6);
    await r.move('#reply', 0.8);
    await r.wait(1.6);
    await r.click('[data-action="claim"]', 1);
    r.mark('claim');
    await r.wait(2.6);
    await r.done();
  }
  if (want('c07')) {
    await r.clip('c07');
    await r.click('[data-action="appointment"]', 1);
    r.mark('appointment');
    await r.wait(2.4);
    // ans Ende der Antwort klicken und einen Satz ergänzen
    await r.move('#reply', 0.9);
    await p.evaluate(() => {
      const t = document.querySelector('#reply');
      const i = t.value.indexOf('\n\nMit freundlichen');
      t.focus();
      t.setSelectionRange(i, i);
    });
    await r.click(null);
    await p.evaluate(() => {
      const t = document.querySelector('#reply');
      const i = t.value.indexOf('\n\nMit freundlichen');
      t.setSelectionRange(i, i);
    });
    r.mark('edit');
    await r.type(' Wir melden uns heute Nachmittag noch einmal bei Ihnen.', 22);
    await r.wait(0.8);
    await r.click('[data-action="send"]', 1);
    r.mark('send1');
    await r.wait(1.4);
    await r.click('[data-action="send"]', 0.3);
    r.mark('send2');
    await r.wait(2.8);
    await r.done();
  }
  if (want('c08')) {
    await r.clip('c08');
    await r.move('#calendar .cal__item', 1.2);
    await r.wait(1.4);
    await r.click('[data-cal-view="woche"]', 1);
    r.mark('woche');
    await r.wait(2.2);
    await r.click('[data-event="e5"]', 1);
    r.mark('event');
    await r.wait(2.6);
    await r.key('Escape');
    await r.wait(0.6);
    await r.click('[data-cal-view="heute"]', 0.8);
    await r.wait(0.8);
    await r.done();
  }
  if (want('c09')) {
    await r.clip('c09');
    await r.move({ x: 960, y: 520 }, 1.2);
    await r.wait(2.4);
    r.mark('drag');
    await p.mouse.down();
    await r.move({ x: 1180, y: 540 }, 1.4);
    await r.move({ x: 1060, y: 530 }, 0.8);
    await p.mouse.up();
    await r.wait(1.6);
    await r.click('#task-count', 1.1);
    r.mark('liste');
    await r.wait(3.6);
    await r.key('Escape');
    await r.wait(0.8);
    await r.done();
  }
  if (want('c10')) {
    await r.clip('c10');
    await r.click('#folder-search', 1.2);
    r.mark('suche');
    await r.type('Gartenweg', 10);
    await r.wait(2.4);
    await p.fill('#folder-search', '');
    await p.dispatchEvent('#folder-search', 'input');
    await r.wait(0.6);
    await r.click('[data-root="objekte"]', 1);
    r.mark('ordner');
    await r.wait(1.2);
    await r.click('#modal-card [data-path="Gartenweg 22"]', 0.9);
    await r.wait(1);
    await r.click('#modal-card [data-path="Gartenweg 22/Übergabe WE 3"]', 0.9);
    await r.wait(2.2);
    await r.key('Escape');
    await r.wait(0.6);
    await r.done();
  }
  if (want('c11')) {
    await r.clip('c11');
    await r.click('#agent-input', 1.2);
    r.mark('input');
    await r.type('Was ist heute dringend?', 14);
    await r.wait(0.4);
    await r.key('Enter');
    r.mark('ask');
    await r.move({ x: 1300, y: 760 }, 1);
    await r.wait(7.5);
    await r.done();
  }
  if (want('c12')) {
    await r.clip('c12');
    await r.click('#agent-input', 0.9);
    await r.type('Ja, bitte antworte Frau Kröger.', 14);
    await r.key('Enter');
    r.mark('ask');
    await r.wait(4.8);
    await r.move('[data-card-action="draft"]', 1.1);
    await r.wait(1);
    await r.click(null);
    r.mark('saved');
    await r.wait(2.4);
    await r.click('[data-answer-close]', 1);
    await r.wait(0.8);
    await r.done();
  }
  if (want('c13')) {
    await r.clip('c13');
    await r.click('#agent-skills button:nth-child(3)', 1.2);
    r.mark('skill');
    await r.wait(2.2);
    await p.fill('#agent-input', '');
    await p.dispatchEvent('#agent-input', 'input');
    await r.wait(0.4);
    r.mark('orbit');
    for (const i of [0, 2, 3, 16]) {
      await r.move(`[data-orbit="${i}"]`, 0.9);
      await r.wait(1);
    }
    await r.done();
  }
  if (want('c14')) {
    await r.clip('c14');
    await r.click('[data-routines]', 1.2);
    r.mark('open');
    await r.wait(3.5);
    await r.scroll('#modal-card', 380, 1.2);
    await r.wait(3);
    await r.key('Escape');
    await r.wait(1);
    await r.done();
  }
  if (want('c15')) {
    await r.clip('c15');
    await r.click('[data-theme-toggle]', 1.2);
    r.mark('dunkel');
    await r.wait(2.6);
    await r.click('[data-theme-toggle]', 0.5);
    await r.wait(1);
    await r.move('[data-notify]', 0.9);
    r.mark('hinweise');
    await r.wait(1.8);
    await r.click('[data-shortcuts]', 0.8);
    r.mark('kuerzel');
    await r.wait(3.2);
    await r.key('Escape');
    await r.wait(0.8);
    await r.done();
  }
  if (want('c16')) {
    await r.clip('c16');
    await r.move({ x: 1950, y: 1000 }, 1.4);
    await r.wait(5);
    await r.done();
  }
  await r.browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
