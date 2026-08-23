import {
    Button,
    ChoiceTabs,
    Heading,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import { AcademyGrowthSummary } from "@/components/blocks/academy/AcademyGrowthSummary"
import { AcademyStudentCrm } from "@/components/blocks/academy/AcademyStudentCrm"
import { AcademyLeadPipeline } from "@/components/blocks/academy/AcademyLeadPipeline"
import { AcademyIntegrationCenter } from "@/components/blocks/academy/AcademyIntegrationCenter"

/** The two jobs performed inside one Academy resource. */
export type AcademyControlCenterMode = "growth" | "system"

/** Resolved copy passed into the pure Academy page. */
export type AcademyControlCenterLabels = {
    readonly loading: string
    readonly refused: string
    readonly openSite: string
    readonly tabsLabel: string
    readonly tabs: ReadonlyArray<{ readonly id: AcademyControlCenterMode, readonly label: string }>
}

/** Pure page state; domain blocks own their own requests and failures. */
export type AcademyControlCenterViewProps = {
    readonly state: "restoring" | "refused" | "ready"
    readonly title: string
    readonly siteId: string
    readonly publicHost?: string
    readonly mode: AcademyControlCenterMode
    readonly labels: AcademyControlCenterLabels
    readonly onSelectMode: (mode: AcademyControlCenterMode) => void
    readonly onOpenPublicSite: () => void
}

/** Compose one Academy destination without taking ownership of block requests. */
export const AcademyControlCenterBase = ({ state, title, siteId, publicHost, mode, labels, onSelectMode, onOpenPublicSite }: AcademyControlCenterViewProps) => {
    const settledSections = mode === "growth"
        ? [
            defineContractProjection("label-row-over-card", () => <AcademyGrowthSummary siteId={siteId} />),
            defineContractProjection("label-row-over-card", () => <AcademyStudentCrm siteId={siteId} />),
            defineContractProjection("label-row-over-card", () => <AcademyLeadPipeline siteId={siteId} />),
        ]
        : [defineContractProjection("label-row-over-card", () => <AcademyIntegrationCenter siteId={siteId} />)]
    const sections = state !== "ready"
        ? [defineContractProjection("label-row-over-card", () => <EmptyNotice props={{ message: state === "restoring" ? labels.loading : labels.refused }} />)]
        : settledSections
    return (
        <Tree
            contract="tabbed-control-center-page"
            render={defineContractComponent("tabbed-control-center-page", {
                heading: defineContractComponent("title-with-end-action", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 1 }} />),
                    ...(publicHost === undefined ? {} : {
                        end: defineLeafComponent("button", {}, () => <Button props={{ label: labels.openSite, variant: "secondary", size: "sm" }} on={{ press: onOpenPublicSite }} />),
                    }),
                }),
                tabs: defineLeafComponent("choice-tabs", {}, () => (
                    <ChoiceTabs props={{ label: labels.tabsLabel, selectedKey: mode, tabs: labels.tabs, variant: "primary" }} on={{ select: (key) => onSelectMode(key as AcademyControlCenterMode) }} />
                )),
                section: sections,
            })}
        />
    )
}

/** Source-level tier marker for the pure Academy page twin. */
export const meta = { shape: "block", world: "pure" } as const
