CREATE TABLE IF NOT EXISTS nearby_guide_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  distance text NOT NULL,
  eta text NOT NULL,
  note text NOT NULL,
  phone text,
  map_query text NOT NULL,
  tone text NOT NULL,
  section text NOT NULL,
  icon_key text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now() NOT NULL
);