# Link-in-bio voor @jimmymiddendorp

Een mobile-first link-in-bio pagina met click-tracking, een privé dashboard,
een wekelijkse auto-sortering en per-bezoeker personalisatie — gebouwd op
**Cloudflare Workers + D1 (SQL) + Cron Triggers**.

De vier prompts uit de opdracht zijn 1-op-1 geïmplementeerd:

| Prompt | Wat het doet | Waar |
|--------|--------------|------|
| **01** | Publieke pagina: links uit de database als grote tappable knoppen, gesorteerd op `position`, met profielfoto + naam bovenaan. Mobile-first, clean, minimal. | `src/render.js`, `GET /` |
| **02** | Bij een tik +1 op `click_count` en direct doorsturen (redirect wordt **niet** vertraagd, schrijven gebeurt via `waitUntil`). Privé dashboard met alle links + totaal clicks, hoogste eerst. | `GET /go/:id`, `GET /dashboard` |
| **03** | Scheduled automation elke **maandag 09:00**: leest alle `click_count`s, hersorteert hoog → laag en schrijft de nieuwe volgorde terug naar `position`. De live pagina toont dat meteen. | `scheduled()` + cron in `wrangler.toml` |
| **Advanced** | Elke bezoeker krijgt bij het eerste bezoek een `visitor_id` (cookie, geen login). Entiteiten **Visitor** en **VisitorClick**. Elke tik wordt via de Worker (service role) gelogd — bezoekers raken de database nooit direct aan. Tikte een bezoeker eerder op een affiliate link, dan wordt die voor hém bovenaan gepind; anderen zien de globale volgorde. | `visitors` / `visitor_clicks`, `getPinnedAffiliateLinkId()` |

## Waarom deze stack past op "asServiceRole"

Alleen de Worker heeft de D1-binding (`env.DB`). Bezoekers praten uitsluitend
met de Worker-endpoints; de datalaag in `src/db.js` voert alle schrijfacties uit
met volledige rechten. Dat is exact de "backend function using asServiceRole"
uit de opdracht: de client raakt de database nooit rechtstreeks aan.

## Datamodel (`schema.sql`)

- **profile** — `handle, name, bio, photo_url` (het blok bovenaan de pagina)
- **links** — `id, title, url, click_count, position, is_affiliate`
- **visitors** — `visitor_id, created_at`
- **visitor_clicks** — `id, visitor_id, link_id, clicked_at`

## Routes

| Route | Methode | Beschrijving |
|-------|---------|--------------|
| `/` | GET | Publieke link-in-bio pagina. Zet visitor-cookie, pint evt. affiliate link. |
| `/go/:id` | GET | Telt de click, logt de tap (service role), redirect 302 naar de url. |
| `/dashboard` | GET | Privé dashboard achter Basic Auth (`DASHBOARD_PASSWORD`). |
| cron `0 7 * * 1` | — | Maandag-ochtend hersortering op clicks. |

## Lokaal draaien

```bash
npm install
npm run db:init:local     # maakt tabellen in lokale D1
npm run db:seed:local     # profiel + voorbeeldlinks
echo 'DASHBOARD_PASSWORD = "test123"' > .dev.vars
npm run dev               # http://localhost:8787
```

- Publieke pagina: <http://localhost:8787/>
- Dashboard: <http://localhost:8787/dashboard> (elke gebruikersnaam, wachtwoord `test123`)
- Cron testen: start met `wrangler dev --test-scheduled` en run
  `curl "http://localhost:8787/__scheduled?cron=0+7+*+*+1"`

## Live zetten (Cloudflare)

```bash
npm install
npx wrangler login
npx wrangler d1 create linkinbio-db        # kopieer database_id -> wrangler.toml
npm run db:init                            # tabellen in de echte D1
npm run db:seed                            # profiel + links (pas seed.sql aan)
npx wrangler secret put DASHBOARD_PASSWORD # kies je dashboard-wachtwoord
npm run deploy
```

Je pagina staat dan op `https://linkinbio.<jouw-subdomein>.workers.dev`.
De cron trigger is automatisch actief na deploy.

## Links aanpassen

Bewerk `seed.sql` en draai `npm run db:seed` opnieuw, of update rechtstreeks:

```bash
npx wrangler d1 execute linkinbio-db \
  --command "UPDATE profile SET name='Jimmy Middendorp', photo_url='https://...' WHERE handle='jimmymiddendorp'"

npx wrangler d1 execute linkinbio-db \
  --command "INSERT INTO links (title,url,position,is_affiliate) VALUES ('Nieuwe link','https://...',6,0)"
```

Markeer een link als affiliate met `is_affiliate = 1` om per-bezoeker pinnen aan
te zetten.

## `standalone.html` — één bestand, overal te hosten

`standalone.html` is de volledige pagina in **één zelfstandig bestand** (geen
database of server nodig). Click-tellingen, het dashboard (knop "Statistieken
bekijken") en het pinnen van een eerder-getikte affiliate link werken direct via
de browser (`localStorage`, dus per apparaat). Handig om snel live te zetten:

- **GitHub Pages** — zet het op de gepubliceerde branch; het staat dan op je
  Pages-URL, bv. `.../linkinbio/standalone.html`.
- **Netlify Drop** — sleep het bestand naar <https://app.netlify.com/drop>.
- **Lokaal** — dubbelklik het bestand; het werkt offline.

Let op: `localStorage` telt per bezoeker/apparaat. Voor globale statistieken over
álle bezoekers (en de wekelijkse auto-sortering) gebruik je de Cloudflare-versie
hierboven.

## Over de cron-tijd

Cloudflare-cron draait in **UTC**. `0 7 * * 1` = 09:00 in Amsterdam tijdens
zomertijd (CEST). In de winter zet je hem op `0 8 * * 1` voor 09:00 CET.
