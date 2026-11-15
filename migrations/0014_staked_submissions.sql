CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  creator_handle TEXT NOT NULL,
  title TEXT NOT NULL,
  payload_content TEXT NOT NULL,
  stake_zk INTEGER NOT NULL DEFAULT 50 CHECK (stake_zk >= 0),
  status TEXT NOT NULL CHECK (
    status IN ('PENDING_REVIEW', 'STAKED', 'PUBLISHING', 'PUBLISHED', 'REJECTED')
  ),
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_status_created
  ON submissions(status, created_at DESC);
