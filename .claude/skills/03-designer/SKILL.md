---
name: 03-designer
description: Turn each finished copy row into a 9:16 Instagram carousel with Nano Banana Pro.
disable-model-invocation: true
---

# 03 — Designer

Turn each finished copy row into a real 9:16 Instagram carousel. Render images with the **Gemini image API** (Nano Banana Pro — the current best at legible in-image text, which is the entire ballgame for carousels).

Requires `GEMINI_API_KEY` in the environment.

## Steps
1. **Find copy ready for design.** Read every row in the Airtable "Copy" table with `status = "ready_for_design"`.
2. **Render 6 slides.** For each of the 6 slides, call the Gemini image API with model `gemini-3-pro-image` (Nano Banana Pro). Render a clean **9:16** card per slide:
   - Slide text **large and readable**.
   - My brand colors.
   - The **same template** across all 6 slides (consistent layout, fonts, framing).
3. **Save + link.** Save each generated image, then write the 6 image URLs back to the row (e.g. `image_1` … `image_6`).
4. **Advance status.** Set `status = "ready_to_post"`.

## Run style
- Do **one full carousel first**, show me all 6 cards, and wait for approval. Then run the rest.

## Notes
- Follow the text-in-image recipe from the `cnemri/nanobanana-recipes` repo so the copy stays crisp and legible.
- Want cheaper bulk runs? Drop to **Nano Banana 2** (`gemini-3-1-flash-image`) at the cost of some text fidelity.
- Keep aspect ratio strictly 9:16 for Instagram carousels.
