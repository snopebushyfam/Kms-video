# Einführungsvideo KMS Kontrollzentrum

Ein knapp vierminütiges Schulungsvideo (1920×1080, 30 fps) für neue Mitarbeiter. Es zeigt die
PC-Version des Kontrollzentrums mit Beispieldaten, im hellen Modus und mit Sprecherin und Musik.

## Aufbau

| Teil | Inhalt |
|---|---|
| Start | KMS-Logo, „Kontrollzentrum – Deine Einführung“ |
| Überblick | Die drei Bereiche, „Heute wichtig“ |
| Anmelden | Microsoft-Anmeldung |
| E-Mails | Sortierung, Filter, Postfächer, E-Mail öffnen, „Übernehme ich“, Termin eintragen, Antwort senden |
| Kalender | Heute/Woche, Termin-Details |
| Aufgaben | Die Kugel, Aufgabenliste |
| Ordner | Dateisuche, Ordner durchklicken |
| Claude | Frage stellen, Antwortentwurf, Vorlagen, Abkürzungen |
| Routinen | Zeitpläne und Ergebnisse |
| Gut zu wissen | Hell/Dunkel, Hinweise, Tastenkürzel |
| Ende | „Willkommen im Team.“ |

## Dateien

- `sprechertext.json`: der gesprochene Text pro Abschnitt
- `assets/voice/`: Sprecherin „Lea Voss“ (ElevenLabs), dazu die Wortzeiten (`*.words.json`)
- `assets/music/musik.mp3`: Hintergrundmusik (ElevenLabs Music)
- `assets/clips/`: Bildschirmaufnahmen des Programms, mit Zeitmarken der Klicks (`*.marks.json`)
- `build.mjs`: Schnitt, Kamerafahrten, Kapitelkarten und Lautstärke; schreibt `index.html` und `compositions/`
- `aufnahme/`: Skripte, mit denen die Bildschirmaufnahmen entstanden sind

## Neu bauen und rendern

```bash
node build.mjs                 # Schnitt neu berechnen
npx hyperframes check          # prüfen
npx hyperframes render -o renders/KMS-Einfuehrung.mp4 -q delivery
```

## Szenen neu aufnehmen (z. B. wenn sich das Programm ändert)

Die Aufnahmen laufen mit dem gebauten Programm (`kms-verwaltung-app`, `npm run build`, dann `dist/`
auf Port 4173 ausliefern) in einem Browser mit virtueller Zeit, damit jedes Bild exakt und flüssig ist:

```bash
npx esbuild aufnahme/mock.ts --bundle --format=iife --outfile=aufnahme/mock.js
node aufnahme/record.cjs            # alle Szenen
node aufnahme/record.cjs c05,c06    # nur einzelne Szenen
```

`mock.ts` ersetzt den Server im Browser (angemeldet als „Anna Berger“, Beispieldaten aus der App).
Die Einzelbilder werden danach mit ffmpeg zu `assets/clips/cXX.mp4` zusammengesetzt.
