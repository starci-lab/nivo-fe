import type { ReactNode } from "react"
import type { AccountingSurfaceStanding } from "@/modules/accounting/accounting-workbench"
import { Badge, Button, Input, SurfaceCard, Text } from "@starci/grammar/common"
import { accountingEvidenceStateKey } from "@/modules/accounting/accounting-workbench"
import {
    AccountingWorkbenchActionRow,
    AccountingWorkbenchFieldStack,
    AccountingWorkbenchRow,
} from "./accounting-workbench.shared"
import { ACCOUNTING_EVIDENCE_TONES, accountingToneFor, accountingSubmitOn } from "./accounting-workbench.helpers"
import { ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME, ACCOUNTING_FORM_GRID_CLASS_NAME } from "./classNames"
import type { AccountingWorkbenchSectionData } from "./accounting-workbench.types"
import { AccountingWorkbenchRegion } from "./accounting-workbench.shared"

/** Props for the intake accounting workbench unit. */
type AccountingWorkbenchIntakeProps = { readonly props: AccountingWorkbenchSectionData }

/** Draw the intake accounting workbench section from settled view data. */
export const AccountingWorkbenchIntake = (props: AccountingWorkbenchIntakeProps) => {
    const { view, shared, scopeReady } = props.props
    const { t } = view

    const region = (
        standing: AccountingSurfaceStanding,
        empty: string,
        emptyHint: string,
        children: ReactNode,
    ) => (
        <AccountingWorkbenchRegion
            props={{ view, shared, scopeReady, standing, empty, emptyHint }}
        >
            {children}
        </AccountingWorkbenchRegion>
    )
    return (
        <SurfaceCard label={t("intake.label")}>
            <form onSubmit={accountingSubmitOn(view.intake.onAdmit)}>
                <div className={ACCOUNTING_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="accounting-evidence-id"
                        name="accounting-evidence-id"
                        label={t("intake.evidenceId")}
                        hint={t("intake.evidenceIdHint")}
                        value={view.intake.evidenceId}
                        onValueChange={view.intake.setEvidenceId}
                        isRequired
                    />
                    <Input
                        id="accounting-source-kind"
                        name="accounting-source-kind"
                        label={t("intake.sourceKind")}
                        value={view.intake.sourceKind}
                        onValueChange={view.intake.setSourceKind}
                        isRequired
                    />
                    <Input
                        id="accounting-source-ref"
                        name="accounting-source-ref"
                        label={t("intake.sourceRef")}
                        value={view.intake.sourceRef}
                        onValueChange={view.intake.setSourceRef}
                        isRequired
                    />
                    <Input
                        id="accounting-source-revision"
                        name="accounting-source-revision"
                        label={t("intake.sourceRevision")}
                        value={view.intake.sourceRevision}
                        onValueChange={view.intake.setSourceRevision}
                        isRequired
                    />
                    <Input
                        id="accounting-fingerprint"
                        name="accounting-fingerprint"
                        label={t("intake.fingerprint")}
                        hint={t("intake.fingerprintHint")}
                        value={view.intake.fingerprint}
                        onValueChange={view.intake.setFingerprint}
                        isRequired
                    />
                    <Input
                        id="accounting-intake-revision"
                        name="accounting-intake-revision"
                        label={t("intake.expectedRevision")}
                        value={view.intake.intakeRevision}
                        onValueChange={view.intake.setIntakeRevision}
                        isRequired
                    />
                    <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}>
                        <AccountingWorkbenchActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.intake.isAdmitting}
                                isDisabled={
                                    !scopeReady ||
                                    view.intake.evidenceId.length === 0 ||
                                    view.intake.sourceKind.length === 0 ||
                                    view.intake.sourceRef.length === 0 ||
                                    view.intake.sourceRevision.length === 0 ||
                                    view.intake.fingerprint.length === 0
                                }
                            >
                                {t("intake.admit")}
                            </Button>
                            <Button size="lg" type="button" variant="ghost" onPress={view.intake.reload}>
                                {t("reload")}
                            </Button>
                        </AccountingWorkbenchActionRow>
                    </div>
                </div>
            </form>
            {region(
                view.intake.standing,
                t("intake.empty"),
                t("intake.emptyHint"),
                view.intake.model === null ? null : (
                    <AccountingWorkbenchRow>
                        <AccountingWorkbenchActionRow>
                            <Text weight="semibold">{view.intake.model.evidenceId}</Text>
                            <Badge tone={accountingToneFor(ACCOUNTING_EVIDENCE_TONES, view.intake.model.state)}>
                                {t(accountingEvidenceStateKey(view.intake.model.state))}
                            </Badge>
                            <Badge tone="neutral">{t("revision", { value: view.intake.model.revision })}</Badge>
                        </AccountingWorkbenchActionRow>
                        <Text size="sm">
                            {view.intake.model.missingFacts.length === 0
                                ? t("intake.noMissingFacts")
                                : t("intake.missingFacts", { facts: view.intake.model.missingFacts.join(", ") })}
                        </Text>
                        {view.intake.model.state === "likely_duplicate" ? (
                            <Text size="sm" tone="accent">
                                {t("intake.duplicateNotice")}
                            </Text>
                        ) : null}
                        {view.intake.model.state === "needs_information" ? (
                            <Text size="sm" tone="accent">
                                {t("intake.conflictNotice")}
                            </Text>
                        ) : null}
                    </AccountingWorkbenchRow>
                ),
            )}
        </SurfaceCard>
    )
}
