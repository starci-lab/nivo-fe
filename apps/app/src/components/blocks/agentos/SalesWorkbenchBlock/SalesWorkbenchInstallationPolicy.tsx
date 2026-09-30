import type { ReactNode } from "react"
import { Badge, Button, Input, SurfaceCard, Text } from "@starci/grammar/common"
import { formatSalesInstant, type SalesSurfaceStanding } from "@/modules/sales/sales-workbench"
import { salesWorkbenchSubmitOn } from "./sales-workbench.helpers"
import { SalesWorkbenchActionRow, SalesWorkbenchFieldStack, SalesWorkbenchRegion, SalesWorkbenchRow } from "./sales-workbench.shared"
import type { SalesWorkbenchSectionProps } from "./sales-workbench.types"

/** Props for the installation and policy presentation unit. */
type SalesWorkbenchInstallationPolicyProps = SalesWorkbenchSectionProps

/** Draw installation readiness and the configured policy facts in their own cards. */
export const SalesWorkbenchInstallationPolicy = (props: SalesWorkbenchInstallationPolicyProps) => {
    const { view, format, shared } = props.props
    const { t, scopeReady } = view

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
    const installationFact = (): string | undefined => {
        const model = view.installation.model
        if (model === null) return undefined
        return model.ready ? t("installation.ready") : t("installation.notReady")
    }
    const installation = () => (
        <SurfaceCard label={t("installation.label")} fact={installationFact()}>
            {region(
                view.installation.standing,
                t("installation.empty"),
                t("installation.emptyHint"),
                view.installation.model === null ? null : (
                    <SalesWorkbenchFieldStack>
                        <SalesWorkbenchActionRow>
                            <Badge tone={view.installation.model.ready ? "success" : "warning"}>
                                {view.installation.model.ready ? t("installation.ready") : t("installation.notReady")}
                            </Badge>
                            <Badge tone="neutral">{t("revision", { value: view.installation.model.revision })}</Badge>
                        </SalesWorkbenchActionRow>
                        <Text size="xs" tone="muted">
                            {t("installation.observedAt", {
                                at: formatSalesInstant(view.installation.model.observedAt, format),
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("installation.identity", {
                                lifecycle: view.installation.model.lifecycleIntentId,
                                configuration: view.installation.model.configurationRevision,
                            })}
                        </Text>
                    </SalesWorkbenchFieldStack>
                ),
            )}
            <SalesWorkbenchActionRow>
                <Button size="lg" variant="ghost" onPress={view.installation.reload}>
                    {t("reload")}
                </Button>
            </SalesWorkbenchActionRow>
        </SurfaceCard>
    )
    const policy = () => (
        <SurfaceCard
            label={t("policy.label")}
            fact={
                view.policy.model === null
                    ? undefined
                    : t("policy.revisionFact", { revision: view.policy.model.revision })
            }
        >
            <form onSubmit={salesWorkbenchSubmitOn(view.policy.onConfigure)}>
                <SalesWorkbenchFieldStack>
                    <Input
                        id="sales-policy-revision"
                        name="sales-policy-revision"
                        label={t("policy.expectedRevision")}
                        hint={t("policy.expectedRevisionHint")}
                        value={view.policy.revision}
                        onValueChange={view.policy.setRevision}
                    />
                    <Input
                        id="sales-policy-cadence"
                        name="sales-policy-cadence"
                        label={t("policy.cadence")}
                        hint={t("policy.cadenceHint")}
                        value={view.policy.cadence}
                        onValueChange={view.policy.setCadence}
                    />
                    <SalesWorkbenchActionRow>
                        <Button
                            size="lg"
                            type="submit"
                            variant="secondary"
                            isPending={view.policy.isConfiguring}
                            isDisabled={!scopeReady}
                        >
                            {t("policy.configure")}
                        </Button>
                    </SalesWorkbenchActionRow>
                    <Text size="xs" tone="muted">
                        {t("policy.unsetNote")}
                    </Text>
                </SalesWorkbenchFieldStack>
            </form>
            {view.policy.model === null ? null : (
                <SalesWorkbenchFieldStack>
                    <Text size="xs" tone="muted">
                        {t("policy.unsetItems", {
                            items:
                                view.policy.model.unsetItems.length === 0
                                    ? t("none")
                                    : view.policy.model.unsetItems.join(", "),
                        })}
                    </Text>
                </SalesWorkbenchFieldStack>
            )}
        </SurfaceCard>
    )

    return <>{installation()}{policy()}</>
}
