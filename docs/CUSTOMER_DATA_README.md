# KOTY CONO — Customer data extension

Status: approved for activation on 23 October 2026. The Cloudflare backend has been deployed and connected to D1. Production admin access uses owner-restricted Cloudflare Access, not the development access-key form. See LIVE_DEPLOYMENT.md for verification and final storefront deployment state. The existing storefront is an HTML/JavaScript demo, not a live payment/order service.

This package is an **overlay for `234308-hash/Koty-Cono`**, not a replacement for the full repository. Keep the original assets, catalogue and cinematic files. The package adds the backend and dashboard, optional research/analytics UI and integration into the current checkout. It preserves the eight original catalogue records, six individual flavours, EGP prices, size/topping options, coupon, delivery calculation and browser-only checkout.

## What you get

- A Cloudflare Worker API with persistent D1 SQL storage.
- An owner dashboard with email verification restricted to the configured sole owner, 7/30/90/180-day filters, customer search, pagination and CSV exports.
- Demo-basket selections and values, returning research participants, flavour units, opt-in channel/session counts and optional feedback scores.
- Exports for customers, demo baskets, item-level baskets, feedback and activity, ready for Excel or later Power BI analysis. Amounts in raw exports are integer Egyptian piastres; divide by 100 for EGP.
- Explicit, separate consent for research sharing, optional analytics and optional future brand updates. All options start unticked.
- Server-side validation and recalculation from the existing menu. Duplicate requests use an idempotency UUID. Failed saves keep the basket intact.
- Private administrator data erasure with explicit ERASE confirmation. CSV cells neutralise formula-injection prefixes.
- Daily cleanup: research records and demo baskets 180 days; activity 30 days; short-lived abuse counters cleaned daily. Cleanup is scheduled in the Worker configuration and becomes active only after deployment.

The standalone dashboard preview uses **synthetic sample data**. It is a selection/interaction preview, not live customer data or proof of market demand.

## Data boundaries

Checkout research sends name, Egyptian mobile, optional email, city and chosen demo items only after explicit agreement. Precise street address, delivery notes and raw card/wallet credentials are not stored in the backend. Existing browser-local demo receipts may still contain address information; the privacy note explains clearing browser site data.

Feedback is an anonymous appeal score (1–5) plus optional comment. It is not a verified purchase or taste review. Do not encourage users to include personal or health information in comments.

Optional analytics uses a random browser-session reference and stores only allowed event types, recognised product IDs and short source/medium/campaign labels. It does not collect full page/referrer URLs, raw IP addresses, fingerprinting data or ad identifiers. A separate short-lived, salted hash of the network identifier is used solely for abuse controls. Choosing Essential only stops activity collection; withdrawal also requests deletion of this session's earlier events and removes attribution from its linked research baskets. A failed deletion request is visibly reported with a retry action.

Contact identity is self-declared and is not phone-verified. Research participants are not necessarily buyers. Marketing consent records do not send messages or connect to any mailing platform. Only use contact data for the purpose a person agreed to. No past browser-local customer records are automatically migrated.

## Review first

Open `Koty-Cono-Data-Dashboard-Preview.html`. It is self-contained and supports section navigation, date filters, customer search, CSV exports and simulated erasure. It does not send data to a remote service.

The production code uses actual API requests. It never substitutes the sample dashboard data for failed live requests.

## Local integration preview

Requires Node.js 24+. From `backend/`:

```sh
npm run preview
```

The script prints localhost dashboard/storefront URLs and a temporary random access key. It runs the real Worker handler against local SQLite through a D1-compatible boundary adapter. The local database is in memory by default. Set `KOTY_PREVIEW_DATABASE` to a local file to retain it across restarts. This is a local development script, not the cloud deployment path. The local storefront references the current live site's original image assets; the archive does not duplicate those assets.

## Cloud activation — only after approval

1. Confirm that the intended Cloudflare account is on **Workers Free**, with remaining shared free quotas. Do not enable a paid plan to activate this feature.
2. Create a separate D1 database named `koty-cono-customer-data`. Paste the returned real database ID into `backend/wrangler.jsonc`.
3. Apply `backend/migrations/0001_customer_data.sql` to that database with Cloudflare's dashboard or Wrangler migrations.
4. Run `node backend/scripts/generate-access.mjs` privately. Store the random access key in a password manager. Set `ADMIN_PASSWORD_SHA256` and `SESSION_SECRET` as Cloudflare Worker **secrets**. Never paste the plaintext key into frontend code, GitHub or a shared preview. The included tests contain test-only fixture values, not deployment credentials.
5. Deploy the Worker and its `backend/public` assets with the configured DB binding, allowed storefront origins and daily cron. Keep dashboard and API on the same origin. Production sessions use Secure, HttpOnly, SameSite=Strict cookies; admin writes require the exact same Origin. Four-hour sessions expire; rotating SESSION_SECRET invalidates all existing sessions.
6. Confirm unauthenticated customer lists and CSV exports return 401, log in, make one clearly identified test submission and verify its visibility and erasure in the private dashboard. Verify D1 and Worker usage counters, scheduled cleanup and quota behaviour.
7. Set `customer-data-config.js` to the returned HTTPS backend origin and `enabled:true`. Show the final storefront consent wording for review, then upload the approved storefront changes through the existing deployment workflow.
8. Re-test on the actual desktop/mobile browser. Leave cloud collection OFF if backend configuration or validation is incomplete. Real payments and delivery remain disabled regardless of this data feature.

The database ID and frontend endpoint in this preview are deliberately not fabricated. The preparation initially created no cloud resources. The subsequent approved activation deployed a separate D1 database, Worker, owner-only Access application and a daily retention schedule. See LIVE_DEPLOYMENT.md for the activation record.

## Cost basis

Checked 23 October 2026 in official documentation:

- Workers Free: 100,000 dynamic requests/day and 10 ms CPU per invocation.
- D1 Free: 5 million rows read/day, 100,000 rows written/day, 5 GB account storage; individual free database limit 500 MB. Account-wide allowances may already be shared with other projects.
- Free quota exhaustion can fail requests; it does not mean unlimited capacity. The application displays failed order saves rather than pretending success. No automatic paid upgrade or third-party AI service is included.
- Export responses are bounded at 10,000 rows and explicitly refuse larger exports. Choose a shorter period or perform an owner database export. Large exports may need a smaller interval under the free CPU allowance.
- No added domain, paid database or email/SMS service is required for this extension. Existing site hosting/account arrangements remain separate.

Sources:
https://developers.cloudflare.com/workers/platform/pricing/
https://developers.cloudflare.com/d1/platform/pricing/
https://developers.cloudflare.com/d1/platform/limits/
https://developers.cloudflare.com/d1/worker-api/d1-database/

## Maintenance

The backend catalogue is generated from the original store module. When a future approved menu change occurs, run `node backend/scripts/sync-catalog.mjs`, test and deploy both sides together. Never trust client totals or enable live orders by removing a browser label. A real shop needs separately verified fulfilment/payment integration, ownership procedures and operational arrangements.

CSV exports are portable data copies, not a substitute for a recovery backup. Cloudflare database export/recovery is available through the provider; this extension does not create an off-site backup schedule. Exported contact data and backups must follow the same erasure/retention decisions.

## Applied skills

- yj-koty-cono — current code inspection, catalogue/checkout preservation and preview-first boundary.
- yj-marketing-analytics — event grain, metric definitions, demo/real separation, consent-population limits and item-level export.
- mutqin-ui-ux-pro-max — dashboard layout, responsive controls, readable labels, accessible focus states and data export. Its bundled search returned Analytics Dashboard guidance; unrelated Enterprise Gateway marketing-page suggestions and generic blue palette were not used. Cocoa/cream preserves KOTY CONO's identity.
- mutqin-test-driven-development — observed failing persistence/access tests before implementation, then green behaviour tests; two later failing tests exposed city-history and item-export gaps before fixes.
- Library workflow — persisted user-facing review deliverables. Unrelated skills were not invoked simply to inflate the skill count.

## Production identity protection

Production sets AUTH_MODE=access. Cloudflare Access requires the configured owner email and its one-time verification code. The Worker independently verifies the Access JWT RSA signature, issuer, audience, lifetime, application type, subject and exact owner email. OWNER_EMAIL and SESSION_SECRET are secret bindings. Legacy password/cookie login cannot authenticate production. Access protects both dashboard assets and private API/export paths; only the four specific public, consent-gated submission/revocation paths are excepted. Alternate Worker preview URLs are disabled. The development random-key flow remains available only in local testing.

The admin scene uses the existing photographic cone texture in a real WebGL scene with 3D pedestal, orbit and instanced topping geometry. It is not a newly sculpted volumetric ice-cream model. Rendering respects reduced motion, stops while hidden/offscreen, caps pixel ratio/frame rate and falls back to the product poster.
