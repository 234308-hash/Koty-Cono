# Data and metric dictionary

## Observation grain

| Table | One record represents | Key / join |
|---|---|---|
| customers | Latest self-declared contact profile associated with shared research baskets | UUID; phone unique after Egyptian normalisation |
| orders | One explicitly shared demo basket, timestamped by the server | UUID idempotency key; customer_id |
| order_items | One product + size + topping within a demo basket | order_id, product_id, size, topping |
| consents | Research, optional marketing and optional analytics decisions at basket submission | order_id; notice version and server timestamp |
| events | One allowed interaction after optional analytics consent | UUID event ID; random session_id |
| feedback | One optional, consented visual-appeal score/comment | UUID, recognised product_id |
| rate_limits | A temporary counter for a hashed network/bucket identifier | SHA-256 key, expiry; no raw IP storage |

Orders are **demo=1 only**. This backend refuses live order submissions. All timestamps are UTC ISO strings. Period filters are rolling days from server time, not complete Cairo calendar months. Dashboard timestamp labels use Cairo time. Monetary columns are integer piastres; 100 piastres = EGP 1. Existing KOTY10 and delivery logic are unchanged. Order city is captured at submission rather than rewritten when the returning participant changes their latest profile city.

## Dashboard metrics

| Metric | Definition | Interpretation limit |
|---|---|---|
| Shared demo baskets | Count of saved orders in selected period | Not paid orders or demand |
| Research customers | Distinct customer_id in those baskets | Unverified, self-declared contacts |
| Demo basket value | Sum of total including demo delivery and discounts | Not sales revenue |
| Average demo basket | Sum(total) / number of saved demo baskets, rounded to integer piastres | Zero when there are no baskets |
| Returning participants | Customers with at least 2 saved demo baskets in the selected period | Not lifetime retention or repeat purchases |
| Marketing opt-ins | Current customer profiles opted in, restricted to those with baskets in the period | Self-declared permission; no outreach is automatically sent |
| Flavour selection units | Sum(order_items.qty) grouped by product ID, in selected period | Sharing boxes remain their existing SKU, not expanded into inferred individual flavours |
| Source sessions | Distinct session_id for page_view events, grouped by source | Consenting sessions only; UTM/referral tags assign labels, not causal credit; multi-source sessions can appear in more than one group |
| Shopping journey | Distinct sessions independently counted per event type | Counts need not be monotonic; not a fully joined conversion funnel |
| Feedback score | Mean visual-appeal rating, alongside response count | Optional self-selected research, not verified tasting or purchase feedback |
| Real revenue | EGP 0 | No live payment/order integration exists |

Demographic targeting, ad ROI/ROAS, margin, retention rates, forecast demand and causal marketing recommendations are not computed from these records. They need additional appropriate evidence. The preview's synthetic records are never inserted into the real database.

## Practical decisions this can support later

- Compare which flavour descriptions/products get explored and selected among consenting visitors.
- Read suggestions and appeal scores before designing a new topping or creative test.
- Compare tagged sources and the independently measured shopping stages; investigate drop-off with the population limits above.
- Export item-level records with order keys for a later real basket analysis. Do not present association rules from a handful of demo baskets as evidence of buying behaviour.
- Contact only participants whose current permission allows the intended outreach; do not infer consent from a purchase/demo submission.
