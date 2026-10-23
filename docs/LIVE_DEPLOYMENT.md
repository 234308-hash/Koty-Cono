# Approved activation — 23 October 2026

The owner approved activation and requested a premium 3D design with exclusive administrator access.

## Cloud service

- Backend/dashboard: https://koty-cono-customer-data.youssef-aioffice.workers.dev/
- Separate D1 database: koty-cono-customer-data, ID 467e520c-61c4-4630-b42a-27dcdadee542.
- Worker API upload succeeded; deployment ID f00bb86af5fd4392b1fcef649c19d4c1; compiled startup 2 ms.
- Cloudflare Access owner application: e463f9a6-6d62-46bf-b783-91905c29acb5. Its sole Allow rule targets the verified account owner's email, using the account's existing email one-time-pin provider. No other email, domain, service token or public rule grants administrator access.
- Separate Access application 4538119d-8f41-409b-91fb-ee7fe6457db5 excepts only `/api/orders`, `/api/events`, `/api/feedback`, `/api/analytics/revoke` so public customers can submit consented data. These endpoints cannot read the data tables.
- Production sets AUTH_MODE=access. The Worker additionally verifies RSA signature, issuer, audience, expiration/not-before, application type, subject and exact owner email. Legacy development login cannot authenticate production.
- OWNER_EMAIL and SESSION_SECRET are Cloudflare secret bindings; no production secret is stored in source.
- Worker preview URLs are disabled. Daily retention cron `17 2 * * *` UTC is configured.
- No paid subscription, custom domain or email/SMS marketing service was enabled. Billing APIs are unavailable to this OAuth connection, so the account's complete billing state cannot be independently inspected. The implementation uses existing account services without requesting a paid plan change.

## Hosted verification before storefront activation

- A real browser reached Cloudflare Access sign-in for an unauthenticated dashboard request.
- Unauthenticated root, private summary and customer CSV URLs returned 302 to the configured Access identity domain. Public GET `/api/orders` returned 405 and no data.
- A public API preflight with the actual storefront Origin returned 204 with the exact allowed CORS origin.
- A real browser on the existing storefront submitted a synthetic demo basket: HTTP 201, server subtotal 9500, delivery 5000, total 14500 piastres. Repeating the same idempotency key returned HTTP 200 with the same totals.
- An anonymous consented feedback submission returned 201. SQL inspection confirmed the stored basket in the real D1 database. The exact test customer/basket and feedback were then erased; counts were verified at zero.
- Owner-positive browser sign-in is deliberately left to the owner completing their own email verification code. No verification message was requested or read by the assistant, and no secondary administrator bypass was created.

## Design and local verification

- Existing photographic cone in a real Three.js scene with 3D pedestal, orbit and instanced sprinkles; cream/chocolate dimensional cards and bars. This is a product photograph positioned in 3D, not a new fully sculpted dessert model.
- Reduced-motion/poster fallback, lazy loading, bounded pointer movement, capped pixel ratio/frame rate, offscreen/hidden pause and motion toggle.
- 29 new tests pass (20 backend/HTTP/Access, 7 data-client, 2 UI/full-flow), plus the existing shop and 199-frame scene checks at five viewport sizes.
- Cloud Chromium desktop (1440×1050) and mobile (390×844) renders of synthetic data confirmed no horizontal overflow, a visible WebGL canvas, hidden fallback poster and no window error. Both compositions were visually inspected.
- Public storefront deployment is the Git-connected build of the commit containing this file. The strict build allowlist excludes private admin/backend/test/docs source from the Vercel static output.

The checkout remains demo-only; research basket values are not revenue. Collection is optional, and only the configured owner can access the dashboard and exports.

## Owner session recovery fix — 23 October 2026

An owner sign-in was allowed by Access at 19:15 UTC, but the application returned a raw JSON 401. The validator only read the assertion header and ignored the runtime Access identity and application cookie. The fix accepts Cloudflare-provided `ctx.access` only with the exact configured audience and owner email, or verifies the application JWT from its header/cookie with the same RSA signature, issuer, audience and lifetime checks. No Access policy, owner identity, public submission route or data record was changed.

Root navigation failures now render a branded recovery page; private APIs still return JSON 401. Production session expiry offers email-session recovery rather than the development password form. Regression tests cover cookie-only requests, runtime identity mismatch, owner shell rendering, blocked private APIs and the expired-session UI. Positive completion of the owner's email flow remains for the owner to confirm; no OTP is requested by the assistant.
