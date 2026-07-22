-- ===========================================================================
-- Database schema voor de link-in-bio app
-- ===========================================================================

-- Prompt 01: Profiel dat bovenaan de pagina getoond wordt (foto + naam).
-- Eén rij per handle.
CREATE TABLE IF NOT EXISTS profile (
  handle      TEXT PRIMARY KEY,          -- @handle, bv. "jimmymiddendorp"
  name        TEXT NOT NULL,             -- weergavenaam bovenaan de pagina
  bio         TEXT DEFAULT '',           -- korte regel onder de naam
  photo_url   TEXT DEFAULT ''            -- profielfoto
);

-- Prompt 01: Elke link is een rij in de database.
-- Velden: title, url, click_count, position (exact zoals gevraagd).
-- is_affiliate voegen we toe voor de geavanceerde stap (per-bezoeker pinnen).
CREATE TABLE IF NOT EXISTS links (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  click_count  INTEGER NOT NULL DEFAULT 0,
  position     INTEGER NOT NULL DEFAULT 0,
  is_affiliate INTEGER NOT NULL DEFAULT 0   -- 1 = affiliate link
);

CREATE INDEX IF NOT EXISTS idx_links_position ON links(position);

-- Advanced Prompt: entiteit "Visitor".
-- Elke bezoeker krijgt op zijn eerste bezoek een visitor_id (cookie).
CREATE TABLE IF NOT EXISTS visitors (
  visitor_id  TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL             -- ISO timestamp van eerste bezoek
);

-- Advanced Prompt: entiteit "VisitorClick".
-- Velden: visitor_id, link_id, clicked_at.
CREATE TABLE IF NOT EXISTS visitor_clicks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id  TEXT NOT NULL,
  link_id     INTEGER NOT NULL,
  clicked_at  TEXT NOT NULL,
  FOREIGN KEY (link_id) REFERENCES links(id)
);

CREATE INDEX IF NOT EXISTS idx_visitor_clicks_visitor ON visitor_clicks(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_clicks_link ON visitor_clicks(link_id);
