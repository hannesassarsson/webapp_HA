# HA Web Dashboard

En egenbyggd webbaserad dashboard för Home Assistant, byggd med Next.js och exponerad säkert via Cloudflare Tunnel.
Dashboarden ersätter eller kompletterar Home Assistants inbyggda UI med ett mer skräddarsytt gränssnitt.

Projektet körs lokalt i Home Assistant-miljön och kan nås både på LAN och externt via egen domän.

---

## Funktioner

- Anpassad dashboard för Home Assistant
- Kommunikation med Home Assistant REST API
- Stöd för lampor, switchar, scener och script
- Publik åtkomst utan port forwarding via Cloudflare Tunnel
- HTTPS via Cloudflare
- Responsivt gränssnitt för mobil, surfplatta och desktop

---

## Teknikstack

- Next.js (App Router)
- Node.js
- TypeScript
- Home Assistant REST API
- Cloudflare Tunnel (cloudflared)
- Cloudflare DNS

---

## Projektstruktur

ha-webapp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── ha/
│   │   │       ├── states/
│   │   │       └── service/
│   │   ├── lampor/
│   │   ├── scener/
│   │   └── page.tsx
│   ├── components/
│   └── lib/
├── public/
├── package.json
├── next.config.ts
└── README.md

---

## Miljövariabler

Skapa en fil `.env.local` i projektroten:

HA_URL=http://192.168.0.41:8123
HA_TOKEN=LONG_LIVED_ACCESS_TOKEN

HA_URL ska peka på Home Assistant internt.
HA_TOKEN är en Long-Lived Access Token från Home Assistant.

---

## Lokal utveckling

Installera beroenden:

npm install

Starta utvecklingsserver:

npm run dev

Applikationen nås på:

http://localhost:3000

---

## Production build

Bygg projektet:

npm run build

Starta i production-läge:

npm run start

Servern lyssnar på port 3000.

---

## Cloudflare Tunnel

Applikationen exponeras externt via Cloudflare Tunnel.

Tunnel körs med:

cloudflared tunnel run ha-dashboard

Public hostname konfigureras i Cloudflare Dashboard:

Subdomain: dashboard  
Domain: hanneselvirapilgrimsgatan.org  
Service: http://192.168.0.41:3000  

---

## Autostart

Applikationen kan startas automatiskt vid boot via cron:

@reboot /root/start-ha-webapp.sh

---

## Säkerhet

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