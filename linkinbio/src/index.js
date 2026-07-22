// ===========================================================================
// Link-in-bio Worker — router, redirect, dashboard, visitor-tracking en cron.
//
//  GET  /            -> publieke link-in-bio pagina (Prompt 01 + Advanced)
//  GET  /go/:id      -> tel click, log tap, redirect naar de url (Prompt 02)
//  GET  /dashboard   -> privé dashboard, achter wachtwoord (Prompt 02)
//  cron  ma 09:00    -> hersorteer op clicks (Prompt 03, via scheduled())
// ===========================================================================

import {
  getProfile,
  getLinksByPosition,
  getLinksByClicks,
  getLink,
  incrementClick,
  logVisitorClick,
  ensureVisitor,
  getPinnedAffiliateLinkId,
  resortByClicks,
} from "./db.js";
import { renderPage, renderDashboard } from "./render.js";

const COOKIE_NAME = "vid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 jaar

// -- Cookie helpers ---------------------------------------------------------

function readVisitorId(request) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function visitorCookie(visitorId) {
  return (
    `${COOKIE_NAME}=${encodeURIComponent(visitorId)}; ` +
    `Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; HttpOnly; Secure`
  );
}

function html(body, extraHeaders = {}) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

// -- Dashboard auth (Basic Auth via secret DASHBOARD_PASSWORD) --------------

function checkDashboardAuth(request, env) {
  const expected = env.DASHBOARD_PASSWORD;
  if (!expected) return false; // geen wachtwoord ingesteld = dicht
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ")) return false;
  try {
    const decoded = atob(header.slice(6)); // "gebruiker:wachtwoord"
    const password = decoded.slice(decoded.indexOf(":") + 1);
    return password === expected;
  } catch {
    return false;
  }
}

// -- Router -----------------------------------------------------------------

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const handle = env.PROFILE_HANDLE || "jimmymiddendorp";

    try {
      // --- /go/:id  — redirect met click-telling (Prompt 02) -------------
      const goMatch = path.match(/^\/go\/(\d+)\/?$/);
      if (goMatch && request.method === "GET") {
        const linkId = Number(goMatch[1]);
        const link = await getLink(env, linkId);
        if (!link) return new Response("Link niet gevonden", { status: 404 });

        // visitor_id bepalen (of aanmaken) — nodig om de tap te loggen.
        let visitorId = readVisitorId(request);
        let setCookie = null;
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          setCookie = visitorCookie(visitorId);
        }

        const nowIso = new Date().toISOString();

        // De redirect NIET vertragen: schrijfacties draaien ná de response
        // via waitUntil. Bezoeker wordt meteen doorgestuurd.
        ctx.waitUntil(
          (async () => {
            await incrementClick(env, linkId); // +1 op click_count
            await logVisitorClick(env, visitorId, linkId, nowIso); // service role
          })()
        );

        const headers = { Location: link.url, "Cache-Control": "no-store" };
        if (setCookie) headers["Set-Cookie"] = setCookie;
        return new Response(null, { status: 302, headers });
      }

      // --- /dashboard — privé (Prompt 02) --------------------------------
      if (path === "/dashboard" || path === "/dashboard/") {
        if (!checkDashboardAuth(request, env)) {
          return new Response("Authenticatie vereist", {
            status: 401,
            headers: { "WWW-Authenticate": 'Basic realm="Dashboard"' },
          });
        }
        const links = await getLinksByClicks(env); // hoogste eerst
        return html(renderDashboard(links));
      }

      // --- /  — publieke pagina (Prompt 01 + Advanced) -------------------
      if (path === "/" || path === "") {
        const [profile, links] = await Promise.all([
          getProfile(env, handle),
          getLinksByPosition(env), // globale volgorde op position
        ]);

        // Visitor-cookie: zet er één op eerste bezoek (geen login/signup).
        let visitorId = readVisitorId(request);
        let setCookie = null;
        const nowIso = new Date().toISOString();
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          setCookie = visitorCookie(visitorId);
          ctx.waitUntil(ensureVisitor(env, visitorId, nowIso));
        }

        // Advanced (4): tikte deze bezoeker eerder op een affiliate link?
        // Zo ja: pin die bovenaan — alleen voor hem. Anderen zien de globale
        // volgorde.
        let ordered = links;
        let pinnedId = null;
        if (readVisitorId(request)) {
          pinnedId = await getPinnedAffiliateLinkId(env, visitorId);
          if (pinnedId) {
            const pinned = links.filter((l) => l.id === pinnedId);
            const rest = links.filter((l) => l.id !== pinnedId);
            ordered = [...pinned, ...rest];
          }
        }

        const body = renderPage(profile, ordered, { pinnedId });
        return html(body, setCookie ? { "Set-Cookie": setCookie } : {});
      }

      return new Response("Niet gevonden", { status: 404 });
    } catch (err) {
      return new Response("Serverfout: " + (err?.message || String(err)), {
        status: 500,
      });
    }
  },

  // --- Scheduled automation (Prompt 03) --------------------------------
  // Draait elke maandag 09:00 (zie cron in wrangler.toml). Leest alle
  // click_counts, sorteert hoog -> laag en schrijft de nieuwe volgorde
  // terug naar position. De live pagina gebruikt position, dus die
  // weerspiegelt de nieuwe volgorde direct.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      (async () => {
        const count = await resortByClicks(env);
        console.log(
          `[cron ${event.cron}] ${count} links opnieuw gesorteerd op clicks.`
        );
      })()
    );
  },
};
