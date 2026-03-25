CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT NOT NULL,
  card_title TEXT NOT NULL,
  choice_key TEXT NOT NULL,
  choice_label TEXT NOT NULL,
  note TEXT,
  recommended_owner TEXT NOT NULL,
  submitted_by TEXT NOT NULL DEFAULT 'derek',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  request_ip TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS decisions_card_id_created_at_idx
  ON decisions (card_id, created_at DESC);
