#!/bin/sh
set -eu

ROOT=/usr/share/nginx/html
TEMPLATE=/etc/web-cv/index.html
DATA="$ROOT/content/data.json"
[ -f "$DATA" ] || DATA="$ROOT/content/data.example.json"
OG_LANG="${OG_LANG:-it}"
SITE_URL="${SITE_URL:-}"

PALETTE="${PALETTE:-}"
BACKGROUND="${BACKGROUND:-}"

valid() {
    case "$2" in ''|*[!a-z0-9-]*) return 1 ;; esac
    case " $1 " in *" $2 "*) return 0 ;; esac
    return 1
}

theme() {
    for pair in "palette:$PALETTE" "background:$BACKGROUND"; do
        key="${pair%%:*}" value="${pair#*:}"
        [ -n "$value" ] || continue
        options="$(sed -n "s/.*<meta name=\"cv-$key\" content=\"[^\"]*\" data-options=\"\([^\"]*\)\".*/\1/p" "$ROOT/index.html")"
        if ! valid "$options" "$value"; then
            echo "web-cv: $key '$value' non valido, resta quello predefinito (valori: $options)" >&2
            continue
        fi
        sed -i "s|<meta name=\"cv-$key\" content=\"[^\"]*\"|<meta name=\"cv-$key\" content=\"$value\"|" "$ROOT/index.html"
        echo "web-cv: $key $value"
    done
}

cp "$TEMPLATE" "$ROOT/index.html"

if ! jq empty "$DATA" 2>/tmp/jq-error; then
    echo "web-cv: $DATA non valido, meta tag non aggiornati: $(cat /tmp/jq-error)" >&2
    theme
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

theme
echo "web-cv: meta tag generati da $DATA (lingua $OG_LANG)"
