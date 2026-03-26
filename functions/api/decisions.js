const MAX_RECENT = 20;

function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
    ...init,
  });
}

function normalizeRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    cardId: row.card_id,
    choiceKey: row.choice_key,
    note: row.note || "",
    createdAt: row.created_at,
  };
}

async function ensureTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT NOT NULL,
        choice_key TEXT NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL
      )`
    )
    .run();
}

async function maybeNotifyTelegram(env, row) {
  const token = env.OPENCLAW_TELEGRAM_BOT_TOKEN;
  const chatId = env.OPENCLAW_DEREK_CHAT_ID;
  if (!token || !chatId) return { sent: false, reason: "telegram-secrets-missing" };

  const note = row.note ? `\n📝 ${row.note.slice(0, 280)}` : "";
  const text = [
    "🫵 Derek input received",
    `card: ${row.cardId}`,
    `choice: ${row.choiceKey}${note}`,
    "site: https://coco-web-4cg.pages.dev/",
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { sent: false, reason: `telegram-${res.status}`, body: body.slice(0, 300) };
  }

  return { sent: true };
}

export async function onRequestGet(context) {
  const db = context.env.DECISION_DB;
  if (!db) {
    return json({
      storage: { configured: false, durable: false },
      recent: [],
    });
  }

  await ensureTable(db);
  const result = await db
    .prepare(
      `SELECT id, card_id, choice_key, note, created_at
       FROM decisions
       ORDER BY id DESC
       LIMIT ?1`
    )
    .bind(MAX_RECENT)
    .all();

  return json({
    storage: { configured: true, durable: true },
    recent: (result.results || []).map(normalizeRow),
  });
}

export async function onRequestPost(context) {
  const db = context.env.DECISION_DB;
  if (!db) {
    return json(
      {
        ok: false,
        error: "storage-not-configured",
        storage: { configured: false, durable: false },
      },
      { status: 503 }
    );
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const cardId = String(payload.cardId || payload.card_id || "").trim();
  const choiceKey = String(payload.choiceKey || payload.choice_key || payload.choice || "").trim().toLowerCase();
  const note = String(payload.note || "").trim();

  if (!cardId || !choiceKey) {
    return json({ ok: false, error: "missing-card-or-choice" }, { status: 400 });
  }

  await ensureTable(db);

  const createdAt = new Date().toISOString();
  const insert = await db
    .prepare(
      `INSERT INTO decisions (card_id, choice_key, note, created_at)
       VALUES (?1, ?2, ?3, ?4)
       RETURNING id, card_id, choice_key, note, created_at`
    )
    .bind(cardId, choiceKey, note || null, createdAt)
    .first();

  const stored = normalizeRow(insert) || {
    id: null,
    cardId,
    choiceKey,
    note,
    createdAt,
  };

  const notification = await maybeNotifyTelegram(context.env, stored).catch((error) => ({
    sent: false,
    reason: "telegram-exception",
    body: String(error?.message || error),
  }));

  return json({
    ok: true,
    stored,
    notification,
    storage: { configured: true, durable: true },
  });
}
