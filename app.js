import { decisionInbox } from "./shared/decision-cards.js";

const inboxRoot = document.querySelector("[data-decision-inbox]");
const storageBadge = document.querySelector("[data-storage-badge]");
const storageLine = document.querySelector("[data-storage-line]");
const responseLog = document.querySelector("[data-response-log]");
const historySpotlight = document.querySelector("[data-history-spotlight]");
const notificationGap = document.querySelector("[data-notification-gap]");
const localKey = "coco-web-decision-fallback";

const localFallback = readLocalFallback();
let latestRemoteByCard = {};
let storageState = {
  configured: false,
  provider: "unavailable",
  durable: false,
  integrationRequired: "Pages Function not reachable yet."
};

function readLocalFallback() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(localKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalFallback(entries) {
  window.localStorage.setItem(localKey, JSON.stringify(entries.slice(0, 24)));
}

function rememberLocalFallback(entry) {
  localFallback.unshift(entry);
  writeLocalFallback(localFallback);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatTimestamp(value) {
  if (!value) return "just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function getLastKnownDecision(cardId) {
  return latestRemoteByCard[cardId] || localFallback.find((entry) => entry.cardId === cardId) || null;
}

function getChoiceLabel(card, choiceKey) {
  if (choiceKey === "other") return "Other";
  return card?.options?.[choiceKey]?.label || String(choiceKey || "Other").toUpperCase();
}

function normalizeRemoteDecision(row) {
  if (!row?.cardId) return null;

  const card = decisionInbox.cards.find((entry) => entry.id === row.cardId);
  return {
    ...row,
    cardTitle: row.cardTitle || card?.title || row.cardId,
    choiceLabel: row.choiceLabel || getChoiceLabel(card, row.choiceKey),
    note: row.note || "",
    source: row.source || "remote"
  };
}

function buildLatestRemoteByCard(recent = []) {
  return recent.reduce((accumulator, row) => {
    if (!accumulator[row.cardId]) accumulator[row.cardId] = row;
    return accumulator;
  }, {});
}

function getRecentRemoteDecisions(payload = {}) {
  const recent = payload.summary?.recent || payload.recent || [];
  return recent.map(normalizeRemoteDecision).filter(Boolean);
}

function getHistoryRows(recent = [], limit = 8) {
  const fallbackRows = localFallback.map((entry) => ({ ...entry, source: "local" }));
  return [...recent, ...fallbackRows]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, limit);
}

function renderChoiceButtons(card) {
  return Object.entries(card.options)
    .map(
      ([key, option]) => `
        <button type="button" class="choice-button" data-choice-key="${escapeHtml(key)}">
          <div class="choice-topline">
            <span class="choice-key">${escapeHtml(key.toUpperCase())}</span>
            <span class="choice-title">${escapeHtml(option.label)}</span>
          </div>
          <span class="choice-detail">${escapeHtml(option.detail)}</span>
        </button>
      `
    )
    .join("");
}

function renderSupportLinks(card) {
  return card.links
    .map(
      (link) => `
        <a href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">
          ${escapeHtml(link.label)}
        </a>
      `
    )
    .join("");
}

function renderInbox() {
  if (!inboxRoot) return;

  const activeCards = decisionInbox.cards.filter((card) => !latestRemoteByCard[card.id]);

  if (!activeCards.length) {
    inboxRoot.innerHTML = `
      <div class="log-empty artifact-list-empty">
        <strong>Inbox clear.</strong>
        <p>All current cards already have a saved answer. Check the saved history just below for the latest direction and follow-through.</p>
      </div>
    `;
    return;
  }

  inboxRoot.innerHTML = activeCards
    .map((card) => {
      const lastDecision = getLastKnownDecision(card.id);
      const lastStatus = lastDecision
        ? `${lastDecision.source === "local" ? "local only" : "saved"} · ${escapeHtml(lastDecision.choiceLabel || "Other")} · ${escapeHtml(formatTimestamp(lastDecision.createdAt))}`
        : "No response captured yet";

      const askCopy =
        card.humanAsk || "No immediate human action required. Coco owns follow-through unless Derek disagrees.";

      return `
        <article class="artifact-card" data-card-id="${escapeHtml(card.id)}">
          <div class="artifact-top">
            <div class="artifact-heading">
              <p class="artifact-kind">${escapeHtml(card.kind)}</p>
              <h2>${escapeHtml(card.title)}</h2>
            </div>
            <div class="artifact-badges">
              <span class="status-tag">${escapeHtml(card.status)}</span>
              <span class="status-tag ${card.recommendedOwner === "agent" ? "status-good" : "status-warn"}">owner · ${escapeHtml(card.recommendedOwner)}</span>
            </div>
          </div>

          <div class="artifact-flow">
            <section class="artifact-section artifact-section-ask" aria-label="What I need from Derek">
              <p class="artifact-section-label">What I need from Derek</p>
              <p class="artifact-section-copy artifact-section-copy-strong">${escapeHtml(askCopy)}</p>
            </section>

            <section class="artifact-section" aria-label="Why this matters">
              <p class="artifact-section-label">Why this matters</p>
              <p class="artifact-section-copy">${escapeHtml(card.why)}</p>
            </section>

            <section class="artifact-section artifact-section-options" aria-label="Options">
              <div class="artifact-section-head">
                <p class="artifact-section-label">Options</p>
                <p class="artifact-section-note">Buttons submit immediately.</p>
              </div>
              <div class="choice-grid" role="group" aria-label="Choices for ${escapeHtml(card.title)}">
                ${renderChoiceButtons(card)}
              </div>
            </section>

            <section class="artifact-section artifact-section-brief" aria-label="Read brief">
              <div class="artifact-section-head">
                <p class="artifact-section-label">Read brief</p>
                <p class="artifact-section-note">Why this decision exists + suggested paths.</p>
              </div>

              <div class="brief-callout">
                <a class="brief-link" href="${escapeHtml(card.brief.href)}" target="_blank" rel="noreferrer">
                  ${escapeHtml(card.brief.label)}
                </a>
                <div class="artifact-links">
                  ${renderSupportLinks(card)}
                </div>
              </div>
            </section>
          </div>

          <div class="artifact-actions">
            <div class="other-row">
              <label class="sr-only" for="other-${escapeHtml(card.id)}">Other response</label>
              <input
                id="other-${escapeHtml(card.id)}"
                class="other-input"
                type="text"
                maxlength="600"
                placeholder="Other / override / note"
              />
              <button type="button" class="other-submit">Send custom response</button>
            </div>

            <p class="submission-status" aria-live="polite">${lastStatus}</p>
          </div>
        </article>
      `;
    })
    .join("");

  attachActionHandlers();
}

function renderHistorySpotlight(recent = []) {
  if (!historySpotlight) return;

  const rows = getHistoryRows(recent, 3);

  if (!rows.length) {
    historySpotlight.innerHTML = `
      <div class="log-empty history-spotlight-empty">
        <strong>No saved decisions yet.</strong>
        <p>The latest captured direction will surface here as soon as Derek saves an answer.</p>
      </div>
    `;
    return;
  }

  historySpotlight.innerHTML = rows
    .map(
      (row, index) => `
        <article class="history-spotlight-card">
          <div class="history-spotlight-topline">
            <span class="history-spotlight-rank">0${index + 1}</span>
            <div>
              <strong>${escapeHtml(row.cardTitle || row.cardId)}</strong>
              <p>${escapeHtml(row.choiceLabel || "Other")}${row.note ? ` · ${escapeHtml(row.note)}` : ""}</p>
            </div>
          </div>
          <div class="history-spotlight-meta">
            <span class="status-tag ${row.source === "local" ? "status-warn" : "status-good"}">${escapeHtml(
              row.source === "local" ? "local only" : "saved"
            )}</span>
            <span>${escapeHtml(formatTimestamp(row.createdAt))}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderResponseLog(recent = []) {
  renderHistorySpotlight(recent);
  if (!responseLog) return;

  const rows = getHistoryRows(recent, 8);

  if (!rows.length) {
    responseLog.innerHTML = `
      <div class="log-empty">
        <strong>No captured responses yet.</strong>
        <p>As soon as Derek taps an option here, the result lands in the log. If D1 is not bound yet, the browser marks the save as local-only.</p>
      </div>
    `;
    return;
  }

  responseLog.innerHTML = rows
    .map(
      (row) => `
        <article class="log-row">
          <div>
            <strong>${escapeHtml(row.cardTitle || row.cardId)}</strong>
            <p>${escapeHtml(row.choiceLabel || "Other")}${row.note ? ` · ${escapeHtml(row.note)}` : ""}</p>
          </div>
          <div class="log-meta">
            <span>${escapeHtml(row.source === "local" ? "local only" : "saved")}</span>
            <span>${escapeHtml(formatTimestamp(row.createdAt))}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function updateStorageChrome(storage) {
  storageState = storage;

  if (storageBadge) {
    storageBadge.textContent = storage.configured ? "D1 live" : "binding gap";
    storageBadge.className = `status-tag ${storage.configured ? "status-good" : "status-warn"}`;
  }

  if (storageLine) {
    storageLine.textContent = storage.configured
      ? "Submissions persist in Cloudflare D1."
      : storage.integrationRequired || "Durable storage is not bound on this deploy yet.";
  }

  if (notificationGap) {
    notificationGap.textContent = storage.notificationGap || decisionInbox.notificationGap;
  }
}

async function refreshServerState() {
  try {
    const response = await fetch("/api/decisions", {
      headers: { accept: "application/json" }
    });

    if (!response.ok) throw new Error(`GET /api/decisions failed: ${response.status}`);
    const payload = await response.json();
    const recentRemoteDecisions = getRecentRemoteDecisions(payload);

    latestRemoteByCard = payload.summary?.latestByCard || buildLatestRemoteByCard(recentRemoteDecisions);
    updateStorageChrome(payload.storage || storageState);
    renderInbox();
    renderResponseLog(recentRemoteDecisions);
  } catch {
    updateStorageChrome({
      configured: false,
      provider: "offline",
      durable: false,
      notificationGap: decisionInbox.notificationGap,
      integrationRequired: "Pages Function unavailable on this preview. Use wrangler pages dev for the full stack path."
    });
    renderInbox();
    renderResponseLog([]);
  }
}

function setCardStatus(cardId, message) {
  const statusNode = document.querySelector(`[data-card-id="${CSS.escape(cardId)}"] .submission-status`);
  if (statusNode) statusNode.textContent = message;
}

async function submitDecision(cardId, choiceKey, note = "") {
  const card = decisionInbox.cards.find((entry) => entry.id === cardId);
  if (!card) return;

  const noteText = note.trim();
  if (choiceKey === "other" && !noteText) {
    setCardStatus(cardId, "Type something in Other before sending.");
    return;
  }

  const choiceLabel = choiceKey === "other" ? "Other" : card.options[choiceKey]?.label;
  setCardStatus(cardId, "Saving…");

  try {
    const response = await fetch("/api/decisions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        cardId,
        choiceKey,
        note: noteText,
        submittedBy: "derek"
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      if (response.status === 503 && payload.storage) {
        const fallbackEntry = {
          cardId,
          cardTitle: card.title,
          choiceKey,
          choiceLabel,
          note: noteText,
          createdAt: new Date().toISOString(),
          source: "local"
        };
        rememberLocalFallback(fallbackEntry);
        updateStorageChrome(payload.storage);
        renderInbox();
        renderResponseLog([]);
        setCardStatus(cardId, "Saved only in this browser — D1 binding still missing.");
        return;
      }

      throw new Error(payload.error || `POST /api/decisions failed: ${response.status}`);
    }

    latestRemoteByCard[cardId] =
      normalizeRemoteDecision(payload.decision || payload.stored) || {
        cardId,
        cardTitle: card.title,
        choiceKey,
        choiceLabel,
        note: noteText,
        createdAt: new Date().toISOString(),
        source: "remote"
      };
    renderInbox();
    setCardStatus(cardId, `Saved to D1 · ${choiceLabel}`);
    await refreshServerState();
  } catch {
    const fallbackEntry = {
      cardId,
      cardTitle: card.title,
      choiceKey,
      choiceLabel,
      note: noteText,
      createdAt: new Date().toISOString(),
      source: "local"
    };
    rememberLocalFallback(fallbackEntry);
    renderInbox();
    renderResponseLog([]);
    setCardStatus(cardId, "Network miss — stored only in this browser.");
  }
}

function attachActionHandlers() {
  document.querySelectorAll(".artifact-card").forEach((cardNode) => {
    const cardId = cardNode.dataset.cardId;
    const otherInput = cardNode.querySelector(".other-input");

    cardNode.querySelectorAll(".choice-button").forEach((button) => {
      button.addEventListener("click", () => {
        submitDecision(cardId, button.dataset.choiceKey, otherInput?.value || "");
        if (otherInput) otherInput.value = "";
      });
    });

    cardNode.querySelector(".other-submit")?.addEventListener("click", () => {
      submitDecision(cardId, "other", otherInput?.value || "");
      if (otherInput) otherInput.value = "";
    });

    otherInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitDecision(cardId, "other", otherInput.value || "");
        otherInput.value = "";
      }
    });
  });
}

renderInbox();
renderResponseLog([]);
refreshServerState();
