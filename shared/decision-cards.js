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
      kind: "hard blocker",
      status: "blocked on Cloudflare token",
      title: "Fix durable decision storage",
      why: "Your clicks are not persisting yet because the current Cloudflare token cannot create/bind D1. Until that permission is added, the inbox is not trustworthy.",
      recommendedOwner: "human",
      humanAsk:
        "Add Account → D1 Edit/Write to the existing Cloudflare token, then the inbox can save your choices durably.",
      brief: {
        label: "Read brief — why D1 permission is the only blocker",
        href: "/briefs/response-capture-path.html"
      },
      links: [
        { label: "Fix token in Cloudflare", href: "https://dash.cloudflare.com/profile/api-tokens" },
        { label: "Find your account id", href: "https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/" },
        { label: "Check live API status", href: "/api/decisions" }
      ],
      options: {
        a: {
          label: "I added D1 Edit/Write",
          detail: "Use this after updating the existing token so Coco can finish the durable inbox path."
        },
        b: {
          label: "I need exact permission help",
          detail: "Use this if you are still stuck in the Cloudflare token UI and want the exact permission row again."
        },
        c: {
          label: "Skip durable storage for now",
          detail: "Use this only if you are okay with the inbox staying non-durable for now."
        }
      }
    }
  ]
};

export const decisionCardMap = new Map(decisionInbox.cards.map((card) => [card.id, card]));
