/** The mailbox every landing call to action opens; the subject line is catalog copy. */
export const LANDING_MAILBOX = "mailto:hello@nivo.vn"

/** The header navigation: catalog id and the on-page anchor it jumps to. */
export const LANDING_NAV = [
  { id: "products", href: "#intent-modules" },
  { id: "solutions", href: "#responsibility" },
  { id: "docs", href: "#operating-loop" },
] as const

/** The operating loop steps, in order; each id reads its title and body from the catalog. */
export const LANDING_LOOP_STEPS = ["context", "responsibility", "coordination", "evidence", "outcome", "trust"] as const

/** The three responsibility roles, in order. */
export const LANDING_ROLES = ["human", "ai", "system"] as const

/** The four intent modules with their generated artwork. */
export const LANDING_INTENTS = [
  { id: "create", art: "/images/intent/create-v2.png" },
  { id: "operate", art: "/images/intent/operate-v2.png" },
  { id: "revenue", art: "/images/intent/revenue-v2.png" },
  { id: "money", art: "/images/intent/money-v2.png" },
] as const

/** The module instance showcase: the badge tone of each card. */
export const LANDING_INSTANCES = [
  { id: "content", tone: "danger" },
  { id: "onboarding", tone: "accent" },
  { id: "launch", tone: "accent" },
  { id: "budget", tone: "success" },
] as const

/** The offer benefits, in order. */
export const LANDING_BENEFITS = ["context", "evidence", "trust"] as const

/** The footer directory: each item is an on-page anchor, or the mailbox (the careers item carries a catalog subject). */
export const LANDING_FOOTER_GROUPS = [
  { id: "product", items: [{ id: "overview", href: "#main" }, { id: "modules", href: "#intent-modules" }, { id: "instances", href: "#module-instances" }, { id: "ecosystem", href: "#responsibility" }] },
  { id: "solutions", items: [{ id: "marketing", href: "#intent-modules" }, { id: "sales", href: "#intent-modules" }, { id: "operations", href: "#responsibility" }, { id: "finance", href: "#intent-modules" }] },
  { id: "resources", items: [{ id: "docs", href: "#operating-loop" }, { id: "guides", href: "#operating-loop" }, { id: "cases", href: "#module-instances" }, { id: "blog", href: "#main" }] },
  { id: "company", items: [{ id: "about", href: "#main" }, { id: "careers", mail: "careers" }, { id: "contact", mail: "plain" }] },
] as const
