# HA Webapp

Next.js-app för Home Assistant-kontroll med glasig UI, PIN-inloggning, Cloudflare-tunnel och SMHI-väder. Koden bor i `ha-webapp/`.

## Funktioner
- Lampor/switchar från HA med live polling, snabbåtgärder och long-press modal.
- PIN-inloggning (Hannes/Elvira), middleware-skydd, logout.
- Hemdash med SMHI-temp/nederbörd/vind, HA-kalender, närvaro (device_tracker), bortaläge, steg.
- Bottom-nav (Hem/Lampor/Scener), responsiv layout.

## Krav
- Node 18+.
- HA-token och HA-url i `.env.local`.
- (Valfritt) Cloudflare Tunnel för extern åtkomst.

## Install/Dev
```bash
cd ha-webapp
cp .env.local.example .env.local   # skapa egen fil
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
```
Öppna http://localhost:3000 (eller host-IP:3000).

## Prod (manuellt)
```bash
npm run build
npm run start -- --hostname 0.0.0.0 --port 3000
```

## Miljövariabler (.env.local)
```
HA_URL=http://<din-ha>:8123
HA_TOKEN=<long-lived token>
AUTH_SECRET=<lång slumpad sträng>
HANNES_PIN=<pin>
ELVIRA_PIN=<pin>
SMHI_LAT=<lat>
SMHI_LON=<lon>
```
(.env* är ignorerad i git.)

## Cloudflare Tunnel (exempel)
- `cloudflared tunnel login`
- `cloudflared tunnel create ha-webapp`
- `~/.cloudflared/config.yml`:
```yaml
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: <din-subdomän.dindomän.se>
    service: http://127.0.0.1:3000
  - service: http_status:404
```
- `cloudflared tunnel run ha-webapp`

## Screenshots
- Hem:  
  ![Hem](ha-webapp/public/hem.png)
- Lampor:  
  ![Lampor](ha-webapp/public/lampor.png)
- Popup (long press):  
  ![Popup](ha-webapp/public/popup.png)
- Inloggning:  
  ![Inloggning](ha-webapp/public/inloggning.png)
- Scener (placeholder):  
  ![Scener](ha-webapp/public/scener.png)
- Home Assistant exponeras aldrig direkt mot internet
- All extern trafik går via Cloudflare Tunnel
- HTTPS hanteras av Cloudflare
- Home Assistant-token används endast server-side

---

## Status

Projektet är under aktiv utveckling.

Planerat framåt:
- Förbättrad design och animationer
- Kalenderintegration
- Realtidsuppdateringar via WebSocket
- Valfri autentisering via Cloudflare Access

---

## Licens

Privat projekt. Ej avsett för offentlig distribution.
