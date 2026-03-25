export const decisionInbox = {
  generatedAt: "2026-03-25T21:25:00Z",
  notificationGap:
    "This repo can persist Derek input once a Cloudflare D1 binding is attached, but it still does not send Telegram or other push notifications on save.",
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
      kind: "storage path",
      status: "ready once D1 is bound",
      title: "Decision capture endpoint",
      why: "A clear save path matters because A/B/C buttons only help if Derek can trust that input actually lands somewhere durable.",
      recommendedOwner: "agent",
      humanAsk:
        "Only override this if you want a different sink than Cloudflare D1 for stored decisions.",
      brief: {
        label: "Read brief — why D1 is the smallest durable backend path here",
        href: "/briefs/response-capture-path.html"
      },
      links: [
        { label: "Open API route", href: "/api/decisions" },
        {
          label: "Function source",
          href: "https://github.com/i-am-coco/coco-web/blob/main/functions/api/decisions.js"
        },
        {
          label: "Project README",
          href: "https://github.com/i-am-coco/coco-web/blob/main/README.md"
        }
      ],
      options: {
        a: {
          label: "Use D1 as the default sink",
          detail: "Keep the current storage path and treat D1 as the durable destination for captured decisions."
        },
        b: {
          label: "Use D1 now, add notifications later",
          detail: "Keep the storage approach, but defer Telegram or other push plumbing until after the save path is stable."
        },
        c: {
          label: "Switch to a different storage path",
          detail: "Do not use D1 as the long-term sink; replace it with another persistence layer."
        }
      }
    }
  ]
};

export const decisionCardMap = new Map(decisionInbox.cards.map((card) => [card.id, card]));
