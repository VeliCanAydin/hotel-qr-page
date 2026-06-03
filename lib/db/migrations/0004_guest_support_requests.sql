CREATE TABLE IF NOT EXISTS guest_support_requests (
  id serial PRIMARY KEY,
  guest_name text NOT NULL DEFAULT '',
  room_number text NOT NULL DEFAULT '',
  request_type text NOT NULL DEFAULT 'support',
  issue_category text NOT NULL DEFAULT 'other',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  staff_response text NOT NULL DEFAULT '',
  staff_response_by text NOT NULL DEFAULT '',
  staff_response_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL
);
