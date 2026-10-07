# AGNI Android Owner App

Private, self-hosted Android command interface for QuickFurno.

## Product boundary

AGNI is intentionally **not** a duplicate of the QuickFurno, Jarvis or AGNI dashboards.

It provides:

- live owner-level system and business pulse
- one unified AI conversation across QuickFurno + Jarvis + AGNI
- correlated incident intelligence
- contextual Investigate / Prepare Fix workflows
- biometric-gated owner approvals
- meaningful live activity
- deep links from Telegram notifications

All OpenAI and production credentials stay server-side behind the AGNI Owner Gateway.

## Android identity

- Package: `com.quickfurno.agni`
- Scheme: `agni://`
- Distribution: direct signed APK / internal hosting
- Play Store: not required

## Development

```bash
pnpm install
pnpm start
pnpm typecheck
pnpm lint
```

## Direct APK

The repository includes an EAS `production-apk` profile and a GitHub Actions internal-APK build. Phase 1 intentionally produces an installable internal APK; the generated Expo release project still uses the default debug signing identity. **Do not treat that artifact as production-signed.** Phase 3 replaces it with a stable private QuickFurno release key, signed release manifest and checksum before self-hosted production distribution.

## Required Owner Gateway API

- `POST /v2/owner/device/enroll`
- `GET /v2/owner/session`
- `GET /v2/owner/overview`
- `POST /v2/owner/chat`
- `GET /v2/owner/incidents`
- `GET /v2/owner/incidents/:id`
- `GET /v2/owner/approvals`
- `POST /v2/owner/approvals/:id/decision`

The backend must remain fail-closed for production mutations. Approval in the app authorizes only the exact proposal fingerprint presented to the owner; it must never translate into arbitrary shell, SQL or infrastructure access.
