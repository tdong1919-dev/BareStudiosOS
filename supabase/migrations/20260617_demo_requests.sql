-- ============================================================
-- Demo requests — leads captured from the /salons landing page.
-- ============================================================
CREATE TABLE IF NOT EXISTS demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  salon_name text,
  phone text,
  website text,
  message text,
  source text NOT NULL DEFAULT 'salons-landing',
  status text NOT NULL DEFAULT 'new',   -- new | contacted | booked | closed
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- The public form submits through the service role (bypasses RLS), so no anon
-- read access is granted. This INSERT policy keeps things working if a future
-- anon-key path is added, while SELECT stays closed to protect lead data.
CREATE POLICY "anyone can request a demo" ON demo_requests
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_demo_requests_created ON demo_requests(created_at DESC);
