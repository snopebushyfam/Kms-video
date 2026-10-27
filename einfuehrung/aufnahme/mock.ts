// Ersetzt den Server im Browser: echte Oberfläche (angemeldet), Beispieldaten.
import { emails, demoEvents, folders } from '/home/user/kms-verwaltung-app/src/data/demo';
import { demoRoutines } from '/home/user/kms-verwaltung-app/src/routines';

const SHARED = 'info@kms-verwaltung.de';
const mails = emails.map((e) => ({ ...e, analysedBy: 'claude', claimedBy: e.id === 'm2' ? 'Thomas Weber' : null }));
const day = 86_400_000;
const now = () => Date.now();

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const json = async (data: unknown, ms = 250) => {
  await wait(ms);
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

const files = [
  { root: 'objekte', rootName: 'Objekte', rel: 'Gartenweg 22/Mietverträge/Mietvertrag WE 2 Albers.pdf', name: 'Mietvertrag WE 2 Albers.pdf', size: 1_420_000, mtime: 0 },
  { root: 'objekte', rootName: 'Objekte', rel: 'Gartenweg 22/Nebenkosten/Abrechnung 2025.xlsx', name: 'Abrechnung 2025.xlsx', size: 286_000, mtime: 1 },
  { root: 'objekte', rootName: 'Objekte', rel: 'Gartenweg 22/Übergabe WE 3/Übergabeprotokoll.pdf', name: 'Übergabeprotokoll.pdf', size: 512_000, mtime: 2 },
  { root: 'weg', rootName: 'WEG-Verwaltung', rel: 'Gartenweg 22/Grundriss EG.pdf', name: 'Grundriss EG.pdf', size: 3_100_000, mtime: 20 },
  { root: 'objekte', rootName: 'Objekte', rel: 'Gartenweg 22/Fotos/Treppenhaus.jpg', name: 'Treppenhaus.jpg', size: 2_200_000, mtime: 9 },
];
const tree: Record<string, { name: string; type: 'dir' | 'file'; size: number; age: number }[]> = {
  '': [
    { name: 'Am Mühlenbach 3', type: 'dir', size: 0, age: 0 },
    { name: 'Gartenweg 22', type: 'dir', size: 0, age: 1 },
    { name: 'Lindenstraße 14', type: 'dir', size: 0, age: 0 },
  ],
  'Gartenweg 22': [
    { name: 'Fotos', type: 'dir', size: 0, age: 9 },
    { name: 'Mietverträge', type: 'dir', size: 0, age: 30 },
    { name: 'Nebenkosten', type: 'dir', size: 0, age: 1 },
    { name: 'Übergabe WE 3', type: 'dir', size: 0, age: 2 },
    { name: 'Hausordnung.pdf', type: 'file', size: 240_000, age: 120 },
  ],
  'Gartenweg 22/Übergabe WE 3': [
    { name: 'Schlüsselliste.xlsx', type: 'file', size: 34_000, age: 2 },
    { name: 'Übergabeprotokoll.pdf', type: 'file', size: 512_000, age: 2 },
    { name: 'Zählerstände.pdf', type: 'file', size: 98_000, age: 2 },
  ],
};

type Ev = Record<string, unknown>;
const answers: { match: RegExp; events: Ev[] }[] = [
  {
    match: /dringend|heute/i,
    events: [
      { type: 'tool', label: 'Sieht die neuesten E-Mails durch' },
      { type: 'tool', label: 'Sieht im Kalender nach' },
      {
        type: 'text',
        text:
          'Heute sind zwei Dinge dringend:\n\n' +
          '• **Wasserschaden Lindenstraße 14, WE 7** – der Notdienst kommt um 10:00 Uhr. Frau Kröger wartet noch auf eine Antwort.\n' +
          '• **Heizungsausfall Am Mühlenbach 3** – die mobilen Heizgeräte (ca. 480 €) müssen freigegeben werden. Thomas kümmert sich bereits darum.\n\n' +
          'Außerdem läuft morgen die Frist für die Einladung zur Eigentümerversammlung ab. Soll ich Frau Kröger antworten?',
      },
    ],
  },
  {
    match: /ja|antwort|kröger/i,
    events: [
      { type: 'tool', label: 'Liest eine E-Mail' },
      { type: 'tool', label: 'Liest Skill /kms-ton' },
      { type: 'tool', label: 'Schreibt einen Entwurf' },
      { type: 'text', text: 'Hier ist mein Vorschlag. Prüf ihn kurz und speichere ihn dann als Entwurf in Outlook.' },
      {
        type: 'card',
        card: {
          kind: 'draft',
          mailbox: SHARED,
          to: 's.kroeger@example.de',
          subject: 'AW: Wasserschaden im Bad',
          text: 'Sehr geehrte Frau Kröger,\n\nder Notdienst der Firma Sanitär Behrens ist beauftragt und heute um 10:00 Uhr bei Ihnen. Bitte stellen Sie bis dahin einen Eimer unter die Tropfstelle.\n\nMit freundlichen Grüßen\nKMS Immobilienverwaltung',
          replyToId: 'm1',
        },
      },
    ],
  },
];
let answerIdx = 0;

function agentResponse(prompt: string): Response {
  const a = answers.find((x) => x.match.test(prompt)) ?? answers[answerIdx % answers.length];
  answerIdx++;
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (e: Ev) => ctrl.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
      await wait(400);
      for (const e of a.events) {
        if (e.type === 'text') {
          const words = String(e.text).split(/(?<=\s)/);
          for (let i = 0; i < words.length; i += 2) {
            send({ type: 'text', text: words.slice(i, i + 2).join('') });
            await wait(45);
          }
        } else {
          send(e);
          await wait(e.type === 'tool' ? 650 : 200);
        }
      }
      send({ type: 'usage', inputTokens: 9000, outputTokens: 300 });
      send({ type: 'done', conversationId: 'c1' });
      ctrl.close();
    },
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
}

const signedIn = !location.search.includes('login');
const realFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.href);
  if (!url.pathname.startsWith('/api/')) return realFetch(input, init);
  const p = url.pathname;
  const method = (init?.method ?? 'GET').toUpperCase();
  const body = init?.body ? JSON.parse(String(init.body)) : {};

  if (p === '/api/status')
    return json(
      {
        outlook: { configured: true },
        user: signedIn ? { name: 'Anna Berger', username: 'a.berger@kms-verwaltung.de' } : null,
        mailboxes: ['me', SHARED],
        claude: { enabled: true, model: 'claude' },
        skills: [],
      },
      30,
    );
  if (p === '/api/mails') return json({ emails: mails }, 700);
  const m = p.match(/^\/api\/mails\/([^/]+)\/(\w+)/);
  if (m) {
    const mail = mails.find((x) => x.id === m[1]);
    if (m[2] === 'full')
      return json({
        body: mail?.summary ?? '',
        attachments: mail?.category === 'Schaden' ? [{ id: 'a1', name: 'Foto_Bad.jpg', size: 2_100_000 }, { id: 'a2', name: 'Foto_Decke.jpg', size: 1_800_000 }] : [],
        webLink: 'https://outlook.office.com/',
      });
    if (m[2] === 'claim') {
      if (mail) mail.claimedBy = body.claim ? 'Anna Berger' : null;
      return json({ claimedBy: mail?.claimedBy ?? null }, 300);
    }
    if (m[2] === 'done' && mail) mail.priority = body.done ? 'erledigt' : 'normal';
    return json({ ok: true }, 400);
  }
  if (p === '/api/calendar') return method === 'GET' ? json({ events: demoEvents() }, 500) : json({ ok: true }, 400);
  if (p === '/api/folders')
    return json({
      enabled: true,
      indexedAt: now(),
      folders: folders.map((f, i) => ({ id: f.name === 'Objekte' ? 'objekte' : `f${i}`, name: f.name, files: f.files, updated: now() - [0, 0, 1, 3, 1, 8][i] * day, error: null })),
    });
  if (p === '/api/files/search') {
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    return json({ results: files.filter((f) => f.rel.toLowerCase().includes(q)).map((f) => ({ ...f, mtime: now() - f.mtime * day })) }, 300);
  }
  if (p === '/api/files/list') {
    const rel = url.searchParams.get('path') ?? '';
    return json({ entries: (tree[rel] ?? []).map((e) => ({ name: e.name, type: e.type, size: e.size, mtime: now() - e.age * day })) }, 200);
  }
  if (p === '/api/agent') {
    await wait(100);
    return agentResponse(String(body.prompt ?? ''));
  }
  if (p === '/api/routines') return json(demoRoutines);
  return json({ ok: true }, 300);
};

try {
  localStorage.setItem('kms-theme', 'light');
  localStorage.setItem('kms-mailbox', SHARED);
} catch {
  // egal
}
