# Pairing Code API (WhatsApp-style)
Session name: 𝐃𝐀𝐌𝐎𝐍

## Endpoints
- `GET /pair` — create new pairing entry (returns pairId, code, sessionName, status, createdAt, expiresAt)
- `GET /pair/:pairId` — get status for a pair
- `POST /pair/confirm` — confirm pairing (body JSON: { pairId, code })
- `GET /` — simple ping

## Run locally
```bash
npm install
npm start
```

## Deploy to Render
1. Push this project to GitHub.
2. On Render create a new Web Service, connect to repo.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. After deploy your `/pair` endpoint will be available at `https://<your-service>.onrender.com/pair`

## Notes
- Pair codes expire after 5 minutes.
- Sessions are saved in `sessions.json` for simple persistence.
