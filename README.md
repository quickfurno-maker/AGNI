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

AGNI uses two deliberately separate Android artifact classes:

- **Engineering debug APK** — built automatically from `main` for device testing. It is explicitly labeled `ENGINEERING_DEBUG` and must never be treated as a production release.
- **Private release APK** — built only by the manually dispatched `Android Private Release APK` workflow inside the `agni-android-production` environment. It requires the owner-controlled QuickFurno signing keystore and passwords, refuses missing signing material, verifies that the APK is not Android-debug signed, and publishes a SHA-256 plus release manifest bound to the source SHA and signing certificate.

Release signing is injected during Expo prebuild through `plugins/withAgniReleaseSigning.js`, so `expo prebuild --clean` cannot silently restore debug signing for a release build. Required GitHub secrets are `AGNI_ANDROID_KEYSTORE_B64`, `AGNI_ANDROID_STORE_PASSWORD`, `AGNI_ANDROID_KEY_ALIAS`, and `AGNI_ANDROID_KEY_PASSWORD`. The private key must remain outside Git and outside the application package.

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
