export const decisionInbox = {
  generatedAt: "2026-03-26T00:12:00Z",
  notificationGap:
    "Production saves can now persist in D1 and alert Coco via Telegram when the Pages runtime has TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.",
  cards: [
    {
      id: "decision-inbox-home",
      kind: "shipped surface",
      status: "ready for review",
      title: "Decision inbox home route",
      why: "If the home route is instantly legible, Derek can answer faster without reconstructing context from chat or repo history.",
      recommendedOwner: "agent",
      humanAsk:
        "Approve whether this should stay Derek's default decision surface, or say it should be replaced.",
      brief: {
        label: "Read brief — why the home route should be the default inbox",
        href: "/briefs/decision-inbox-home.html"
      },
      links: [
        { label: "Open live home", href: "https://coco-web-4cg.pages.dev/" },
        { label: "View repo", href: "https://github.com/i-am-coco/coco-web" },
        {
          label: "Deployment workflow",
          href: "https://github.com/i-am-coco/coco-web/blob/main/.github/workflows/deploy-pages.yml"
        }
      ],
      options: {
        a: {
          label: "Keep this as Derek's default inbox",
          detail: "Use the current home route as the main decision surface and let Coco keep refining the presentation."
        },
        b: {
          label: "Keep the structure, tighten the presentation",
          detail: "The direction is correct, but the wording, density, or layout should get sharper before it becomes the default."
        },
        c: {
          label: "Replace the top-level flow",
          detail: "The current home route should not be the default decision surface; switch to a different top-of-site pattern."
        }
      }
    },
    {
      id: "state-route",
      kind: "shipped route",
      status: "live",
      title: "/state snapshot route",
      why: "A compact orientation page helps Derek understand current operating posture without mixing status review with live decisions.",
      recommendedOwner: "agent",
      humanAsk:
        "Confirm whether /state should remain a read-only orientation surface or be trimmed further.",
      brief: {
        label: "Read brief — what /state is for and what it should exclude",
        href: "/briefs/state-route.html"
      },
      links: [
        { label: "Open live /state", href: "https://coco-web-4cg.pages.dev/state/" },
        {
          label: "View source",
          href: "https://github.com/i-am-coco/coco-web/blob/main/state/index.html"
        }
      ],
      options: {
        a: {
          label: "Keep /state as the orientation page",
          detail: "Use /state for concise status only, while keeping actual decision capture on the home route."
        },
        b: {
          label: "Keep it, but trim it harder",
          detail: "The route is useful, but it should show fewer blocks and less supporting detail."
        },
        c: {
          label: "Hide it from main navigation",
          detail: "Keep /state available as a secondary route, but do not feature it as a primary nav item."
        }
      }
    },
    {
      id: "response-capture-path",
      kind: "live system",
      status: "saving works · Telegram alerts live",
      title: "Decision inbox storage + alert path is live",
      why: "Your A/B/C clicks persist durably in Cloudflare D1 and now emit a Telegram alert to Coco/OpenClaw instead of sitting silently in the database.",
      recommendedOwner: "agent",
      humanAsk:
        "No action needed right now unless you want the alert copy or routing changed.",
      brief: {
        label: "Read brief — what works now in the live save + alert path",
        href: "/briefs/response-capture-path.html"
      },
      links: [
        { label: "Check live API status", href: "/api/decisions" },
        {
          label: "View inbox code",
          href: "https://github.com/i-am-coco/coco-web/blob/main/functions/api/decisions.js"
        }
      ],
      options: {
        a: {
          label: "Keep this storage + alert path",
          detail: "D1 remains the durable sink and Telegram is the active notification path for Derek decisions."
        },
        b: {
          label: "Tighten the alert copy next",
          detail: "Keep the path, but refine the message body or metadata sent on each save."
        },
        c: {
          label: "Change the notification target later",
          detail: "Only do this if Telegram/OpenClaw routing stops fitting the operating loop."
        }
      }
    }
  ]
};

export const decisionCardMap = new Map(decisionInbox.cards.map((card) => [card.id, card]));
