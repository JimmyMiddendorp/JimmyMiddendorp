# MEMENTO / MORI — deploy

## ✅ Nu al live (zonder setup)

De app draait live via een GitHub-CDN (githack), gevoed door de
`gh-pages` branch die automatisch bij elke push wordt ververst:

**https://raw.githack.com/JimmyMiddendorp/JimmyMiddendorp/gh-pages/index.html**

Dit vereist geen enkele handmatige stap. Het is alleen geen eigen domein.
Voor een eigen `.dev`-domein volg je hieronder Cloudflare Pages.

> Waarom niet automatisch op `github.io`? Het *aanzetten* van GitHub Pages
> vereist repo-admin en kan niet met de GitHub Actions-token (403). Zet je
> Pages één keer zelf aan (Settings → Pages → Source: `gh-pages`), dan draait
> de app ook op `https://jimmymiddendorp.github.io/JimmyMiddendorp/`.

---

# Live op je `.dev`-domein via Cloudflare Pages

De app is een statische web-app (geen server, geen build-stap nodig) en werkt
als **PWA**: bezoekers kunnen 'm op hun telefoon installeren en offline gebruiken.

De app staat in de map [`memento/`](memento/). `wrangler.toml` zorgt dat
Cloudflare die map als **root** van je domein serveert, dus de app draait op
`https://jouw-domein.dev/` — niet op `/memento/`.

---

## Stap 1 — Cloudflare Pages koppelen aan de repo

1. Ga naar **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Kies de repo **`JimmyMiddendorp/JimmyMiddendorp`** en de branch
   **`claude/memento-mori-app-d03lqz`** (of de branch waarin je dit merget).
3. Build-instellingen:
   - **Framework preset:** `None`
   - **Build command:** *(leeg laten)*
   - **Build output directory:** `memento`
   > `wrangler.toml` zet dit ook al goed (`pages_build_output_dir = "memento"`),
   > maar vul het veld voor de zekerheid in.
4. Klik **Save and Deploy**. Na ~1 minuut is de app live op een
   `*.pages.dev`-adres.

## Stap 2 — Je eigen `.dev`-domein koppelen

Een `.dev`-domein vereist HTTPS (het staat op de HSTS-preloadlijst). Cloudflare
Pages regelt het TLS-certificaat automatisch — je hoeft niks handmatig te doen.

1. Koop het domein (bijv. via **Cloudflare Registrar** — dan staat alles op één plek).
2. In je Pages-project: **Custom domains → Set up a custom domain**.
3. Vul je domein in (bijv. `memento.dev` of `app.memento.dev`) en volg de stappen.
   - Domein bij Cloudflare → record wordt automatisch aangemaakt.
   - Domein elders → voeg de getoonde `CNAME` toe bij je DNS-provider.
4. Wacht tot het certificaat "Active" is. Klaar — de app draait op je `.dev`-domein.

## Stap 3 — Updates

Elke `git push` naar de gekozen branch triggert automatisch een nieuwe deploy.
De service worker (`memento/sw.js`) ververst de cache; bij grote wijzigingen is
het versienummer daarin al verhoogd zodat gebruikers de nieuwe versie krijgen.

---

## Alternatieven

- **Eén-bestand versie:** [`memento/memento-app.html`](memento/memento-app.html)
  bevat de héle app (incl. lettertype) in één bestand. Sleep 'm naar Netlify Drop,
  Vercel of elke statische host en het werkt direct — handig om snel te delen.
- **GitHub Pages:** kan ook, maar serveert vanaf `/memento/`. Cloudflare Pages
  met bovenstaande config geeft een schonere URL op de root van je domein.

## De app lokaal draaien

```bash
cd memento
python3 -m http.server 8080
# open http://localhost:8080
```
