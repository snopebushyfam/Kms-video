# KMS Video

Video-Skills für Claude Code, um Videos für KMS zu erstellen. Claude lädt die Skills automatisch, wenn dieses Repo geöffnet ist (`.claude/skills/`).

| Skill | Wofür | Lizenz | Braucht |
|---|---|---|---|
| `hyperframes` (+ `hyperframes-cli`, `-registry`, `slideshow`, `figma`, `media-use`, `remotion-to-hyperframes`) | Videos aus HTML/CSS/JS: Titel, Produkt-Rundgänge, Kamerafahrten | Apache-2.0 | Node.js, ffmpeg |
| `onetake` | Ein Video als eine durchgehende Kamerafahrt ohne Schnitt | PolyForm Noncommercial 1.0.0 – **nur nicht-kommerziell** | Node.js, Python 3, ffmpeg |
| `collage-broll` | Collage-B-Roll aus Bildern | MIT | `GEMINI_API_KEY`, `google-genai`, ffmpeg |
| `claude-animation-base` (Kit in `tools/claude-animation-base`) | Handgezeichnete Figuren-Animation (p5.js) | MIT | Node.js, Chrome, ffmpeg |
| `lemo-opuscar` | Kurzfilme in 43 Filmstilen; lädt seine Bibliothek beim ersten Einsatz von GitHub | MIT | Node.js, Python 3, ffmpeg |

Quellen: github.com/heygen-com/hyperframes, github.com/feitangyuan/onetake, github.com/JohnHeibel/ClaudeAnimationBase, github.com/lemomo-ai/lemo-opuscar, github.com/pyang5166/gbro-collage-broll. Die Lizenztexte liegen jeweils im Skill-Ordner.

Nicht übernommen: Beispielvideos (`*.mp4`) aus den Original-Repos, um das Repo klein zu halten.
