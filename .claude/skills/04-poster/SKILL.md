---
name: 04-poster
description: Auto-schedule finished carousels to Instagram, spaced through the week.
disable-model-invocation: true
---

# 04 — Poster

Auto-schedule finished carousels to Instagram, spaced through the week, untouched. Use the **Metricool** MCP.

## First-run setup (do this once)
Confirm my Metricool **brand ID** for Instagram once. Record it under "Confirmed IDs" below, then run unattended on every future run.

## Steps
1. **Find carousels ready to post.** Read every row in the Airtable "Copy" table with `status = "ready_to_post"`.
2. **Schedule each one.** For each row, via the Metricool MCP:
   - Call `get_best_time_to_post` for my Instagram brand.
   - Call `post_schedule_post` with the 6 image URLs as a **carousel** and the caption (slide 1 text + a short CTA), at the **next open best-time slot**.
   - **Max one post per day** — if the next best slot is already taken, push to the following day's slot.
3. **Record the schedule.** Write the scheduled time back to the row and set `status = "scheduled"`.
4. **Report.** Print what you scheduled and when (one line per post).

## Notes
- Scheduling works on the Metricool **free tier** — it just caps at 20 scheduled posts, which is plenty to prove the loop.
- Never schedule the same row twice; rows already at `status = "scheduled"` are skipped.

## Confirmed IDs
<!-- Fill in after first run:
metricool_brand_id:
-->
