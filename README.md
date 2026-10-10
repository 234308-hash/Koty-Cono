# Koty Cono

A responsive ice cream storefront with the chocolate and ivory theme, eight illustrative products, a persistent scroll-driven cone, floating toppings and cream reassembly.

## Run locally

No installation or build step is needed. From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

On Windows with Python installed, use `py -m http.server 8000 --bind 127.0.0.1`. Open http://localhost:8000.

## Deploy on Vercel

The existing Git-connected Vercel projects can deploy the `main` branch. `vercel.json` sets the framework to Other, skips the build step and serves the repository root. Images and animation assets are included in `assets/`.

## Active files

- `index.html`: page sections and shopping dialogs.
- `styles.css`, `motion.css`, `premium.css`: layout, animation placement and chocolate theme.
- `store.js`: sample catalog, EGP prices, customizations and totals.
- `app.js`: filters, wishlist, persistent bag, checkout and scroll choreography.
- `assets/cone-motion.js`: photographic cone, separated cream tiers, toppings and reassembly.

The earlier `checkout.html` route redirects to the active storefront. The earlier styling/scripts and images remain in the repository history and are not loaded by the new storefront.

## Checkout status

Checkout is a browser-local demonstration. It does not process payment, send orders to a merchant or arrange delivery. Cash, card and wallet are preview selections. The form does not request card numbers. A live payment gateway requires the merchant account and backend integration. Prices, imagery, delivery rates and ingredients are illustrative; final nutrition, recipes, allergens and availability need confirmation before real sales.
