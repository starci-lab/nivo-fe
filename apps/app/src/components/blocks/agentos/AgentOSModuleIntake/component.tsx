import { Button, Field, Heading, SurfaceCard, Text, Tree, defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"

/** Opening-goal form copy, local state and persistence action. */
export type AgentOSModuleIntakeViewProps = {
    readonly goal: string
    readonly pending: boolean
    readonly error?: string
    readonly title: string
    readonly description: string
    readonly fieldLabel: string
    readonly placeholder: string
    readonly note: string
    readonly action: string
    readonly guideTitle: string
    readonly guideSteps: ReadonlyArray<string>
    readonly guideNote: string
    readonly onGoal: (value: string) => void
    readonly onSubmit: () => void
}

/** Draw the bounded first-goal form beside its adaptive interview explanation. */
export const AgentOSModuleIntakeBase = ({ goal, pending, error, title, description, fieldLabel, placeholder, note, action, guideTitle, guideSteps, guideNote, onGoal, onSubmit }: AgentOSModuleIntakeViewProps) => (
    <Tree contract="console-primary-aside" render={defineContractComponent("console-primary-aside", {
        primary: defineContractComponent("console-section-stack", { section: [defineContractComponent("label-row-over-card", {
            body: defineContractProjection("module-intake-form", () => <SurfaceCard contract="module-intake-form" render={defineContractComponent("module-intake-form", {
                prompt: defineContractComponent("title-over-description", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 2 }} />),
                    description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: description, size: "sm", tone: "muted" }} />),
                }),
                goal: defineCompositeComponent("field", {}, () => <Field props={{ id: "module-goal", name: "goal", label: fieldLabel, placeholder, hint: error, isInvalid: error !== undefined, disabled: pending }} on={{ change: onGoal }} />),
                note: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: note, size: "xs" }} />),
                action: defineLeafComponent("button", {}, () => <Button props={{ label: action, variant: "primary", isPending: pending, disabled: goal.trim().length < 3 }} on={{ press: onSubmit }} />),
            })} />),
        })] }),
        aside: defineContractComponent("console-section-stack", { section: [defineContractComponent("label-row-over-card", {
            body: defineContractProjection("adaptive-intake-explanation", () => <SurfaceCard contract="adaptive-intake-explanation" render={defineContractComponent("adaptive-intake-explanation", {
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: guideTitle, level: 3 }} />),
                steps: defineContractComponent("numbered-step-stack", { step: guideSteps.map((step, index) => defineContractComponent("step-number-then-instruction", { ordinal: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: String(index + 1), size: "sm", weight: "semibold" }} />), instruction: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: step, size: "sm" }} />) })) }),
                note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: guideNote, size: "sm", tone: "muted" }} />),
            })} />),
        })] }),
    })} />
)

/** Source-level tier marker for the pure intake block. */
export const meta = { shape: "block", world: "pure" } as const
