import type { ReactNode } from "react"
import { SalesWorkbenchActionRow, SalesWorkbenchFieldStack, SalesWorkbenchRegion, SalesWorkbenchRow } from "./sales-workbench.shared"
import type { SalesWorkbenchSectionProps } from "./sales-workbench.types"
import { Badge, Button, SurfaceCard, Text } from "@starci/grammar/common"
import { salesCommandStatusKey, salesWording, type SalesSurfaceStanding } from "@/modules/sales/sales-workbench"
import type { SalesActionValue } from "@/modules/api/sales"
import { SALES_ACTION_TONES, SALES_COMMAND_TONES, salesWorkbenchActionText, salesWorkbenchToneFor } from "./sales-workbench.helpers"
import { SALES_OPERATIONS_GRID_CLASS_NAME } from "./classNames"

/** Props for the command history and routine Sales workbench unit. */
type SalesWorkbenchHistoryRoutineProps = SalesWorkbenchSectionProps

/** Draw the command history and routine Sales workbench unit from settled view data. */
export const SalesWorkbenchHistoryRoutine = (props: SalesWorkbenchHistoryRoutineProps) => {
    const { view, format, shared } = props.props
    const { t, scopeReady } = view
    const actionText = (status: string) => salesWorkbenchActionText(status, t)
    const actionFacts = (model: SalesActionValue) => (
        <SalesWorkbenchFieldStack>
            <SalesWorkbenchActionRow>
                <Badge tone={salesWorkbenchToneFor(SALES_ACTION_TONES, model.status)}>{salesWorkbenchActionText(model.status, t)}</Badge>
                <Badge tone="neutral">{t("revision", { value: model.revision })}</Badge>
                <Badge tone="neutral">{t("routine.attempt", { value: model.attemptGeneration })}</Badge>
            </SalesWorkbenchActionRow>
            <Text size="xs" tone="muted">
                {t("routine.receipt", {
                    receipt: model.receiverReceipt === null ? t("none") : JSON.stringify(model.receiverReceipt),
                })}
            </Text>
            {model.observationGap ? (
                <Text size="sm" tone="accent" live="polite">
                    {t("routine.gap")}
                </Text>
            ) : null}
        </SalesWorkbenchFieldStack>
    )

    const region = (
        standing: SalesSurfaceStanding,
        empty: string,
        emptyHint: string,
        children: ReactNode,
    ) => (
        <SalesWorkbenchRegion props={{ ...props.props, standing, empty, emptyHint }}>
            {children}
        </SalesWorkbenchRegion>
    )
    const history = () => (
        <SurfaceCard
            label={t("history.label")}
            fact={
                view.history.model === null
                    ? undefined
                    : salesWording(salesCommandStatusKey(view.history.model.status), view.history.model.status, t)
            }
        >
            <SalesWorkbenchActionRow>
                <Button size="lg" variant="ghost" onPress={view.history.retry}>
                    {t("reload")}
                </Button>
            </SalesWorkbenchActionRow>
            {region(
                view.history.standing,
                t("history.empty"),
                t("history.emptyHint"),
                view.history.model === null ? null : (
                    <SalesWorkbenchFieldStack>
                        <SalesWorkbenchActionRow>
                            <Text weight="semibold">{view.history.model.commandId}</Text>
                            <Badge tone={salesWorkbenchToneFor(SALES_COMMAND_TONES, view.history.model.status)}>
                                {salesWording(
                                    salesCommandStatusKey(view.history.model.status),
                                    view.history.model.status,
                                    t,
                                )}
                            </Badge>
                            <Badge tone="neutral">{t("revision", { value: view.history.model.revision })}</Badge>
                            <Badge tone="neutral">
                                {t("history.commandRevision", { value: view.history.model.commandRevision })}
                            </Badge>
                        </SalesWorkbenchActionRow>
                        <Text size="sm">
                            {t("history.actions", {
                                actions:
                                    view.history.model.actionIds.length === 0
                                        ? t("none")
                                        : view.history.model.actionIds.join(", "),
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("history.clarification", {
                                clarification:
                                    view.history.model.clarification === null
                                        ? t("none")
                                        : JSON.stringify(view.history.model.clarification),
                            })}
                        </Text>
                    </SalesWorkbenchFieldStack>
                ),
            )}
        </SurfaceCard>
    )
    const routine = () => (
        <SurfaceCard
            label={t("routine.label")}
            fact={view.routine.model === null ? undefined : salesWorkbenchActionText(view.routine.model.status, t)}
        >
            {region(
                view.routine.standing,
                t("routine.empty"),
                t("routine.emptyHint"),
                view.routine.model === null ? null : actionFacts(view.routine.model),
            )}
            <SalesWorkbenchActionRow>
                <Button size="lg" variant="ghost" onPress={view.routine.reload}>
                    {t("reload")}
                </Button>
            </SalesWorkbenchActionRow>
        </SurfaceCard>
    )

    return <div className={SALES_OPERATIONS_GRID_CLASS_NAME}>{history()}{routine()}</div>
}
