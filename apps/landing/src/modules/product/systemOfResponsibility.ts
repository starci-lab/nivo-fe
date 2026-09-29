import { SITE_LINKS } from "@/modules/landing/site"
import type { ProductPageStructure } from "./types"

/** Canonical route structure for the systemOfResponsibility product page. */
export const systemOfResponsibilityProductPage = {
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
                blocks: [{ kind: "status", key: "status", tone: "accent" }],
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
                    {
                        kind: "flow",
                        key: "flow",
                        steps: ["contextualize", "coordinate", "execute", "observe", "verify"],
                    },
                    {
                        kind: "cards",
                        key: "cards",
                        columns: 1,
                        items: [{ key: "currentFocusLeadTo", strong: true }],
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
                        items: [{ key: "learnAboutTrust", appearance: "link", href: SITE_LINKS.trust }],
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
                        items: [{ key: "seePricingTheCommercial", appearance: "link", href: SITE_LINKS.pricing }],
                    },
                ],
            },
        ],
    } satisfies ProductPageStructure
