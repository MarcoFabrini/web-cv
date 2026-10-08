#!/bin/sh
set -eu

ROOT=/usr/share/nginx/html
TEMPLATE=/etc/web-cv/index.html
DATA="$ROOT/content/data.json"
[ -f "$DATA" ] || DATA="$ROOT/content/data.example.json"
OG_LANG="${OG_LANG:-it}"
SITE_URL="${SITE_URL:-}"

cp "$TEMPLATE" "$ROOT/index.html"

if ! jq empty "$DATA" 2>/tmp/jq-error; then
    echo "web-cv: $DATA non valido, meta tag non aggiornati: $(cat /tmp/jq-error)" >&2
    exit 0
fi

TAGS="$(jq -r --arg l "$OG_LANG" --arg u "$SITE_URL" '
  def loc: if type == "object" then (.[$l] // .it // .en // "") else (. // "") end;
  def abs: if . == "" then "" elif test("^https?://") then . elif $u == "" then "" else ($u | rtrimstr("/")) + "/" + . end;
  (.meta.siteTitle | loc) as $t
  | (.meta.siteDescription | loc) as $d
  | ((.meta.ogImage // "") | loc | abs) as $img
  | [
      "<title>\($t | @html)</title>",
      "<meta name=\"description\" content=\"\($d | @html)\">",
      "<meta property=\"og:type\" content=\"profile\">",
      "<meta property=\"og:title\" content=\"\($t | @html)\">",
      "<meta property=\"og:description\" content=\"\($d | @html)\">",
      (if $u != "" then "<meta property=\"og:url\" content=\"\($u | @html)\">" else empty end),
      (if $img != "" then "<meta property=\"og:image\" content=\"\($img | @html)\">", "<meta name=\"twitter:card\" content=\"summary_large_image\">"
       else "<meta name=\"twitter:card\" content=\"summary\">" end)
    ] | map("  " + .) | join("\n")
' "$DATA")"

export TAGS
awk '
  /<title>|name="description"|property="og:|name="twitter:/ { next }
  /<\/head>/ { print ENVIRON["TAGS"] }
  { print }
' "$TEMPLATE" | sed "s/<html lang=\"[a-z]*\"/<html lang=\"$OG_LANG\"/" > "$ROOT/index.html"

echo "web-cv: meta tag generati da $DATA (lingua $OG_LANG)"
