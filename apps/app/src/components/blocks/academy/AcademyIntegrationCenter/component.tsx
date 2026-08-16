import {
    Button,
    Field,
    StatusActionCard,
    SurfaceCard,
    Text,
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BadgeTone,
    type FieldKind,
} from "@nivo/ui"

/** One safe provider card; it contains no credential value. */
export type AcademyIntegrationCard = {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly statusLabel: string
    readonly statusTone: BadgeTone
    readonly detail?: string
    readonly actionLabel: string
}

/** One provider-specific local form field. */
export type AcademyIntegrationFormField = {
    readonly id: string
    readonly name: string
    readonly label: string
    readonly kind?: FieldKind
    readonly hint?: string
}

/** Resolved pure Integration Center state. */
export type AcademyIntegrationCenterViewProps = {
    readonly state: "resting" | "refused" | "answered"
    readonly sectionLabel: string
    readonly refusedLabel: string
    readonly cards: ReadonlyArray<AcademyIntegrationCard>
    readonly selected?: {
        readonly id: string
        readonly label: string
        readonly fields: ReadonlyArray<AcademyIntegrationFormField>
        readonly submitLabel: string
    }
    readonly pendingId?: string
    readonly outcome?: string
    readonly onSelect: (id: string) => void
    readonly onChangeField: (name: string, value: string) => void
    readonly onSubmit: () => void
}

/** Render provider status and one selected write-only setup form. */
export const _AcademyIntegrationCenter = ({ state, sectionLabel, refusedLabel, cards, selected, pendingId, outcome, onSelect, onChangeField, onSubmit }: AcademyIntegrationCenterViewProps) => (
    <>
        {state === "refused" ? (
            <SurfaceCard
                props={{ label: sectionLabel }}
                contract="body-with-refusal-note"
                render={defineContractComponent("body-with-refusal-note", {
                    note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: refusedLabel, size: "sm", tone: "muted" }} />),
                })}
            />
        ) : (
            <SurfaceCard
                props={{ label: sectionLabel }}
                contract="status-action-card-grid"
                render={defineContractComponent("status-action-card-grid", {
                    item: cards.map((card) => defineCompositeComponent("status-action-card", {}, () => (
                        <StatusActionCard
                            key={card.id}
                            props={{ ...card, isPending: pendingId === card.id, disabled: pendingId !== undefined }}
                            on={{ press: () => onSelect(card.id) }}
                            isLoading={state === "resting"}
                        />
                    ))),
                })}
            />
        )}
        {selected === undefined ? null : (
            <SurfaceCard
                props={{ label: selected.label }}
                contract="form-column"
                render={defineContractComponent("form-column", {
                    field: selected.fields.map((field) => defineContractProjection("label-field-hint", () => (
                        <Field
                            key={field.id}
                            props={{ ...field, disabled: pendingId !== undefined, revealLabel: field.kind === "password" ? "Show" : undefined, hideLabel: field.kind === "password" ? "Hide" : undefined }}
                            on={{ change: (value) => onChangeField(field.name, value) }}
                        />
                    ))),
                    submit: defineLeafComponent("button", {}, () => <Button props={{ label: selected.submitLabel, variant: "primary", isPending: pendingId === selected.id }} on={{ press: onSubmit }} />),
                })}
            />
        )}
        {outcome === undefined ? null : <Text props={{ content: outcome, size: "sm", tone: "muted", live: "polite" }} />}
    </>
)

/** Source-level tier marker for the pure Academy Integration Center. */
export const meta = { shape: "block", world: "pure" } as const
