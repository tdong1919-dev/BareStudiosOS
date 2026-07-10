-- Capture the prospect's biggest stated bottleneck for outbound follow-up.
ALTER TABLE demo_requests
  ADD COLUMN IF NOT EXISTS priority text;

CREATE INDEX IF NOT EXISTS idx_demo_requests_priority
  ON demo_requests(priority);
