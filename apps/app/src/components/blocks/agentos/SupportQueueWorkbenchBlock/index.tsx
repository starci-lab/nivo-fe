"use client"

import { Heading, SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { SupportImportantFact, SupportTicket } from "@/modules/api/workspace-controlplane"

/** Evidence-sidecar input for one selected customer or the whole support queue. */
export type SupportQueueWorkbenchBlockProps = {
    readonly tickets: ReadonlyArray<SupportTicket>
    readonly facts: ReadonlyArray<SupportImportantFact>
    readonly selectedConversationId: string | null
    readonly pending: boolean
}

/** Evidence sidecar for durable facts and incidents extracted from channel messages. */
export const SupportQueueWorkbenchBlock = ({ tickets, facts, selectedConversationId, pending }: SupportQueueWorkbenchBlockProps) => {
    const visibleTickets = selectedConversationId === null ? tickets : tickets.filter((ticket) => ticket.conversationId === selectedConversationId)
    const visibleFacts = selectedConversationId === null ? facts : facts.filter((fact) => fact.conversationId === selectedConversationId)
    const rows = [
        ...visibleFacts.map((fact) => ({
            id: fact.id,
            label: fact.factType,
            value: `${fact.value} · Confidence ${fact.confidence} · source ${fact.sourceMessageId.slice(0, 8)}`,
        })),
        ...visibleTickets.map((ticket) => ({
            id: ticket.id,
            label: `${ticket.priority.toUpperCase()} · ${ticket.title}`,
            value: `${ticket.summary} · Evidence ${ticket.evidenceCount} · ${ticket.state}`,
        })),
    ]
    const visibleRows = rows.length === 0
        ? [{ id: "queue", label: "Queue", value: pending ? "Loading important information…" : "No important item for this customer" }]
        : rows
    return (
        <SurfaceCard
            props={{ label: "Support workbench", fact: `${rows.length} important items` }}
            contract="agentos-workbench-body"
            render={defineContractComponent("agentos-workbench-body", {
                identity: defineContractComponent("subject-over-muted-caption", {
                    subject: defineLeafComponent("heading", {}, () => <Heading props={{ content: "Important information", level: 3 }} />),
                    caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: "Incidents and facts extracted from the selected customer history.", size: "xs", tone: "muted" }} />),
                }),
                facts: defineContractComponent("labelled-fact-stack", {
                    fact: visibleRows.map((fact) => defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: fact.label, size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: fact.value, size: "sm", weight: "semibold" }} />),
                    })),
                }),
                notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: "Queue entries keep their source conversation and evidence count; they do not rewrite customer history.", size: "sm", tone: "muted" }} />),
            })}
        />
    )
}

/** Source-level tier marker for the pure Support queue workbench. */
export const meta = { shape: "block", world: "pure" } as const
