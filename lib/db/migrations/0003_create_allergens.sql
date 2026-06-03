CREATE TABLE IF NOT EXISTS allergens (
  id text PRIMARY KEY,
  label text NOT NULL,
  icon_path text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
