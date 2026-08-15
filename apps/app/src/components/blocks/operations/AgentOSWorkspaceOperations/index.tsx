import { OperationActionRail, SurfaceCard, Text, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"

/** Resolved lifecycle labels consumed by the operations block. */
export type AgentOSWorkspaceOperationsProps = {
    readonly labels: {
        readonly section: string
        readonly note: string
        readonly update: string
        readonly plan: string
        readonly backup: string
        readonly reset: string
        readonly rebuild: string
    }
}

/** Expose the approved lifecycle vocabulary without inventing mutations the public API does not own yet. */
export const AgentOSWorkspaceOperations = ({ labels }: AgentOSWorkspaceOperationsProps) => (
    <SurfaceCard
        props={{ label: labels.section }}
        contract="body-with-refusal-note"
        render={defineContractComponent("body-with-refusal-note", {
            answered: defineContractProjection("inline-action-run", () => (
                <OperationActionRail
                    props={{
                        id: "workspace-operations",
                        actions: [labels.update, labels.plan, labels.backup, labels.reset, labels.rebuild]
                            .map((label) => ({ id: label, label, disabled: true })),
                    }}
                />
            )),
            note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.note, size: "sm", tone: "muted" }} />),
        })}
    />
)

/** Source-level tier marker for the pure operations block. */
export const meta = { shape: "block", world: "pure" } as const
