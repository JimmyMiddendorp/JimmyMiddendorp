-- ===========================================================================
-- Voorbeelddata voor @jimmymiddendorp
-- Pas titels/urls gerust aan naar je echte links.
-- ===========================================================================

INSERT OR REPLACE INTO profile (handle, name, bio, photo_url) VALUES (
  'jimmymiddendorp',
  'Jimmy Middendorp',
  'Personal branding voor experts — word de #1 in jouw vakgebied.',
  'https://avatars.githubusercontent.com/u/0?v=4'
);

-- Links. position bepaalt de volgorde (laag = boven).
-- is_affiliate = 1 markeert affiliate links (voor per-bezoeker pinnen).
INSERT INTO links (title, url, click_count, position, is_affiliate) VALUES
  ('Werk met mij',            'https://persoonlijkmerk.nl/diensten.html',      0, 1, 0),
  ('Volg mij op LinkedIn',    'https://www.linkedin.com/in/jimmymiddendorp/',  0, 2, 0),
  ('Bekijk succesverhalen',   'https://persoonlijkmerk.nl/succesverhalen.html',0, 3, 0),
  ('Gratis merk-scan',        'https://persoonlijkmerk.nl/pricing.html',       0, 4, 0),
  ('Mijn favoriete tool',     'https://example.com/affiliate-tool',            0, 5, 1);
