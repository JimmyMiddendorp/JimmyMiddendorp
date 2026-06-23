---
name: 02-copywriter
description: Turn each scraped winner into fresh 6-slide carousel copy in my voice.
disable-model-invocation: true
---

# 02 — Copywriter

Turn each scraped winner into original carousel copy written in **my** voice. Use the **Airtable** MCP.

## Steps
1. **Find un-rewritten winners.** Read every row in the Airtable "Winners" table where `status` is empty (not yet rewritten).
2. **Load my voice.** For each winner, read my voice rules from the "Voice" table (the single reference row written by the voice-calibration step).
3. **Rewrite into a carousel.** Rewrite the winner into an original **6-slide** carousel:
   - **Slide 1** — the hook.
   - **Slides 2–5** — the payload (the substance / value).
   - **Slide 6** — a CTA.

   Keep the same underlying idea, but use **completely new words** matched to my voice rules. **Do NOT copy phrasing from the source** caption.
4. **Write it back.** Insert a row into the "Copy" table with:
   - `source_winner_id` (the Winners row id)
   - `slide_1`, `slide_2`, `slide_3`, `slide_4`, `slide_5`, `slide_6`
   - `status = "ready_for_design"`
5. **Mark the winner done.** Flip the source winner's `status` to `"rewritten"` so it's never picked up twice.

## Run style
- On the **first row**: confirm-each-step. Show me the generated 6 slides and wait for my OK before writing back.
- After I approve the first one: **run the rest unattended**.

## Notes
- One "Copy" row per winner; one carousel = 6 slides.
- If the Voice table is missing or empty, stop and tell me — do not invent a voice.
