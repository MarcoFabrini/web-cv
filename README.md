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
- Colori e sfondo: `meta.palette` (`graphite` | `acid`) e `meta.background` (`terminal` | `none`).

Controllo del file: `npm run check` (eseguito anche prima di ogni build).

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

Titolo, descrizione e immagine per le anteprime social vengono scritti nell'HTML all'avvio del container: dopo averli cambiati, `docker compose restart`. Variabili: `SITE_URL` (URL pubblico, serve per `og:image`) e `OG_LANG` (`it` | `en`).

### Con Traefik
Requisiti: Traefik già attivo, con una rete Docker esterna e un certresolver.
```bash
cp .env.example .env     # DOMAIN, TRAEFIK_NETWORK, TRAEFIK_ENTRYPOINT, TRAEFIK_CERTRESOLVER
docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d --build
```
Il container non pubblica porte. Traefik lo raggiunge sulla sua rete e serve `https://DOMAIN`. `SITE_URL` vale `https://DOMAIN` se non lo imposti.

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
- Colors and background: `meta.palette` (`graphite` | `acid`) and `meta.background` (`terminal` | `none`).

File check: `npm run check` (also runs before every build).

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

Title, description and image for social previews are written into the HTML when the container starts: after changing them, run `docker compose restart`. Variables: `SITE_URL` (public URL, needed for `og:image`) and `OG_LANG` (`it` | `en`).

### With Traefik
Requirements: Traefik already running, with an external Docker network and a certresolver.
```bash
cp .env.example .env     # DOMAIN, TRAEFIK_NETWORK, TRAEFIK_ENTRYPOINT, TRAEFIK_CERTRESOLVER
docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d --build
```
The container publishes no ports. Traefik reaches it on its network and serves `https://DOMAIN`. `SITE_URL` defaults to `https://DOMAIN`.

---

[Unlicense](LICENSE): pubblico dominio, nessuna garanzia / public domain, no warranty.
