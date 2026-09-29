import { StatusActionCard } from "@nivo/ui"
import { SurfaceCard, Button, Input, Text } from "@starci/grammar/common"
import { QueryNotice } from "../../query/QueryNotice"
import type {
    AcademyIntegrationCenterProps,
    AcademyIntegrationCenterViewProps,
} from "../../../../modules/academy/integration-center"

export type {
    AcademyIntegrationCard,
    AcademyIntegrationCenterActions,
    AcademyIntegrationCenterData,
    AcademyIntegrationCenterProps,
    AcademyIntegrationCenterViewProps,
    AcademyIntegrationFormField,
} from "../../../../modules/academy/integration-center"

/** Render provider status and one selected write-only setup form. */
const AcademyIntegrationCenterContent = (input: AcademyIntegrationCenterViewProps) => {
    const { state } = input
    const { sectionLabel, failure, cards, selected, pendingId, outcome } = input.props
    const { select, changeField, submit, retry } = input.on
    return (
        <>
            {state === "failed" ? (
                <SurfaceCard label={sectionLabel}>
                    <div>{failure === undefined ? null : <QueryNotice props={{ failure }} on={{ retry }} />}</div>
                </SurfaceCard>
            ) : (
                <SurfaceCard label={sectionLabel}>
                    <div>
                        {cards.map((card) => (
                            <StatusActionCard
                                key={card.id}
                                props={{
                                    ...card,
                                    isPending: pendingId === card.id,
                                    disabled: pendingId !== undefined,
                                }}
                                on={{
                                    press: () => select(card.id),
                                }}
                                isLoading={state === "resting"}
                            />
                        ))}
                    </div>
                </SurfaceCard>
            )}
            {selected === undefined ? null : (
                <SurfaceCard label={selected.label}>
                    <div>
                        {selected.fields.map((field) => (
                            <Input
                                key={field.id}
                                {...field}
                                isDisabled={pendingId !== undefined}
                                revealLabel={field.kind === "password" ? selected.revealLabel : undefined}
                                hideLabel={field.kind === "password" ? selected.hideLabel : undefined}
                                variant="secondary"
                                onValueChange={(value) => changeField(field.name, value)}
                            />
                        ))}
                        <Button variant="primary" isPending={pendingId === selected.id} onPress={submit}>
                            {selected.submitLabel}
                        </Button>
                    </div>
                </SurfaceCard>
            )}
            {outcome === undefined ? null : (
                <Text size="sm" tone="muted" live="polite">
                    {outcome}
                </Text>
            )}
        </>
    )
}

/** Stable typed root for the Academy integration block. */
export const AcademyIntegrationCenterBase = (props: AcademyIntegrationCenterProps) => (
    <AcademyIntegrationCenterContent {...props} />
)
