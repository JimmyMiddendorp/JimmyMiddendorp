// ===========================================================================
// HTML-rendering. Mobile-first, clean, minimal (Prompt 01).
// ===========================================================================

/** Kleine helper: escape user-content voor veilige HTML-output. */
function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ---------------------------------------------------------------------------
// Publieke link-in-bio pagina
// ---------------------------------------------------------------------------
export function renderPage(profile, links, { pinnedId } = {}) {
  const name = profile?.name || "@" + (profile?.handle || "handle");
  const handle = profile?.handle || "handle";
  const bio = profile?.bio || "";
  const photo = profile?.photo_url || "";

  const avatar = photo
    ? `<img class="avatar" src="${esc(photo)}" alt="${esc(name)}" />`
    : `<div class="avatar avatar--fallback">${esc(initials(name))}</div>`;

  const buttons = links
    .map((link) => {
      const pinned = pinnedId && link.id === pinnedId;
      return `
      <a class="link${pinned ? " link--pinned" : ""}" href="/go/${link.id}" rel="noopener">
        <span class="link-title">${esc(link.title)}</span>
        ${pinned ? '<span class="link-badge">Voor jou</span>' : ""}
      </a>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(name)} — @${esc(handle)}</title>
<meta name="description" content="${esc(bio)}" />
<meta property="og:title" content="${esc(name)}" />
<meta property="og:description" content="${esc(bio)}" />
${photo ? `<meta property="og:image" content="${esc(photo)}" />` : ""}
<style>
  :root {
    --bg: #0f1115;
    --card: #1a1d24;
    --card-hover: #232732;
    --text: #f5f6f8;
    --muted: #9aa0ab;
    --accent: #6c8cff;
    --radius: 16px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: radial-gradient(1200px 600px at 50% -10%, #1c2030 0%, var(--bg) 60%);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 48px 20px 64px;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { width: 100%; max-width: 480px; }
  .profile { text-align: center; margin-bottom: 28px; }
  .avatar {
    width: 96px; height: 96px; border-radius: 50%;
    object-fit: cover; margin: 0 auto 16px; display: block;
    border: 2px solid rgba(255,255,255,0.12);
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  }
  .avatar--fallback {
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--accent), #9b6cff);
    font-size: 32px; font-weight: 700; color: #fff;
  }
  .name { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
  .handle { color: var(--muted); font-size: 15px; margin-top: 2px; }
  .bio { color: var(--muted); font-size: 15px; margin-top: 12px; line-height: 1.5; }
  .links { display: flex; flex-direction: column; gap: 14px; margin-top: 28px; }
  .link {
    position: relative;
    display: flex; align-items: center; justify-content: center;
    min-height: 60px; padding: 16px 20px;
    background: var(--card);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: var(--radius);
    color: var(--text); text-decoration: none;
    font-size: 17px; font-weight: 600;
    transition: transform .12s ease, background .12s ease, border-color .12s ease;
  }
  .link:hover { background: var(--card-hover); transform: translateY(-2px); }
  .link:active { transform: translateY(0) scale(0.99); }
  .link--pinned { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
  .link-badge {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
    color: var(--accent); background: rgba(108,140,255,0.12);
    padding: 4px 8px; border-radius: 999px;
  }
  .empty { text-align: center; color: var(--muted); margin-top: 40px; }
  .footer { text-align: center; color: var(--muted); font-size: 12px; margin-top: 40px; opacity: .7; }
</style>
</head>
<body>
  <main class="wrap">
    <div class="profile">
      ${avatar}
      <div class="name">${esc(name)}</div>
      <div class="handle">@${esc(handle)}</div>
      ${bio ? `<div class="bio">${esc(bio)}</div>` : ""}
    </div>
    <nav class="links">
      ${buttons || '<p class="empty">Nog geen links.</p>'}
    </nav>
    <p class="footer">@${esc(handle)}</p>
  </main>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Privé dashboard (Prompt 02): elke link + totaal clicks, hoogste eerst.
// ---------------------------------------------------------------------------
export function renderDashboard(links) {
  const total = links.reduce((sum, l) => sum + (l.click_count || 0), 0);

  const rows = links
    .map(
      (l, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td>
          <div class="t-title">${esc(l.title)}${
        l.is_affiliate ? ' <span class="tag">affiliate</span>' : ""
      }</div>
          <a class="t-url" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(
        l.url
      )}</a>
        </td>
        <td class="clicks">${l.click_count}</td>
        <td class="pos">${l.position}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>Dashboard — link-in-bio</title>
<style>
  :root { --bg:#0f1115; --card:#1a1d24; --text:#f5f6f8; --muted:#9aa0ab; --accent:#6c8cff; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg); color: var(--text); padding: 32px 20px 64px;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 720px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 700; }
  .sub { color: var(--muted); margin-top: 4px; font-size: 14px; }
  .stats { display: flex; gap: 12px; margin: 24px 0; flex-wrap: wrap; }
  .stat { flex: 1; min-width: 140px; background: var(--card); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 16px; }
  .stat .n { font-size: 28px; font-weight: 700; }
  .stat .l { color: var(--muted); font-size: 13px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; color: var(--muted); font-size: 12px; text-transform: uppercase;
       letter-spacing: .04em; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  td { padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top; }
  .rank { color: var(--muted); font-weight: 700; width: 32px; }
  .t-title { font-weight: 600; }
  .t-url { color: var(--muted); font-size: 13px; text-decoration: none; word-break: break-all; }
  .t-url:hover { color: var(--accent); }
  .clicks { font-weight: 700; font-size: 18px; text-align: right; }
  .pos { color: var(--muted); text-align: right; width: 56px; }
  .tag { font-size: 11px; color: var(--accent); background: rgba(108,140,255,0.12);
         padding: 2px 6px; border-radius: 999px; margin-left: 6px; }
  th.num, td.clicks, td.pos { text-align: right; }
  .foot { color: var(--muted); font-size: 12px; margin-top: 24px; }
  a.back { color: var(--accent); text-decoration: none; font-size: 14px; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Dashboard</h1>
    <p class="sub">Alle links en hun totale clicks — hoogste eerst.</p>

    <div class="stats">
      <div class="stat"><div class="n">${total}</div><div class="l">Totaal clicks</div></div>
      <div class="stat"><div class="n">${links.length}</div><div class="l">Links</div></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Link</th>
          <th class="num">Clicks</th>
          <th class="num">Positie</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="4" style="color:var(--muted)">Nog geen links.</td></tr>'}
      </tbody>
    </table>

    <p class="foot"><a class="back" href="/">&larr; Bekijk de publieke pagina</a></p>
  </div>
</body>
</html>`;
}
