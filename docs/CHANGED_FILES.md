# Review scope

Repository inspected: 234308-hash/Koty-Cono, main. Approved activation follows the preview. See LIVE_DEPLOYMENT.md for the deployed revision.

Existing files changed locally:
- index.html — optional feedback form, research-sharing controls, privacy-choice entry and opt-in data scripts.
- app.js — optional API save, failure/retry preservation, research receipt notice and updated privacy disclosure; existing browser-only checkout still works.
- tests/package.json — includes new integration tests.

New files:
- customer-data-config.js — disabled activation switch and empty backend URL.
- customer-data.js / customer-data.css — opt-in analytics, research feedback and minimal-data API client.
- backend/ — Worker, D1 migration, actual administrator dashboard, source catalogue snapshot, local preview, access-key/catalogue scripts and API/HTTP tests.
- tests/customer-data-check.cjs / tests/admin-data-check.cjs — consent, failure and full data-flow tests.
- docs/ — scope, deployment/access guidance, metric definitions and verification.

Unchanged catalogue, styles and original test/scene sources used for verification were read from GitHub. Existing images/3D assets are deliberately not replaced. The source archive is an additive overlay and must not be used to delete or replace the existing repository folder.
