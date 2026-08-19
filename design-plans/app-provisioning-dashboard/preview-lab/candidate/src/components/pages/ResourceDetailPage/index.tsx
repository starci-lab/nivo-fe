"use client"

import { useTranslations } from "next-intl"
import { Button, Heading, Text, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import { DangerZone } from "../../blocks/resource/DangerZone"
import detail from "../../../resources/resource-detail.fixture.json"

/**
 * PAGE - one resource, and everything the console can do to it.
 *
 * TARGET PATH: `apps/app/src/components/pages/ResourceDetailPage/index.tsx`.
 *
 * WHY THE HEAVY ACTIONS ARE HERE AND NOT ON THE ROW. A list row has room for one press and no room
 * at all for a sentence explaining what it costs. Rebuild and reprovision destroy work, so they need
 * a place that can say so before offering the button - which is the difference the selected direction
 * was chosen for.
 *
 * THE DANGER ZONE IS ABSENT FOR A CUSTOMER, NOT DISABLED. `rebuild`, `reprovision` and `wipe` sit
 * behind `PlatformOperatorHttpGuard`; a customer cannot call them at all. A disabled button would
 * promise a control that does not exist for that reader.
 *
 * WHAT THIS PAGE REFUSES TO INVENT. `chartVersion` is shown as unknown when the backend has none, and
 * AI spend says it is unmeasured rather than `$0.00` when the instance has no key - `MyInstance.ram`
 * and `vcpu` are hardcoded `null` today and `creditBurnUsd` is always null for a workspace. A console
 * that printed a made-up figure would be worse than one that says it cannot read it yet.
 *
 * IT NEVER REACHES INSIDE A BLOCK (PAGE-4). `DangerZone` is handed one fact - whether this reader is
 * an operator - and decides its own shape from there.
 *
 * TWO SITUATIONS THE PAGE ITSELF OWNS (PAGE-2). `loading` and `notFound` are screen-level: nothing on
 * the page can answer them, because a routed id that names no resource this viewer holds leaves every
 * region with nothing to draw. Everything else is one resource in one of its real states.
 *
 * ONE FILE, per SPLIT-6: the candidate reads a fixture. When the query lands, `index.tsx` resolves
 * the resource and this shape moves to `component.tsx` behind an exact `ResourceDetailPageBase`.
 */

/** Which resource situation is being drawn. Each renders a different tree, so each is a state. */
export type ResourceDetailPhase = "running" | "failed" | "awaitingDns" | "suspended" | "loading" | "notFound"

/** The four situations that name a real resource in the fixture. */
type ResourcePhase = Exclude<ResourceDetailPhase, "loading" | "notFound">

/** Props for {@link ResourceDetailPage}. */
export interface ResourceDetailPageProps {
    /** The situation being rendered. */
    readonly phase: ResourceDetailPhase
    /** Whether the reader may reach the operator-only lifecycle endpoints. */
    readonly isOperator?: boolean
}

/** One labelled fact about the resource. */
type Fact = { readonly id: string; readonly label: string; readonly value?: string }

/**
 * One resource's page.
 *
 * @param props - {@link ResourceDetailPageProps}
 * @returns The page node.
 */
export const ResourceDetailPage = ({ phase, isOperator = false }: ResourceDetailPageProps) => {
    const t = useTranslations("resourceDetail")
    const r = useTranslations("resources")
    const isLoading = phase === "loading"
    const isMissing = phase === "notFound"
    const resource = isLoading || isMissing ? null : detail[phase as ResourcePhase]

    /*
     * THE LABELS ARE KNOWN BEFORE THE QUERY ANSWERS, AND THE VALUES ARE NOT. A resource page always
     * has a host, a port pair, a build status, a chart version and a spend figure - which of those is
     * pending is never in question, so the column keeps its labels and rests only the right-hand side.
     * A page that skeletoned both halves would be claiming it does not yet know what a resource IS.
     */
    const facts: ReadonlyArray<Fact> = [
        { id: "publicHost", label: t("publicHost"), value: resource?.publicHost },
        { id: "ports", label: t("ports"), value: resource?.ports },
        { id: "buildStatus", label: t("buildStatus"), value: resource?.buildStatus },
        { id: "chartVersion", label: t("chartVersion"), value: resource === null ? undefined : resource.chartVersion ?? t("shapeUnknown") },
        {
            id: "aiSpend",
            label: t("aiSpend"),
            value: resource === null
                ? undefined
                : resource.aiSpendUsd === null
                    ? t("aiSpendUnmeasured")
                    : `${resource.aiSpendUsd} · ${t("aiSpendLifetime")}`,
        },
    ]

    /**
     * One titled section of the page.
     *
     * @param title - The already-resolved heading.
     * @param body - What the section holds.
     * @returns The section node.
     */
    const section = (title: string, body: Parameters<typeof defineContractComponent<"label-row-over-card">>[1]["body"]) =>
        defineContractComponent("label-row-over-card", {
            label: defineContractComponent("title-with-end-action", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: title, level: 2 }} />
                )),
            }),
            body,
        })

    const factSheet = section(t("factsLabel"), defineContractComponent("labelled-fact-stack", {
        fact: facts.map((fact) => defineContractComponent("label-value-row", {
            label: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: fact.label, size: "sm", tone: "muted" }} />
            )),
            value: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: fact.value, size: "sm" }} isLoading={isLoading} />
            )),
        })),
    }))

    /*
     * A FAILED RESOURCE SAYS WHY, IN ITS OWN SECTION. The reason is the single most useful thing on
     * the page in that state, and burying it as one more row in the fact sheet would make it read as
     * ordinary metadata rather than as the answer.
     */
    const failure = resource?.failure == null ? null : section(
        t("failureLabel"),
        defineLeafComponent("text", {}, () => (
            <Text props={{ content: resource.failure ?? "", size: "sm", tone: "muted" }} />
        )),
    )

    /*
     * AWAITING DNS IS AN INSTRUCTION, NOT A STATUS. The reader has something to DO - paste one record
     * - so the record itself is the section, and the status chip in the list is only how they got here.
     */
    const dns = resource?.dnsTarget == null ? null : section(
        t("dnsLabel"),
        defineContractComponent("labelled-fact-stack", {
            fact: [
                defineContractComponent("label-value-row", {
                    label: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: "CNAME", size: "sm", tone: "muted" }} />
                    )),
                    value: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: resource.dnsTarget ?? "", size: "sm" }} />
                    )),
                }),
                defineContractComponent("label-value-row", {
                    label: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: r(`status.${resource.status}`), size: "sm", tone: "muted" }} />
                    )),
                    value: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: t("dnsPending"), size: "sm" }} />
                    )),
                }),
            ],
        }),
    )

    /*
     * THE DANGER ZONE IS LAST ON EVERY PAGE THAT HAS ONE, and it is absent while the resource is still
     * arriving: offering to destroy something the reader cannot yet see is the one press that must
     * never be available early.
     */
    const danger = isOperator && resource !== null
        ? { kind: "projection" as const, meta: { shape: "contract" as const, contract: "warned-action-panel" as const }, project: () => <DangerZone isOperator /> }
        : null

    /*
     * READING ORDER IS THE DESIGN (PAGE-7). What is wrong comes before what the thing is, because a
     * reader who arrived at a failed resource came for the reason; the fact sheet is what they read
     * second.
     */
    const sections = [failure, dns, factSheet, danger].filter((entry) => entry !== null)

    return (
        <Tree
            contract="titled-body"
            render={defineContractComponent("titled-body", {
                heading: defineContractComponent("title-with-end-action", {
                    /*
                     * THE NON-BREAKING SPACE IS COMPENSATING FOR A LEAF DEFECT, and it is named here
                     * rather than hidden. `Heading` declares a resting class set for `isLoading` but
                     * renders `props.content ?? ""` - an empty element, which collapses to nothing.
                     * `Text` solved the same problem by rendering a non-breaking space while it
                     * rests; `Heading` was never given the same treatment. The
                     * result was a loading page with NO title row at all, so the whole screen jumped
                     * downward the moment the name arrived, which is exactly what a resting shape
                     * exists to prevent.
                     *
                     * The leaf is outside this phase's write boundary, so the fix is recorded as a
                     * vocabulary proposal and this line holds the row up in the meantime. When the
                     * leaf rests properly, this argument goes away.
                     */
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: isLoading ? " " : resource?.name, level: 1 }} isLoading={isLoading} />
                    )),
                    /*
                     * NO ACTION WHILE THE RESOURCE IS UNKNOWN. A press whose label depends on the
                     * state cannot be drawn before the state is known, and a resting button would
                     * invite a press that has nothing to act on.
                     */
                    ...(resource === null ? {} : {
                        end: defineLeafComponent("button", {}, () => (
                            <Button
                                props={{
                                    label: phase === "failed"
                                        ? t("retryProvision")
                                        : phase === "suspended" ? t("resume") : t("redeploy"),
                                    size: "sm",
                                    variant: "primary",
                                }}
                                on={{ press: () => undefined }}
                            />
                        )),
                    }),
                }),
                body: isMissing
                    ? defineLeafComponent("text", {}, () => (
                        <Text props={{ content: t("notFound"), size: "sm", tone: "muted" }} />
                    ))
                    : defineContractComponent("stacked-sections", { section: sections }),
            })}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "page", world: "pure" } as const
