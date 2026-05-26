ALTER TABLE guest_support_requests
  ADD COLUMN IF NOT EXISTS request_type text NOT NULL DEFAULT 'support';

ALTER TABLE guest_support_requests
  ADD COLUMN IF NOT EXISTS issue_category text NOT NULL DEFAULT 'other';

ALTER TABLE guest_support_requests
  DROP COLUMN IF EXISTS email;

ALTER TABLE guest_support_requests
  DROP COLUMN IF EXISTS category;
