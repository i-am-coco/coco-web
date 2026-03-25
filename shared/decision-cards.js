export const decisionInbox = {
  generatedAt: "2026-03-25T20:48:00Z",
  notificationGap:
    "This repo can persist Derek input once a Cloudflare D1 binding is attached, but it still does not send Telegram or other push notifications on save.",
  cards: [
    {
      id: "decision-inbox-home",
      kind: "shipped surface",
      status: "ready for review",
      title: "Decision inbox home route",
      why: "Puts Derek on top of real shipped artifacts instead of asking abstract questions about the dashboard itself.",
      recommendedOwner: "agent",
      humanAsk:
        "Only reply if this should not be the default Derek entry surface. Otherwise Coco keeps iterating here by default.",
      links: [
        { label: "live home", href: "https://coco-web-4cg.pages.dev/" },
        { label: "repo", href: "https://github.com/i-am-coco/coco-web" },
        {
          label: "deploy workflow",
          href: "https://github.com/i-am-coco/coco-web/blob/main/.github/workflows/deploy-pages.yml"
        }
      ],
      options: {
        a: "Keep this as Derek's default surface",
        b: "Keep the flow, but make it tighter",
        c: "Wrong direction — replace the top flow"
      }
    },
    {
      id: "state-route",
      kind: "shipped route",
      status: "live",
      title: "/state snapshot route",
      why: "Keeps a dense operator snapshot one click away while the top of home stays focused on decisions and feedback.",
      recommendedOwner: "agent",
      humanAsk: null,
      links: [
        { label: "live /state", href: "https://coco-web-4cg.pages.dev/state/" },
        {
          label: "source",
          href: "https://github.com/i-am-coco/coco-web/blob/main/state/index.html"
        }
      ],
      options: {
        a: "Looks right",
        b: "Trim it further",
        c: "Hide it from the main nav"
      }
    },
    {
      id: "response-capture-path",
      kind: "storage path",
      status: "ready once D1 is bound",
      title: "Decision capture endpoint",
      why: "Turns A/B/C taps into a real submit flow, with Cloudflare Pages Functions and D1 as the smallest durable backend path that fits this repo.",
      recommendedOwner: "agent",
      humanAsk:
        "Only answer if you want a different storage path. Default is agent-owned: bind D1 and keep moving.",
      links: [
        { label: "api", href: "/api/decisions" },
        {
          label: "function source",
          href: "https://github.com/i-am-coco/coco-web/blob/main/functions/api/decisions.js"
        },
        {
          label: "readme",
          href: "https://github.com/i-am-coco/coco-web/blob/main/README.md"
        }
      ],
      options: {
        a: "Use D1 as the default sink",
        b: "Use D1 and add notifications later",
        c: "Use a different sink"
      }
    }
  ]
};

export const decisionCardMap = new Map(decisionInbox.cards.map((card) => [card.id, card]));
