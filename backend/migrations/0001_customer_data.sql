PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS customers (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE,
 email TEXT NOT NULL DEFAULT '', city TEXT NOT NULL,
 marketing_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(marketing_opt_in IN(0,1)),
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY, customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
 created_at TEXT NOT NULL, demo INTEGER NOT NULL CHECK(demo=1),
 city TEXT NOT NULL, payment TEXT NOT NULL CHECK(payment IN('cash','card','wallet')),
 subtotal INTEGER NOT NULL, discount INTEGER NOT NULL, delivery INTEGER NOT NULL, total INTEGER NOT NULL,
 coupon TEXT NOT NULL DEFAULT '', payload_hash TEXT NOT NULL,
 session_id TEXT, source TEXT, medium TEXT, campaign TEXT,
 consent_version TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS order_items (
 order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 product_id TEXT NOT NULL, size TEXT NOT NULL, topping TEXT NOT NULL,
 qty INTEGER NOT NULL CHECK(qty BETWEEN 1 AND 10), unit_price INTEGER NOT NULL,
 PRIMARY KEY(order_id,product_id,size,topping)
);
CREATE TABLE IF NOT EXISTS consents (
 order_id TEXT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
 customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
 research_opt_in INTEGER NOT NULL CHECK(research_opt_in=1),
 marketing_opt_in INTEGER NOT NULL CHECK(marketing_opt_in IN(0,1)),
 analytics_opt_in INTEGER NOT NULL CHECK(analytics_opt_in IN(0,1)),
 notice_version TEXT NOT NULL, recorded_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
 id TEXT PRIMARY KEY, session_id TEXT NOT NULL, type TEXT NOT NULL,
 product_id TEXT, source TEXT NOT NULL, medium TEXT NOT NULL, campaign TEXT NOT NULL,
 created_at TEXT NOT NULL, notice_version TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS feedback (
 id TEXT PRIMARY KEY, product_id TEXT NOT NULL,
 rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT NOT NULL,
 created_at TEXT NOT NULL, notice_version TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS orders_customer ON orders(customer_id,created_at);
CREATE INDEX IF NOT EXISTS events_created ON events(created_at,type);
CREATE INDEX IF NOT EXISTS events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS feedback_created ON feedback(created_at);
CREATE INDEX IF NOT EXISTS consents_customer ON consents(customer_id);
CREATE INDEX IF NOT EXISTS rate_expiry ON rate_limits(expires);
