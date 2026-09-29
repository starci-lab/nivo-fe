import type { ProductPageStructure } from "./types"

/** Canonical route structure for the pricing product page. */
export const pricingProductPage = {
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
                        items: [{ key: "needHelpFindingWhere", appearance: "link", href: "/contact?intent=product" }],
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
                        items: [{ key: "startFirstProof", strong: true }, { key: "proRepeatableValue" }],
                    },
                ],
            },
            {
                id: "usage-resources",
                key: "usageResources",
                tone: "default",
                description: true,
                blocks: [
                    {
                        kind: "flow",
                        key: "flow",
                        steps: ["moreUsage", "additionalResources", "noForcedMaturityUpgrade"],
                    },
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
                        items: [{ key: "opcExpand" }, { key: "teamCoordinate" }, { key: "enterpriseGovern" }],
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
                        items: [{ key: "start" }, { key: "pro", strong: true }, { key: "managedRunCare" }],
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
    } satisfies ProductPageStructure
