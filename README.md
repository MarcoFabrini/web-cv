# web-cv

Online résumé, frontend only: React + Vite, bilingual (IT/EN), dark/light theme. All content lives in one JSON file.

[Italiano](#italiano) · [English](#english)

---

## Italiano

### Personalizza
```bash
cp public/content/data.example.json public/content/data.json
```
Tutti i tuoi contenuti stanno in `public/content/` (non versionata):
- Testi: `data.json`. I campi tradotti sono `{ "it": "...", "en": "..." }`. Senza `data.json` il sito usa l'esempio.
- Foto/avatar (PNG trasparente): `avatar.png`, poi `meta.avatar: "content/avatar.png"`.
- CV in PDF: `curriculum.pdf` (campo `meta.cv`). Se il file manca, il pulsante non compare.
- Anteprima LinkedIn/social: immagine 1200×627 `og.png`, campo `meta.ogImage`.
- Colori e sfondo: in `.env`, vedi [Palette e sfondo](#palette-e-sfondo).

Controllo del file: `npm run check` (eseguito anche prima di ogni build).

### Palette e sfondo
Si scelgono in `.env` (parti da `cp .env.example .env`):
```bash
PALETTE=graphite
BACKGROUND=terminal
```
| `PALETTE` | | `BACKGROUND` | |
|---|---|---|---|
| `graphite` | grafite, accento ambra (predefinita) | `terminal` | colonne di log che si scrivono (predefinito) |
| `acid` | quasi nero, accento lime / crema e corallo | `grid` | griglia sottile, si illumina vicino al mouse |
| `nord` | blu notte, accento ghiaccio | `dots` | trama di punti che scorre lenta |
| `forest` | verde scuro, accento menta | `aurora` | macchie di colore sfocate in movimento |
| `rose` | prugna, accento rosa | `none` | nessuno sfondo |
| `mono` | bianco e nero | | |

Ogni palette ha la versione scura e quella chiara. Un valore sbagliato viene segnalato nei log e si usa quello predefinito.
- Sviluppo: Vite rilegge `.env` da solo.
- Docker: per cambiare palette o sfondo basta `docker compose up -d`, senza build (un semplice `restart` non legge le variabili nuove).
- Anteprima senza toccare `.env`: aggiungi `?palette=nord&background=grid` all'URL. In sviluppo le trovi anche nella palette dei comandi (Ctrl/⌘ + K).

#### Aggiungere una palette
Ogni palette è un file in `src/palettes/`: il nome del file è il nome da usare in `PALETTE`. Copia una palette esistente e cambia nome e colori:
```bash
cp src/palettes/graphite.css src/palettes/mia.css   # poi PALETTE=mia
```
```css
:root[data-palette="mia"][data-theme="dark"] {
  --bg: #121211;       /* sfondo pagina */
  --card: #1b1b19;     /* sfondo di card e blocchi */
  --fg: #ecebe6;       /* testo */
  --mut: #96928a;      /* testo secondario */
  --line: #ffffff17;   /* bordi e separatori */
  --acc: #f5a524;      /* accento: pulsanti, cursore, barra */
  --acc-fg: #121211;   /* testo sopra l'accento */
  --acc-text: #f7b443; /* accento usato come colore del testo */
}
:root[data-palette="mia"][data-theme="light"] { /* stesse variabili per il tema chiaro */ }
```
Il selettore deve contenere lo stesso nome del file. In sviluppo la palette compare subito; con Docker serve la build (`docker compose up -d --build`). La palette predefinita è `graphite`.

### Sviluppo
```bash
npm install && npm run dev   # http://localhost:5173
```
Le modifiche a `data.json` compaiono da sole, senza ricaricare la pagina.

### Produzione (Docker)
```bash
docker compose up -d --build     # http://localhost:8080
```
`public/content` è montata come volume: dati, foto e PDF si aggiornano modificando i file, senza rebuild. La build serve solo se cambi il codice.

Titolo, descrizione e immagine per le anteprime social vengono scritti nell'HTML all'avvio del container: dopo averli cambiati in `data.json`, `docker compose restart`. Variabili: `SITE_URL` (URL pubblico, serve per `og:image`) e `OG_LANG` (`it` | `en`).

Dopo ogni modifica a `.env` serve `docker compose up -d`: `restart` non rilegge le variabili.

### Con Traefik
Requisiti: Traefik già attivo, con una rete Docker esterna e un certresolver.
```bash
cp .env.example .env     # DOMAIN, TRAEFIK_NETWORK, TRAEFIK_ENTRYPOINT, TRAEFIK_CERTRESOLVER
docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d --build
```
Il container non pubblica porte. Traefik lo raggiunge sulla sua rete e serve `https://DOMAIN`. `SITE_URL` vale `https://DOMAIN` se non lo imposti.

Per non ripetere i `-f` a ogni comando, aggiungi a `.env`:
```bash
COMPOSE_FILE=docker-compose.yml:docker-compose.traefik.yml
```
Da lì in poi basta `docker compose up -d`.

---

## English

### Customize
```bash
cp public/content/data.example.json public/content/data.json
```
All your content lives in `public/content/` (not versioned):
- Text: `data.json`. Translated fields are `{ "it": "...", "en": "..." }`. Without `data.json` the site falls back to the example.
- Photo/avatar (transparent PNG): `avatar.png`, then set `meta.avatar: "content/avatar.png"`.
- PDF résumé: `curriculum.pdf` (`meta.cv` field). If the file is missing, the button is hidden.
- LinkedIn/social preview: 1200×627 image `og.png`, `meta.ogImage` field.
- Colors and background: in `.env`, see [Palette and background](#palette-and-background).

File check: `npm run check` (also runs before every build).

### Palette and background
Pick them in `.env` (start with `cp .env.example .env`):
```bash
PALETTE=graphite
BACKGROUND=terminal
```
| `PALETTE` | | `BACKGROUND` | |
|---|---|---|---|
| `graphite` | graphite, amber accent (default) | `terminal` | columns of log lines typing themselves (default) |
| `acid` | near black, lime accent / cream and coral | `grid` | thin grid that lights up near the mouse |
| `nord` | night blue, ice accent | `dots` | slowly drifting dot pattern |
| `forest` | dark green, mint accent | `aurora` | soft blurred blobs of color, moving |
| `rose` | plum, pink accent | `none` | no background |
| `mono` | black and white | | |

Every palette has a dark and a light version. A wrong value is reported in the logs and the default is used.
- Development: Vite reloads `.env` on its own.
- Docker: to switch palette or background, `docker compose up -d` is enough, no rebuild (a plain `restart` does not read new variables).
- Preview without editing `.env`: add `?palette=nord&background=grid` to the URL. In development they are also in the command palette (Ctrl/⌘ + K).

#### Adding a palette
Each palette is a file in `src/palettes/`: the file name is the value for `PALETTE`. Copy an existing palette and change its name and colors:
```bash
cp src/palettes/graphite.css src/palettes/mine.css   # then PALETTE=mine
```
```css
:root[data-palette="mine"][data-theme="dark"] {
  --bg: #121211;       /* page background */
  --card: #1b1b19;     /* card and block background */
  --fg: #ecebe6;       /* text */
  --mut: #96928a;      /* secondary text */
  --line: #ffffff17;   /* borders and dividers */
  --acc: #f5a524;      /* accent: buttons, cursor, progress bar */
  --acc-fg: #121211;   /* text on top of the accent */
  --acc-text: #f7b443; /* accent used as text color */
}
:root[data-palette="mine"][data-theme="light"] { /* same variables for the light theme */ }
```
The selector must contain the same name as the file. In development the palette shows up right away; with Docker it needs a build (`docker compose up -d --build`). The default palette is `graphite`.

### Development
```bash
npm install && npm run dev   # http://localhost:5173
```
Changes to `data.json` show up on their own, no page reload needed.

### Production (Docker)
```bash
docker compose up -d --build     # http://localhost:8080
```
`public/content` is mounted as a volume: data, photo and PDF update by editing the files, no rebuild. Rebuild only when the code changes.

Title, description and image for social previews are written into the HTML when the container starts: after changing them in `data.json`, run `docker compose restart`. Variables: `SITE_URL` (public URL, needed for `og:image`) and `OG_LANG` (`it` | `en`).

After any change to `.env`, run `docker compose up -d`: `restart` does not reload variables.

### With Traefik
Requirements: Traefik already running, with an external Docker network and a certresolver.
```bash
cp .env.example .env     # DOMAIN, TRAEFIK_NETWORK, TRAEFIK_ENTRYPOINT, TRAEFIK_CERTRESOLVER
docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d --build
```
The container publishes no ports. Traefik reaches it on its network and serves `https://DOMAIN`. `SITE_URL` defaults to `https://DOMAIN`.

To avoid repeating the `-f` flags on every command, add to `.env`:
```bash
COMPOSE_FILE=docker-compose.yml:docker-compose.traefik.yml
```
From then on, `docker compose up -d` is enough.

---

[Unlicense](LICENSE): pubblico dominio, nessuna garanzia / public domain, no warranty.
