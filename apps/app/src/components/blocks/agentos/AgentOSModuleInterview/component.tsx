import { Button, Field, Heading, SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentosModuleStudio } from "@/modules/api/console"

/** Durable conversation projection and the one current answer operation. */
export type AgentOSModuleInterviewViewProps = {
    readonly state: "loading" | "refused" | "ready"
    readonly studio?: AgentosModuleStudio
    readonly answer: string
    readonly pending: boolean
    readonly labels: { readonly title: string, readonly saved: string, readonly refused: string, readonly field: string, readonly placeholder: string, readonly send: string, readonly complete: string, readonly agent: string, readonly you: string }
    readonly onAnswer: (value: string) => void
    readonly onSend: () => void
}

/** Draw accepted turns before the single backend-selected follow-up composer. */
export const AgentOSModuleInterviewBase = ({ state, studio, answer, pending, labels, onAnswer, onSend }: AgentOSModuleInterviewViewProps) => {
    if (state === "refused") return <SurfaceCard props={{ label: labels.title }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", { note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.refused, size: "sm", tone: "muted" }} />) })} />
    const loading = state === "loading"
    const messages = loading ? [{ id: "1", role: "assistant" as const, content: "" }, { id: "2", role: "user" as const, content: "" }, { id: "3", role: "assistant" as const, content: "" }] : (studio?.messages ?? [])
    return <SurfaceCard props={{ label: labels.title }} contract="adaptive-module-interview" render={defineContractComponent("adaptive-module-interview", {
        heading: defineContractComponent("subject-over-muted-caption", {
            subject: defineLeafComponent("heading", {}, () => <Heading props={{ content: studio?.module.currentQuestion ?? labels.complete, level: 3 }} isLoading={loading} />),
            caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: labels.saved, size: "xs" }} />),
        }),
        message: messages.map((message) => defineContractComponent("module-interview-message", {
            actor: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: message.role === "assistant" ? labels.agent : labels.you, size: "xs", weight: "semibold" }} isLoading={loading} />),
            content: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: message.content, size: "sm" }} isLoading={loading} />),
        })),
        ...(studio?.module.currentQuestion === null ? {} : { composer: defineContractComponent("form-column", {
            field: [defineContractComponent("label-field-hint", {
                label: defineLeafComponent("label", {}, () => <Field props={{ id: "module-answer", name: "answer", label: labels.field, placeholder: labels.placeholder, disabled: pending }} on={{ change: onAnswer }} />),
                field: defineLeafComponent("field", {}, () => null),
            })],
            submit: defineLeafComponent("button", {}, () => <Button props={{ label: labels.send, variant: "primary", isPending: pending, disabled: answer.trim().length === 0 }} on={{ press: onSend }} />),
        }) }),
    })} isLoading={loading} />
}

/** Source-level tier marker for the pure interview block. */
export const meta = { shape: "block", world: "pure" } as const
