import { SITE_LINKS } from "@/modules/landing/site"

/** The four product pages, by the camelCase id that is also their catalog key under `product`. */
export type ProductPageId = "nivoOs" | "systemOfResponsibility" | "applications" | "pricing"

/** A destination: a site path, a fragment, or (activation) the destination that is published later. */
export type ActionStructure = {
    readonly key: string
    readonly appearance: "primary" | "secondary" | "tertiary" | "link"
    readonly href?: string
    readonly activation?: true
}

/** One card of a cards block: its catalog key, an optional in-page anchor and its emphasis. */
export type CardStructure = {
    readonly key: string
    readonly anchor?: string
    readonly labelled?: true
    readonly strong?: true
}

/** One next-path card: its catalog key and where it leads (a site path, or the activation destination). */
export type PathStructure = { readonly key: string; readonly href?: string; readonly activation?: true }

/** One commercial offer card: its catalog key, its bullet ids and its call to action. */
export type OfferStructure = {
    readonly key: string
    readonly featured?: true
    readonly bullets: ReadonlyArray<string>
    readonly action: ActionStructure
}

/** One block of a section, by kind; the text of each block is read from the catalog under the block key. */
export type BlockStructure =
    | { readonly kind: "cards"; readonly key: string; readonly columns: number; readonly items: ReadonlyArray<CardStructure> }
    | { readonly kind: "flow"; readonly key: string; readonly steps: ReadonlyArray<string> }
    | { readonly kind: "status"; readonly key: string; readonly tone: string }
    | { readonly kind: "note"; readonly key: string }
    | { readonly kind: "actions"; readonly key: string; readonly items: ReadonlyArray<ActionStructure> }
    | { readonly kind: "selector"; readonly key: string; readonly items: ReadonlyArray<{ readonly key: string; readonly href: string }> }
    | { readonly kind: "table"; readonly key: string; readonly headers: ReadonlyArray<string>; readonly rows: ReadonlyArray<string> }
    | { readonly kind: "paths"; readonly key: string; readonly items: ReadonlyArray<PathStructure> }
    | { readonly kind: "offers"; readonly key: string; readonly items: ReadonlyArray<OfferStructure> }
    | { readonly kind: "faq"; readonly key: string; readonly items: ReadonlyArray<string> }

/** One section of a page: its DOM id, its catalog key, its surface tone and its blocks in order. */
export type SectionStructure = {
    /** The DOM id and `data-product-section` value. */
    readonly id: string
    /** The catalog key of the section under `product.<page>.sections`. */
    readonly key: string
    readonly tone: string
    readonly description: boolean
    readonly blocks: ReadonlyArray<BlockStructure>
}

/** The structure of one product page: where it lives, its hero actions and its sections in order. */
export type ProductPageStructure = {
    /** The `data-product-page` value. */
    readonly slug: string
    /** The site path of the page. */
    readonly path: string
    readonly hero: {
        readonly descriptor: boolean
        readonly philosophy: boolean
        readonly actions: ReadonlyArray<ActionStructure>
    }
    readonly sections: ReadonlyArray<SectionStructure>
}

/**
 * The structure of the four product pages: section order and kinds, ids, icons-by-position and
 * destinations. Every visitor-facing sentence lives in the `product` catalog under the same keys.
 */
export const PRODUCT_PAGES: Record<ProductPageId, ProductPageStructure> = {
    nivoOs: {
        slug: "nivo-os",
        path: "/nivo-os",
        hero: {
            descriptor: true,
            philosophy: true,
            actions: [
                { key: "learnHowNivoOs", appearance: "primary", href: "#operating-model" },
                { key: "exploreSolutions", appearance: "secondary", href: SITE_LINKS.applications },
            ],
        },
        sections: [
            {
                id: "responsibility-center",
                key: "responsibilityCenter",
                tone: "soft",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 4,
                        items: [
                            { key: "outcome" },
                            { key: "accountability" },
                            { key: "boundary" },
                            { key: "evidence" },
                        ],
                    },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "learnAboutTheSystem", appearance: "link", href: SITE_LINKS.responsibility },
                        ],
                    },
                ],
            },
            {
                id: "operating-model",
                key: "operatingModel",
                tone: "default",
                description: true,
                blocks: [
                    {
                        kind: "flow",
                        key: "flow",
                        steps: ["businessIntent", "contextState", "responsibility", "governedExecution", "verifiedOutcome"],
                    },
                    { kind: "status", key: "status", tone: "accent" },
                ],
            },
            {
                id: "capability-model",
                key: "capabilityModel",
                tone: "dark",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 3,
                        items: [
                            { key: "context" },
                            { key: "action", strong: true },
                            { key: "intelligence" },
                        ],
                    },
                    { kind: "note", key: "note" },
                ],
            },
            {
                id: "nivo-os-today",
                key: "nivoOsToday",
                tone: "soft",
                description: true,
                blocks: [
                    { kind: "status", key: "status", tone: "warning" },
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 2,
                        items: [
                            { key: "currentResponsibility", strong: true },
                            { key: "truthGate" },
                        ],
                    },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "exploreSolutions", appearance: "primary", href: SITE_LINKS.applications },
                        ],
                    },
                ],
            },
            {
                id: "trust-bridge",
                key: "trustBridge",
                tone: "crimson",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 4,
                        items: [
                            { key: "whoIsAccountable" },
                            { key: "whatMayAiDo" },
                            { key: "withWhatPermission" },
                            { key: "whatEvidenceProvesIt" },
                        ],
                    },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "learnAboutTrustGovernance", appearance: "link", href: SITE_LINKS.trust },
                        ],
                    },
                ],
            },
            {
                id: "target-architecture",
                key: "targetArchitecture",
                tone: "default",
                description: true,
                blocks: [
                    {
                        kind: "flow",
                        key: "flow",
                        steps: ["nivoOsToday", "currentFocus", "evidenceLearning", "targetArchitecture"],
                    },
                    { kind: "status", key: "status", tone: "neutral" },
                ],
            },
            {
                id: "next-path",
                key: "nextPath",
                tone: "soft",
                description: true,
                blocks: [
                    {
                        kind: "paths",
                        key: "paths",
                        items: [
                            { key: "apply", href: SITE_LINKS.applications },
                            { key: "buy", href: SITE_LINKS.pricing },
                            { key: "start", activation: true },
                        ],
                    },
                ],
            },
        ],
    },
    systemOfResponsibility: {
        slug: "system-of-responsibility",
        path: "/system-of-responsibility",
        hero: {
            descriptor: false,
            philosophy: true,
            actions: [
                { key: "understandResponsibility", appearance: "primary", href: "#definition" },
                { key: "learnAboutNivoOs", appearance: "secondary", href: SITE_LINKS.nivoOs },
            ],
        },
        sections: [
            {
                id: "definition",
                key: "definition",
                tone: "soft",
                description: true,
                blocks: [
                    { kind: "status", key: "status", tone: "accent" },
                ],
            },
            {
                id: "core-anatomy",
                key: "coreAnatomy",
                tone: "default",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 4,
                        items: [
                            { key: "outcome", strong: true },
                            { key: "accountability" },
                            { key: "boundary" },
                            { key: "evidence" },
                        ],
                    },
                    {
                        kind: "cards",
                        key: "cards2",
                        columns: 2,
                        items: [
                            { key: "permission", labelled: true },
                            { key: "exceptionEscalation", labelled: true },
                        ],
                    },
                ],
            },
            {
                id: "task-vs-responsibility",
                key: "taskVsResponsibility",
                tone: "dark",
                description: true,
                blocks: [
                    {
                        kind: "table",
                        key: "table",
                        headers: ["task", "responsibility"],
                        rows: [
                            "sendAFollowUp",
                            "actionCompletion",
                            "oneFiniteAction",
                            "aHumanAiWorkflow",
                            "doneMayOnlyBe",
                            "theOutputHasBeen",
                        ],
                    },
                    { kind: "note", key: "note" },
                ],
            },
            {
                id: "evidence",
                key: "evidence",
                tone: "default",
                description: true,
                blocks: [
                    {
                        kind: "flow",
                        key: "flow",
                        steps: ["evidenceRequired", "execution", "evidenceObserved", "verification", "verifiedOutcome"],
                    },
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 3,
                        items: [
                            { key: "targetOutcome" },
                            { key: "observedOutcome" },
                            { key: "verifiedOutcome", strong: true },
                        ],
                    },
                ],
            },
            {
                id: "nivo-os-current",
                key: "nivoOsCurrent",
                tone: "soft",
                description: true,
                blocks: [
                    { kind: "flow", key: "flow", steps: ["contextualize", "coordinate", "execute", "observe", "verify"] },
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 1,
                        items: [
                            { key: "currentFocusLeadTo", strong: true },
                        ],
                    },
                    { kind: "status", key: "status", tone: "warning" },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "learnAboutNivoOs", appearance: "primary", href: SITE_LINKS.nivoOs },
                            { key: "exploreSolutions", appearance: "link", href: SITE_LINKS.applications },
                        ],
                    },
                ],
            },
            {
                id: "trust-bridge",
                key: "trustBridge",
                tone: "crimson",
                description: true,
                blocks: [
                    { kind: "flow", key: "flow", steps: ["evidence", "verification", "verifiedOutcome", "trust"] },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "learnAboutTrust", appearance: "link", href: SITE_LINKS.trust },
                        ],
                    },
                ],
            },
            {
                id: "next-path",
                key: "nextPath",
                tone: "soft",
                description: false,
                blocks: [
                    {
                        kind: "paths",
                        key: "paths",
                        items: [
                            { key: "how", href: SITE_LINKS.nivoOs },
                            { key: "apply", href: SITE_LINKS.applications },
                            { key: "trust", href: SITE_LINKS.trust },
                        ],
                    },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "seePricingTheCommercial", appearance: "link", href: SITE_LINKS.pricing },
                        ],
                    },
                ],
            },
        ],
    },
    applications: {
        slug: "applications",
        path: "/applications",
        hero: {
            descriptor: false,
            philosophy: false,
            actions: [
                { key: "exploreByNeed", appearance: "primary", href: "#by-need" },
                { key: "learnAboutNivoOs", appearance: "secondary", href: SITE_LINKS.nivoOs },
            ],
        },
        sections: [
            {
                id: "need-selector",
                key: "needSelector",
                tone: "soft",
                description: true,
                blocks: [
                    {
                        kind: "selector",
                        key: "selector",
                        items: [
                            { key: "leadershipExecution", href: "#need-leadership" },
                            { key: "growthRevenue", href: "#need-growth" },
                            { key: "customersService", href: "#need-customer" },
                            { key: "operationsResults", href: "#need-operations" },
                            { key: "knowledgeDecisions", href: "#need-knowledge" },
                        ],
                    },
                ],
            },
            {
                id: "current-focus",
                key: "currentFocus",
                tone: "crimson",
                description: true,
                blocks: [
                    { kind: "status", key: "status", tone: "warning" },
                    { kind: "flow", key: "flow", steps: ["leadOpportunity", "owner", "currentState", "nextAction", "evidence"] },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "seePricing", appearance: "secondary", href: SITE_LINKS.pricing },
                            { key: "learnAboutNivoOs", appearance: "link", href: SITE_LINKS.nivoOs },
                            { key: "tryNivoOs", appearance: "secondary", activation: true },
                        ],
                    },
                ],
            },
            {
                id: "by-need",
                key: "byNeed",
                tone: "default",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 2,
                        items: [
                            { key: "leadershipExecution", labelled: true, anchor: "need-leadership" },
                            { key: "growthRevenue", labelled: true, anchor: "need-growth", strong: true },
                            { key: "customersService", labelled: true, anchor: "need-customer" },
                            { key: "operationsResults", labelled: true, anchor: "need-operations" },
                            { key: "knowledgeDecisions", labelled: true, anchor: "need-knowledge" },
                        ],
                    },
                ],
            },
            {
                id: "by-role",
                key: "byRole",
                tone: "soft",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 4,
                        items: [
                            { key: "founderCeo" },
                            { key: "revenueGrowth", strong: true },
                            { key: "customerOperations" },
                            { key: "expertKnowledgeWorker" },
                        ],
                    },
                ],
            },
            {
                id: "by-context",
                key: "byContext",
                tone: "default",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 2,
                        items: [
                            { key: "expertKnowledgeServices", labelled: true },
                            { key: "b2bServices", labelled: true },
                        ],
                    },
                ],
            },
            {
                id: "truth-evidence",
                key: "truthEvidence",
                tone: "dark",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 3,
                        items: [
                            { key: "currentFocus" },
                            { key: "directional" },
                            { key: "futureTarget" },
                        ],
                    },
                    {
                        kind: "flow",
                        key: "flow",
                        steps: ["buildEvidence", "operationalEvidence", "businessOutcomeEvidence", "verifiedOutcome"],
                    },
                ],
            },
            {
                id: "next-path",
                key: "nextPath",
                tone: "soft",
                description: false,
                blocks: [
                    {
                        kind: "paths",
                        key: "paths",
                        items: [
                            { key: "understand", href: SITE_LINKS.nivoOs },
                            { key: "buy", href: SITE_LINKS.pricing },
                            { key: "start", activation: true },
                        ],
                    },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "needHelpWithA", appearance: "link", href: "/contact?intent=product" },
                        ],
                    },
                ],
            },
        ],
    },
    pricing: {
        slug: "pricing",
        path: "/pricing",
        hero: {
            descriptor: false,
            philosophy: false,
            actions: [
                { key: "tryNivoStartFree", appearance: "primary", activation: true },
                { key: "findTheRightPlace", appearance: "secondary", href: "#discover" },
            ],
        },
        sections: [
            {
                id: "discover",
                key: "discover",
                tone: "soft",
                description: true,
                blocks: [
                    {
                        kind: "flow",
                        key: "flow",
                        steps: ["rightProblem", "responsibilityCandidate", "readiness", "rightNextPath"],
                    },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "needHelpFindingWhere", appearance: "link", href: "/contact?intent=product" },
                        ],
                    },
                ],
            },
            {
                id: "available-now",
                key: "availableNow",
                tone: "default",
                description: true,
                blocks: [
                    {
                        kind: "offers",
                        key: "offers",
                        items: [
                            {
                                key: "nivoStart",
                                bullets: ["b1", "b2", "b3", "b4"],
                                action: { key: "action", appearance: "primary", activation: true },
                                featured: true,
                            },
                            {
                                key: "nivoPro",
                                bullets: ["b1", "b2", "b3", "b4"],
                                action: { key: "action", appearance: "primary", href: "#pro-decision" },
                            },
                        ],
                    },
                ],
            },
            {
                id: "pro-decision",
                key: "proDecision",
                tone: "dark",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 2,
                        items: [
                            { key: "start", labelled: true, strong: true },
                            { key: "pro", labelled: true },
                        ],
                    },
                    { kind: "status", key: "status", tone: "accent" },
                ],
            },
            {
                id: "comparison",
                key: "comparison",
                tone: "default",
                description: false,
                blocks: [
                    {
                        kind: "table",
                        key: "table",
                        headers: ["decision", "nivoStart", "nivoPro"],
                        rows: ["bestWhen", "goal", "scope", "context", "result", "resources", "referencePrice"],
                    },
                ],
            },
            {
                id: "what-you-buy",
                key: "whatYouBuy",
                tone: "soft",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 2,
                        items: [
                            { key: "startFirstProof", strong: true },
                            { key: "proRepeatableValue" },
                        ],
                    },
                ],
            },
            {
                id: "usage-resources",
                key: "usageResources",
                tone: "default",
                description: true,
                blocks: [
                    { kind: "flow", key: "flow", steps: ["moreUsage", "additionalResources", "noForcedMaturityUpgrade"] },
                    { kind: "status", key: "status", tone: "warning" },
                ],
            },
            {
                id: "growth",
                key: "growth",
                tone: "dark",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 3,
                        items: [
                            { key: "opcExpand" },
                            { key: "teamCoordinate" },
                            { key: "enterpriseGovern" },
                        ],
                    },
                    { kind: "status", key: "status", tone: "neutral" },
                ],
            },
            {
                id: "service-support",
                key: "serviceSupport",
                tone: "soft",
                description: true,
                blocks: [
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 3,
                        items: [
                            { key: "start" },
                            { key: "pro", strong: true },
                            { key: "managedRunCare" },
                        ],
                    },
                ],
            },
            {
                id: "faq",
                key: "faq",
                tone: "default",
                description: false,
                blocks: [
                    {
                        kind: "faq",
                        key: "faq",
                        items: [
                            "startOrPro",
                            "doIHaveTo",
                            "doesStartHaveA",
                            "doesProHaveIts",
                            "ifIRunOut",
                            "whyIsProMore",
                            "isSupportIncluded",
                            "canOpcBeBought",
                            "canTeamBeBought",
                            "isEnterpriseAnUnlimited",
                            "doesAHigherPlan",
                            "whatAboutVatRefunds",
                        ],
                    },
                ],
            },
            {
                id: "start-right",
                key: "startRight",
                tone: "crimson",
                description: true,
                blocks: [
                    {
                        kind: "actions",
                        key: "actions",
                        items: [
                            { key: "tryNivoStartFree", appearance: "secondary", activation: true },
                            { key: "getStartedWithNivo", appearance: "secondary", href: "#pro-decision" },
                            { key: "findTheRightPlace", appearance: "tertiary", href: "#discover" },
                            { key: "contactUs", appearance: "link", href: "/contact?intent=product" },
                        ],
                    },
                ],
            },
        ],
    },
}
