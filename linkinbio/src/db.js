// ===========================================================================
// Datalaag = de "service role".
//
// Alleen de Worker heeft de D1-binding (env.DB). Bezoekers roepen nooit
// rechtstreeks de database aan; ze praten met de Worker, die deze functies
// gebruikt met volledige (service-role) rechten. Zo blijft schrijven veilig.
// ===========================================================================

/** Haal het profiel op (foto + naam bovenaan de pagina). */
export async function getProfile(env, handle) {
  return env.DB.prepare(
    "SELECT handle, name, bio, photo_url FROM profile WHERE handle = ?"
  )
    .bind(handle)
    .first();
}

/** Alle links in weergavevolgorde (op position, laag = boven). */
export async function getLinksByPosition(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, title, url, click_count, position, is_affiliate " +
      "FROM links ORDER BY position ASC, id ASC"
  ).all();
  return results ?? [];
}

/** Alle links op totaal aantal clicks, hoogste eerst (voor het dashboard). */
export async function getLinksByClicks(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, title, url, click_count, position, is_affiliate " +
      "FROM links ORDER BY click_count DESC, id ASC"
  ).all();
  return results ?? [];
}

/** Eén link ophalen (voor de redirect). */
export async function getLink(env, id) {
  return env.DB.prepare(
    "SELECT id, title, url, click_count, position, is_affiliate FROM links WHERE id = ?"
  )
    .bind(id)
    .first();
}

/** Prompt 02: tel 1 op bij de click_count van deze link. */
export async function incrementClick(env, linkId) {
  await env.DB.prepare(
    "UPDATE links SET click_count = click_count + 1 WHERE id = ?"
  )
    .bind(linkId)
    .run();
}

/**
 * Advanced Prompt: registreer de bezoeker (als hij nog niet bestaat) en log
 * de tap in visitor_clicks. Draait volledig als service role.
 */
export async function logVisitorClick(env, visitorId, linkId, nowIso) {
  await env.DB.prepare(
    "INSERT OR IGNORE INTO visitors (visitor_id, created_at) VALUES (?, ?)"
  )
    .bind(visitorId, nowIso)
    .run();

  await env.DB.prepare(
    "INSERT INTO visitor_clicks (visitor_id, link_id, clicked_at) VALUES (?, ?, ?)"
  )
    .bind(visitorId, linkId, nowIso)
    .run();
}

/** Zorg dat een bezoeker in de visitors-tabel staat (bij eerste paginabezoek). */
export async function ensureVisitor(env, visitorId, nowIso) {
  await env.DB.prepare(
    "INSERT OR IGNORE INTO visitors (visitor_id, created_at) VALUES (?, ?)"
  )
    .bind(visitorId, nowIso)
    .run();
}

/**
 * Advanced Prompt (4): heeft deze bezoeker eerder op een affiliate link getikt?
 * Zo ja, geef de meest recente terug — die pinnen we bovenaan voor hem.
 */
export async function getPinnedAffiliateLinkId(env, visitorId) {
  const row = await env.DB.prepare(
    "SELECT vc.link_id AS link_id " +
      "FROM visitor_clicks vc " +
      "JOIN links l ON l.id = vc.link_id " +
      "WHERE vc.visitor_id = ? AND l.is_affiliate = 1 " +
      "ORDER BY vc.clicked_at DESC LIMIT 1"
  )
    .bind(visitorId)
    .first();
  return row ? row.link_id : null;
}

/**
 * Prompt 03 (de automation): lees alle click_counts, hersorteer hoog -> laag,
 * en schrijf de nieuwe volgorde terug naar position.
 */
export async function resortByClicks(env) {
  const links = await getLinksByClicks(env); // al gesorteerd hoog -> laag
  const statements = links.map((link, index) =>
    env.DB.prepare("UPDATE links SET position = ? WHERE id = ?").bind(
      index + 1,
      link.id
    )
  );
  if (statements.length > 0) {
    await env.DB.batch(statements); // atomair in één transactie
  }
  return links.length;
}
