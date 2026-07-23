#!/usr/bin/env bash
# ===========================================================================
# One-command deploy voor de link-in-bio app.
#
# Vooraf (eenmalig): log in op je eigen Cloudflare-account:
#     npx wrangler login
#
# Daarna, vanuit de map linkinbio/:
#     ./deploy.sh "jouw-dashboard-wachtwoord"
#
# Het script:
#   1. maakt de D1-database aan (als die nog niet bestaat)
#   2. zet de database_id automatisch in wrangler.toml
#   3. maakt de tabellen + vult profiel/voorbeeldlinks
#   4. zet je dashboard-wachtwoord als secret
#   5. deployt de Worker en toont je live URL
# ===========================================================================
set -euo pipefail

DB_NAME="linkinbio-db"
PASSWORD="${1:-}"

cd "$(dirname "$0")"

echo "==> 0/5  Dependencies"
[ -d node_modules ] || npm install

echo "==> 1/5  Inloggen controleren"
if ! npx wrangler whoami >/dev/null 2>&1; then
  echo "Je bent nog niet ingelogd. Draai eerst:  npx wrangler login" >&2
  exit 1
fi

echo "==> 2/5  D1-database aanmaken (of hergebruiken)"
CREATE_OUT="$(npx wrangler d1 create "$DB_NAME" 2>&1 || true)"
echo "$CREATE_OUT"

# Haal de database_id op (of die nu net is aangemaakt of al bestond).
DB_ID="$(printf '%s\n' "$CREATE_OUT" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -n1 || true)"
if [ -z "$DB_ID" ]; then
  DB_ID="$(npx wrangler d1 list --json 2>/dev/null | node -e '
    let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      try{const a=JSON.parse(s);const m=a.find(x=>x.name==="'"$DB_NAME"'");
      if(m)process.stdout.write(m.uuid||m.id||"");}catch(e){}
    })')"
fi
if [ -z "$DB_ID" ]; then
  echo "Kon de database_id niet bepalen. Check 'npx wrangler d1 list'." >&2
  exit 1
fi
echo "    database_id = $DB_ID"

echo "==> 3/5  database_id in wrangler.toml zetten"
# Vervang de placeholder of een eerder ingevulde id.
node -e '
  const fs=require("fs");const f="wrangler.toml";
  let t=fs.readFileSync(f,"utf8");
  t=t.replace(/database_id = ".*"/, `database_id = "'"$DB_ID"'"`);
  fs.writeFileSync(f,t);
'

echo "==> 4/5  Tabellen + voorbeelddata"
npx wrangler d1 execute "$DB_NAME" --remote --file=./schema.sql
npx wrangler d1 execute "$DB_NAME" --remote --file=./seed.sql

echo "==> 4b   Dashboard-wachtwoord instellen"
if [ -n "$PASSWORD" ]; then
  printf '%s' "$PASSWORD" | npx wrangler secret put DASHBOARD_PASSWORD
else
  echo "    Geen wachtwoord meegegeven — zet 'm zo:  npx wrangler secret put DASHBOARD_PASSWORD"
fi

echo "==> 5/5  Deploy"
npx wrangler deploy

echo ""
echo "Klaar. Je pagina staat live op de workers.dev-URL hierboven."
echo "Dashboard: <die-URL>/dashboard  (gebruikersnaam maakt niet uit, wachtwoord = wat je instelde)"
