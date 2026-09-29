import { SITE_LINKS } from "../landing/site"
import type { ProductPageStructure } from "./types"

/** Canonical route structure for the applications product page. */
export const applicationsProductPage = {
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
                    {
                        kind: "flow",
                        key: "flow",
                        steps: ["leadOpportunity", "owner", "currentState", "nextAction", "evidence"],
                    },
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
                        items: [{ key: "currentFocus" }, { key: "directional" }, { key: "futureTarget" }],
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
                        items: [{ key: "needHelpWithA", appearance: "link", href: "/contact?intent=product" }],
                    },
                ],
            },
        ],
    } satisfies ProductPageStructure
