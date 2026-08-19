import {
    Avatar,
    Badge,
    Button,
    Heading,
    SurfaceCard,
    Text,
    TextLink,
    defineContractComponent,
    defineLeafComponent,
} from "@nivo/ui"
import type { ExpertSiteLead } from "@/modules/api/console"

/** Resolved copy for the lead pipeline. */
export type AcademyLeadPipelineLabels = {
    readonly section: string
    readonly empty: string
    readonly refused: string
    readonly open: string
    readonly detail: string
    readonly advance: string
    readonly draft: string
    readonly saved: string
    readonly actionFailed: string
}

/** Pure lead pipeline state. */
export type AcademyLeadPipelineViewProps = {
    readonly state: "resting" | "empty" | "refused" | "answered"
    readonly leads: ReadonlyArray<ExpertSiteLead>
    readonly selected?: ExpertSiteLead
    readonly draft?: string
    readonly pendingAction?: "advance" | "draft"
    readonly message?: string
    readonly labels: AcademyLeadPipelineLabels
    readonly onOpenLead: (leadId: string) => void
    readonly onAdvance: () => void
    readonly onDraftReply: () => void
}

/** Render leads as a joined identity scan with one selected follow-up. */
export const _AcademyLeadPipeline = ({ state, leads, selected, draft, pendingAction, message, labels, onOpenLead, onAdvance, onDraftReply }: AcademyLeadPipelineViewProps) => {
    const rows = state === "resting"
        ? [0, 1, 2].map(() => defineContractComponent("avatar-identity-badge-action-row", {
            avatar: defineLeafComponent("avatar", {}, () => <Avatar props={{ size: "md" }} isLoading />),
            identity: defineContractComponent("name-over-handle", {
                name: defineLeafComponent("text-link", { size: "sm" }, () => <TextLink props={{ label: "", size: "sm" }} isLoading />),
                handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: "" }} isLoading />),
            }),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: labels.open }} isLoading />),
        }))
        : leads.map((lead) => defineContractComponent("avatar-identity-badge-action-row", {
            avatar: defineLeafComponent("avatar", {}, () => <Avatar props={{ name: lead.name, size: "md" }} />),
            identity: defineContractComponent("name-over-handle", {
                name: defineLeafComponent("text-link", { size: "sm" }, () => <TextLink props={{ label: lead.name, size: "sm" }} on={{ press: () => onOpenLead(lead.id) }} />),
                handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: lead.contact, size: "xs", tone: "muted" }} />),
            }),
            badge: defineLeafComponent("badge", {}, () => <Badge props={{ content: lead.status, tone: lead.status === "converted" ? "success" : "neutral" }} />),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: labels.open, size: "sm" }} on={{ press: () => onOpenLead(lead.id) }} />),
        }))
    const refusalNote = state === "refused" ? labels.refused : undefined
    const note = state === "empty" ? labels.empty : refusalNote
    return (
        <>
            {note === undefined ? (
                <SurfaceCard
                    props={{ label: labels.section, fact: state === "answered" ? String(leads.length) : undefined }}
                    contract="identity-action-list"
                    render={defineContractComponent("identity-action-list", { item: rows })}
                    isLoading={state === "resting"}
                />
            ) : (
                <SurfaceCard props={{ label: labels.section }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", {
                    note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: note, size: "sm", tone: "muted" }} />),
                })} />
            )}
            {selected === undefined ? null : (
                <SurfaceCard
                    props={{ label: labels.detail }}
                    contract="heading-body-action-stack"
                    render={defineContractComponent("heading-body-action-stack", {
                        heading: defineLeafComponent("heading", {}, () => <Heading props={{ content: selected.name, level: 3 }} />),
                        body: defineLeafComponent("text", {}, () => <Text props={{ content: draft ?? selected.message ?? selected.contact, size: "sm", tone: "muted" }} />),
                        action: defineLeafComponent("button", {}, () => <Button props={{ label: draft === undefined ? labels.draft : labels.advance, variant: "primary", isPending: pendingAction !== undefined }} on={{ press: draft === undefined ? onDraftReply : onAdvance }} />),
                    })}
                />
            )}
            {message === undefined ? null : <Text props={{ content: message, size: "sm", tone: "muted" }} />}
        </>
    )
}

/** Source-level tier marker for the pure Academy lead block. */
export const meta = { shape: "block", world: "pure" } as const
