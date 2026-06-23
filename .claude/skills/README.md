# Content Machine — skill pipeline

Four chained Claude skills that run the daily content loop end to end:

| Order | Skill | Does | Needs |
|-------|-------|------|-------|
| 1 | `01-researcher` | Scrape this week's winning posts → "Winners" table | Apify + Airtable MCP |
| 2 | `02-copywriter` | Rewrite each winner into 6-slide carousel copy → "Copy" table | Airtable MCP + "Voice" table |
| 3 | `03-designer`   | Render each copy row into 9:16 cards → image URLs | `GEMINI_API_KEY` (Nano Banana Pro) |
| 4 | `04-poster`     | Auto-schedule finished carousels to Instagram | Metricool MCP |

Status flows through Airtable so each stage only picks up what the previous one finished:
`Winners (empty → rewritten)` → `Copy (ready_for_design → ready_to_post → scheduled)`.

## One-time: calibrate the Voice table
The whole loop is only as good as the voice rules `02-copywriter` reads. Calibrate once by pasting your 10 best posts and asking Claude to extract:
- 8–12 concrete voice rules (sentence length, rhythm, punctuation, slang you use, words you never use, how you open/close),
- 5 signature phrases/moves that repeat,
- a 2-line "do NOT" list of AI tics to kill (em dashes, "in today's fast-paced world", hedging).

Write all of it into the Airtable **"Voice"** table as a single reference row.

## Chain them on a daily cron
```cron
# m h dom mon dow   command
0 6 * * *  claude -p "run the 01-researcher skill"
0 7 * * *  claude -p "run the 02-copywriter skill"
0 8 * * *  claude -p "run the 03-designer skill"
0 9 * * *  claude -p "run the 04-poster skill"
```
Schedule via Claude Cowork, Claude Code, or any scheduler you prefer.
