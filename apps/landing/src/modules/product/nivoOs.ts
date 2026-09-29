import { SITE_LINKS } from "@/modules/landing/site"
import type { ProductPageStructure } from "./types"

/** Canonical route structure for the nivoOs product page. */
export const nivoOsProductPage = {
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
                        items: [{ key: "learnAboutTheSystem", appearance: "link", href: SITE_LINKS.responsibility }],
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
                        steps: [
                            "businessIntent",
                            "contextState",
                            "responsibility",
                            "governedExecution",
                            "verifiedOutcome",
                        ],
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
                        items: [{ key: "context" }, { key: "action", strong: true }, { key: "intelligence" }],
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
                        items: [{ key: "currentResponsibility", strong: true }, { key: "truthGate" }],
                    },
                    {
                        kind: "actions",
                        key: "actions",
                        items: [{ key: "exploreSolutions", appearance: "primary", href: SITE_LINKS.applications }],
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
                        items: [{ key: "learnAboutTrustGovernance", appearance: "link", href: SITE_LINKS.trust }],
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
    } satisfies ProductPageStructure
