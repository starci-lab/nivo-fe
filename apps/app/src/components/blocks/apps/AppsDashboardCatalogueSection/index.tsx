import { Badge, Button, Heading, SurfaceCard, Text, TextAction } from "@starci/grammar/common"
import type { CatalogueSectionView, TemplateOfferRowView } from "../../../../modules/apps/apps-dashboard"
import { AppsDashboardRefusedSection } from "../AppsDashboardRefusedSection"
import { AppsDashboardRestingRows } from "../AppsDashboardRestingRows"
import { APPS_DASHBOARD_CATALOGUE_CONTENT_CLASS_NAME } from "./classNames"

export type AppsDashboardCatalogueSectionProps = {
    readonly catalogue: CatalogueSectionView
    readonly onBuildTemplate: (templateKey: string) => void
}

const offerRow = (row: TemplateOfferRowView, onBuildTemplate: (templateKey: string) => void) => (
    <div key={row.id}>
        <div>
            <TextAction size="sm">{row.name}</TextAction>
            <Text size="xs" tone="muted">
                {row.tagline}
            </Text>
        </div>
        <Badge tone="neutral">{row.kindLabel}</Badge>
        <Text size="sm">{row.priceLabel}</Text>
        <Button
            size="sm"
            variant="primary"
            isDisabled={row.actionDisabled}
            onPress={() => onBuildTemplate(row.templateKey)}
        >
            {row.actionLabel}
        </Button>
    </div>
)

const sentenceSection = (label: string, note: string) => (
    <div className={APPS_DASHBOARD_CATALOGUE_CONTENT_CLASS_NAME}>
        <div>
            <Heading level={3}>{label}</Heading>
        </div>
        <Text size="sm" tone="muted">
            {note}
        </Text>
    </div>
)

/** Draw the available template catalogue, with one list identity across states. */
export const AppsDashboardCatalogueSection = ({ catalogue, onBuildTemplate }: AppsDashboardCatalogueSectionProps) => {
    if (catalogue.phase === "empty") return sentenceSection(catalogue.label, catalogue.note)
    if (catalogue.phase === "refused")
        return <AppsDashboardRefusedSection label={catalogue.label} note={catalogue.note} />
    const isResting = catalogue.phase === "resting"
    return (
        <SurfaceCard
            label={catalogue.label}
            labelEnd={
                catalogue.fact === undefined ? null : (
                    <Text size="sm" tone="muted" isSkeleton={isResting}>
                        {catalogue.fact}
                    </Text>
                )
            }
        >
            <div className={APPS_DASHBOARD_CATALOGUE_CONTENT_CLASS_NAME}>
                {catalogue.phase === "answered" ? (
                    catalogue.offers.map((offer) => offerRow(offer, onBuildTemplate))
                ) : (
                    <AppsDashboardRestingRows indexes={[4]} />
                )}
            </div>
        </SurfaceCard>
    )
}
