---
name: 01-researcher
description: Scrape this week's winning posts in my niche and save them to Airtable.
disable-model-invocation: true
---

# 01 — Researcher

Every morning, find the posts already winning in my niche and save the proven winners to Airtable. Use the **Apify** and **Airtable** MCPs that are connected.

## First-run setup (do this once)
Before the very first run, confirm with me:
- The Airtable **base** "Content Machine" base ID.
- The **Accounts** table ID and the field that holds the handle.
- The **Winners** table ID and its field names.

Once confirmed, record the IDs at the bottom of this file under "Confirmed IDs" and never ask again.

## Steps
1. **Read the account list.** Open the Airtable base "Content Machine", table "Accounts" (~50 top creators in my niche). Pull the list of handles only.
2. **Scrape each handle.** For each handle, call the Apify Instagram scraper (actor `apify/instagram-scraper`) with:
   - `resultsType = "posts"`
   - `resultsLimit = 12`
   - `onlyPostsNewerThan = "7 days"`
3. **Keep only the winners.** For each account, compute the **median** like count across the posts you pulled, and keep ONLY the posts **above** that median — the proven winners, not the average performers.
4. **Save winners (no duplicates).** For every winner, insert a row into the "Winners" table with:
   - `source_handle`
   - `post_url`
   - `hook` (the first line of the caption)
   - `full_caption`
   - `like_count`
   - `scraped_at` (timestamp of this run)

   Before inserting, check whether the `post_url` is already in the table. **Skip any post_url that already exists** so we never duplicate.
5. **Summarize.** Print a one-line summary: how many winners you added, plus the top 3 winners by like count (handle + likes).

## Notes
- Be resilient: if one handle fails to scrape, log it and continue with the rest.
- "Above the median" is strict (`>` median), so the median post itself is excluded.

## Confirmed IDs
<!-- Fill in after the first run, then stop asking:
base_id:
accounts_table_id:
accounts_handle_field:
winners_table_id:
-->
