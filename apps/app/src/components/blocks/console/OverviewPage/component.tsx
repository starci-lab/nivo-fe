import { Breadcrumbs } from "@nivo/ui"
import { Button, PageContainer, PrimaryRailLayout, SectionHeader } from "@starci/grammar/common"
import { OverviewAccount } from "@/components/blocks/console/OverviewAccount"
import { OverviewAddresses } from "@/components/blocks/console/OverviewAddresses"
import { OverviewRuntime } from "@/components/blocks/console/OverviewRuntime"
import { OverviewServices } from "@/components/blocks/console/OverviewServices"
import { OverviewSignals } from "@/components/blocks/console/OverviewSignals"
import { OVERVIEW_FRAME_CLASS_NAME, OVERVIEW_TRACK_CLASS_NAME } from "./classNames"

/** Resolved copy of the operations overview, handed in as data. */
type OverviewPageBaseData = {
    readonly title: string
    readonly lede: string
    readonly pathLabel: string
    readonly consoleLabel: string
    readonly buildAppLabel: string
    readonly atAGlanceLabel: string
    readonly servicesLabel: string
    readonly accountLabel: string
}

/** The commands the overview offers: the one page-level decision. */
type OverviewPageBaseActions = {
    readonly buildApp: () => void
}

/*
 * The `starci-fe/public-component-signature` convention reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name that rule
 * accepts; the exported contract below stays `<Unit>BaseProps`, which the shape-slot law requires
 * the render half to own. Not exported: one public contract per unit.
 */
type OverviewPageProps = OverviewPageBaseProps
/** Public API role for OverviewPageBaseProps. */
export type OverviewPageBaseProps = {
    readonly props: OverviewPageBaseData
    readonly on: OverviewPageBaseActions
}

/**
 * Draw the overview anatomy: one level-1 orientation region names the page and holds its one
 * page-level decision; every other region is anchored by its own labelled surface instead of a
 * second heading. Each connected block settles its own slice independently.
 */
export const OverviewPageBase = (props: OverviewPageProps) => {
    const {
        props: { title, lede, pathLabel, consoleLabel, buildAppLabel, atAGlanceLabel, servicesLabel, accountLabel },
        on: { buildApp },
    }: OverviewPageBaseProps = props
    return (
        <PageContainer measure="product">
            <div className={OVERVIEW_FRAME_CLASS_NAME} data-contract="GAP-5" data-overview-frame="true">
                <Breadcrumbs
                    props={{
                        mode: "trail",
                        label: pathLabel,
                        steps: [
                            {
                                id: "console",
                                label: consoleLabel,
                            },
                            {
                                id: "overview",
                                label: title,
                                isCurrent: true,
                            },
                        ],
                    }}
                />
                <SectionHeader
                    level={1}
                    title={title}
                    description={lede}
                    action={
                        <Button size="lg" variant="primary" onPress={buildApp}>
                            {buildAppLabel}
                        </Button>
                    }
                />
                <OverviewSignals label={atAGlanceLabel} />
                <PrimaryRailLayout
                    align="start"
                    railWidth="standard"
                    collapsedOrder="primary-first"
                    primary={
                        <div
                            className={OVERVIEW_TRACK_CLASS_NAME}
                            data-contract="GAP-4 MEASURE-2"
                            data-overview-primary="true"
                        >
                            <OverviewServices label={servicesLabel} />
                            <OverviewRuntime />
                        </div>
                    }
                    rail={
                        <div
                            className={OVERVIEW_TRACK_CLASS_NAME}
                            data-contract="GAP-4 MEASURE-2"
                            data-overview-rail="true"
                        >
                            <OverviewAccount label={accountLabel} />
                            <OverviewAddresses />
                        </div>
                    }
                />
            </div>
        </PageContainer>
    )
}

/** Registry identity for the pure overview page twin. */
