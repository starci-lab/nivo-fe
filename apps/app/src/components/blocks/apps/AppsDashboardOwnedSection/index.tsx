import { IconSource } from "@nivo/ui"
import { EmptyNotice, Icon, SurfaceCard, Text } from "@starci/grammar/common"
import { FleetRow } from "../../provisioning/FleetRow"
import {
    supportedTemplateOffer,
    type CatalogueSectionView,
    type OwnedAppRow,
    type OwnedSectionView,
} from "../../../../modules/apps/apps-dashboard"
import { AppsDashboardRefusedSection } from "../AppsDashboardRefusedSection"
import { AppsDashboardRestingRows } from "../AppsDashboardRestingRows"
import { APPS_DASHBOARD_OWNED_LIST_CLASS_NAME } from "./classNames"

/** Props for {@link AppsDashboardOwnedSection}. */
type AppsDashboardOwnedSectionProps = {
    readonly owned: OwnedSectionView
    readonly catalogue: CatalogueSectionView
    readonly buildAppLabel?: string
    readonly attentionGroupLabel?: string
    readonly steadyGroupLabel?: string
    readonly onBuildTemplate: (templateKey: string) => void
    readonly onOpenOwnedApp: (siteId: string) => void
}

const ownedRow = (row: OwnedAppRow, onOpenOwnedApp: (siteId: string) => void) => (
    <FleetRow
        key={row.id}
        props={{
            id: row.id,
            name: row.name,
            detail: row.detail,
            kind: "site",
            kindLabel: row.kindLabel,
            status: row.status,
            statusLabel: row.statusLabel,
            actionLabel: row.actionLabel,
        }}
        on={{ open: () => onOpenOwnedApp(row.id), act: () => onOpenOwnedApp(row.id) }}
    />
)

const groupedRows = (
    rows: ReadonlyArray<OwnedAppRow>,
    attentionLabel: string,
    steadyLabel: string,
    onOpenOwnedApp: (siteId: string) => void,
) => {
    const attention = rows.filter((row) => ["awaiting_dns", "failed", "suspended"].includes(row.status))
    const steady = rows.filter((row) => !["awaiting_dns", "failed", "suspended"].includes(row.status))
    const group = (label: string, members: ReadonlyArray<OwnedAppRow>) => (
        <div key={label}>
            <Text size="sm" tone="muted">
                {label}
            </Text>
            <div>{members.map((row) => ownedRow(row, onOpenOwnedApp))}</div>
        </div>
    )
    return (
        <div className={APPS_DASHBOARD_OWNED_LIST_CLASS_NAME}>
            {attention.length === 0 ? [] : group(attentionLabel, attention)}
            {steady.length === 0 ? [] : group(steadyLabel, steady)}
        </div>
    )
}

/** Draw the owned rows, including paid orders whose sites are still provisioning. */
export const AppsDashboardOwnedSection = (props: AppsDashboardOwnedSectionProps) => {
    const { owned, catalogue, buildAppLabel, attentionGroupLabel, steadyGroupLabel, onBuildTemplate, onOpenOwnedApp } =
        props
    const supportedOffer = supportedTemplateOffer(catalogue)
    if (owned.phase === "empty")
        return (
            <SurfaceCard label={owned.label}>
                <div>
                    <EmptyNotice
                        message={owned.note}
                        actionLabel={supportedOffer === undefined ? undefined : buildAppLabel}
                        actionStartContent={
                            supportedOffer === undefined || buildAppLabel === undefined ? undefined : (
                                <Icon source={IconSource("retry", "chip")} usage="chip" />
                            )
                        }
                        onAction={
                            supportedOffer === undefined || buildAppLabel === undefined
                                ? undefined
                                : () => onBuildTemplate(supportedOffer.templateKey)
                        }
                    />
                </div>
            </SurfaceCard>
        )
    if (owned.phase === "refused") return <AppsDashboardRefusedSection label={owned.label} note={owned.note} />
    if (owned.phase === "answered" && attentionGroupLabel !== undefined && steadyGroupLabel !== undefined)
        return (
            <SurfaceCard label={owned.label}>
                {groupedRows(owned.rows, attentionGroupLabel, steadyGroupLabel, onOpenOwnedApp)}
            </SurfaceCard>
        )
    if (owned.phase === "answered")
        return (
            <SurfaceCard label={owned.label}>
                <div className={APPS_DASHBOARD_OWNED_LIST_CLASS_NAME}>
                    {owned.rows.map((row) => ownedRow(row, onOpenOwnedApp))}
                </div>
            </SurfaceCard>
        )
    return (
        <SurfaceCard label={owned.label}>
            <AppsDashboardRestingRows indexes={[1, 2, 3]} />
        </SurfaceCard>
    )
}
