import { decisionInbox, decisionCardMap } from "../../shared/decision-cards.js";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers || {})
    }
  });
}

function getStorageStatus(env) {
  const configured = Boolean(env?.DECISION_DB);

  return {
    configured,
    binding: configured ? "DECISION_DB" : null,
    provider: configured ? "cloudflare-d1" : "unbound",
    durable: configured,
    notificationGap:
      "No Telegram or other push notification is emitted from this repo yet. Saves can persist, but they are silent.",
    integrationRequired: configured
      ? null
      : "Bind a Cloudflare D1 database to the Pages project as DECISION_DB to make submissions durable in production."
  };
}

async function ensureSchema(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS decisions (
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
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS decisions_card_id_created_at_idx
        ON decisions (card_id, created_at DESC)`
    )
    .run();
}

async function loadRecent(db) {
  const { results = [] } = await db
    .prepare(
      `SELECT id, card_id, card_title, choice_key, choice_label, note, recommended_owner, submitted_by, created_at
       FROM decisions
       ORDER BY datetime(created_at) DESC, id DESC
       LIMIT 12`
    )
    .all();

  const latestByCard = {};
  for (const row of results) {
    if (!latestByCard[row.card_id]) {
      latestByCard[row.card_id] = row;
    }
  }

  return {
    recent: results,
    latestByCard
  };
}

function normalizePayload(payload) {
  return {
    cardId: typeof payload?.cardId === "string" ? payload.cardId.trim() : "",
    choiceKey: typeof payload?.choiceKey === "string" ? payload.choiceKey.trim().toLowerCase() : "",
    note: typeof payload?.note === "string" ? payload.note.trim() : "",
    submittedBy:
      typeof payload?.submittedBy === "string" && payload.submittedBy.trim()
        ? payload.submittedBy.trim().slice(0, 80)
        : "derek"
  };
}

function validatePayload(payload) {
  const card = decisionCardMap.get(payload.cardId);
  if (!card) {
    return { ok: false, message: "Unknown cardId." };
  }

  const allowed = ["a", "b", "c", "other"];
  if (!allowed.includes(payload.choiceKey)) {
    return { ok: false, message: "choiceKey must be one of a, b, c, or other." };
  }

  if (payload.choiceKey === "other" && !payload.note) {
    return { ok: false, message: "note is required when choiceKey is other." };
  }

  if (payload.note.length > 600) {
    return { ok: false, message: "note is too long." };
  }

  const choiceLabel = payload.choiceKey === "other" ? "Other" : card.options[payload.choiceKey];

  return {
    ok: true,
    card,
    choiceLabel
  };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      ...jsonHeaders,
      allow: "GET, POST, OPTIONS"
    }
  });
}

export async function onRequestGet(context) {
  const storage = getStorageStatus(context.env);
  let summary = {
    recent: [],
    latestByCard: {}
  };

  if (context.env?.DECISION_DB) {
    await ensureSchema(context.env.DECISION_DB);
    summary = await loadRecent(context.env.DECISION_DB);
  }

  return json({
    ok: true,
    generatedAt: decisionInbox.generatedAt,
    notificationGap: decisionInbox.notificationGap,
    storage,
    cards: decisionInbox.cards,
    summary
  });
}

export async function onRequestPost(context) {
  const storage = getStorageStatus(context.env);
  if (!context.env?.DECISION_DB) {
    return json(
      {
        ok: false,
        error: "Decision storage is not configured for this deploy.",
        storage
      },
      { status: 503 }
    );
  }

  let rawPayload;
  try {
    rawPayload = await context.request.json();
  } catch {
    return json({ ok: false, error: "Expected JSON body." }, { status: 400 });
  }

  const payload = normalizePayload(rawPayload);
  const validation = validatePayload(payload);
  if (!validation.ok) {
    return json({ ok: false, error: validation.message }, { status: 400 });
  }

  await ensureSchema(context.env.DECISION_DB);

  const requestIp = context.request.headers.get("CF-Connecting-IP") || null;
  const userAgent = context.request.headers.get("user-agent") || null;

  const result = await context.env.DECISION_DB.prepare(
    `INSERT INTO decisions (
      card_id,
      card_title,
      choice_key,
      choice_label,
      note,
      recommended_owner,
      submitted_by,
      request_ip,
      user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      validation.card.id,
      validation.card.title,
      payload.choiceKey,
      validation.choiceLabel,
      payload.note || null,
      validation.card.recommendedOwner,
      payload.submittedBy,
      requestIp,
      userAgent
    )
    .run();

  const createdAt = new Date().toISOString();

  return json({
    ok: true,
    storage,
    decision: {
      id: result.meta?.last_row_id || null,
      cardId: validation.card.id,
      cardTitle: validation.card.title,
      choiceKey: payload.choiceKey,
      choiceLabel: validation.choiceLabel,
      note: payload.note,
      submittedBy: payload.submittedBy,
      recommendedOwner: validation.card.recommendedOwner,
      createdAt
    }
  });
}
