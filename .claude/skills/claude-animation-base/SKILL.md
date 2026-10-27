---
name: claude-animation-base
description: Handgezeichnete Charakter-Animationen (p5.js + p5.brush) als Video rendern, z. B. eine Figur, die etwas erlebt. Nutzen, wenn ein Video im gemalten 2D-Stil mit einer animierten Figur gewünscht ist. Das Starter-Kit liegt in tools/claude-animation-base.
---

# Claude Animation Base

Das Kit liegt in `tools/claude-animation-base` (MIT, github.com/JohnHeibel/ClaudeAnimationBase).

1. Lies `tools/claude-animation-base/ANIMATION_GUIDE.md` vollständig und halte dich an seine Regeln.
2. Erst Storyboard, dann Szene für Szene bauen, mit Kontaktbögen prüfen.
3. Rendern mit `render.mjs` im Kit-Ordner (braucht Node.js, Google Chrome und ffmpeg; `npm install` vorher). Ergebnis: `out/video.mp4`.
4. Ohne eigene Grafikkarte sind die Aquarell-Füllungen langsam; dann einfachere Füllungen nehmen.
