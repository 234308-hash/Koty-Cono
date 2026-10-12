# KOTY CONO

Chocolate-and-ivory storefront with a cinematic introduction, scroll-driven product scene, six interactive flavor presentations and a complete browser-local demo shop. The original catalog is unchanged: six flavors plus Rainbow Duo and Happy Cup Trio, with the same EGP prices, size upgrades, toppings, KOTY10 discount and delivery rules.

## Run

No frontend installation or build is required. Serve the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000. ES modules require HTTP; opening index.html directly as a file does not enable WebGL.

## Cinematic scenes

- A 6.6-second introduction follows the supplied reference's calm opening, radial ingredient explosion, camera movement and final editorial composition. Skip and Replay controls are available; scrolling or navigation immediately interrupts the introduction.
- The primary hero uses the original regular vanilla waffle cone. Its photographic cream layers separate in a Three.js perspective scene and return to their original positions. The cone remains rigid.
- Photographic ingredient textures move on independent depth trajectories. Sauce ribbons and droplets use actual 3D geometry; sprinkles and droplets are instanced meshes.
- Six flavor controls use the original product records. Coordinated ingredient, product, copy and palette transitions keep displayed prices and bag items consistent, including rapid consecutive selections.
- The renderer is lazy-loaded and vendored locally (Three.js 0.180.0, MIT license in assets/vendor/THREE-LICENSE.txt). Product and ingredient atlases use WebP with alpha. Desktop uses the original 1024×1536 cone; smaller screens use the lightweight poster.
- Pixel ratio and frame rate are capped. Animation pauses when hidden, outside scene sections, or behind shopping dialogs. A canvas fallback handles unavailable/lost WebGL contexts. Reduced-motion mode uses a static canvas composition and immediate flavor changes without loading Three.js.

Scenes combine high-quality photographic cutouts with 3D perspective and geometry. Product photography preserves recognizable food texture; it is not a fully sculpted volumetric model of each dessert. Reference footage is not embedded in the website.

## Shopping

Search, categories, sorting, favorites, product details and allergens, regular/large sizes, add-ons, cart quantities/removal, coupon, delivery totals, checkout and downloadable demo receipts remain available. Bag and favorites retain the existing localStorage keys. All customer-facing text is English.

Checkout is a demonstration. Cash, card and wallet are preview selections. No money is collected, no order is sent to a merchant and no delivery is arranged. The form never requests card or wallet credentials. Original illustrative menu and nutrition notices remain in place.

## Verification

With Node.js 24 or newer:

```sh
cd tests
npm ci --ignore-scripts
npm test
```

DOM tests exercise the actual store and controller code: flavors, original prices, customizations, favorites, catalog controls, bag operations, coupon and delivery thresholds, all three demo payment selections, confirmations, policies and mobile navigation. Scene tests step through 199 animation frames at five viewport sizes, check finite transforms, rigid cone and exact reassembly, and check all six flavor texture selections.

Validation also includes syntax checks, asset/anchor resolution, local HTTP serving and offline canvas renders. Automated approval review blocked downloading a browser in the execution environment; live browser layout, GPU pixels, touch rendering and real-device performance have not been visually verified. Scene tests use a renderer stand-in and do not prove GPU rendering quality.

## Deployment

Existing Git-connected Vercel projects deploy main. Existing vercel.json remains unchanged: framework Other, no build step, repository-root static output. Legacy /checkout and /checkout.html routes redirect to the current storefront.

Active entry points: index.html, styles.css, cinematic.css, store.js, app.js, cinematic.js, and assets/cinematic/. Earlier animation/styles remain in the repository and are not loaded by this version.
