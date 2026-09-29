import { ChoiceTabs, QueryNoticeView, type QueryNoticeViewData } from "@nivo/ui"
import { Button, EmptyNotice, Heading } from "@starci/grammar/common"
import { AcademyGrowthSummary } from "@/components/blocks/academy/AcademyGrowthSummary"
import { AcademyStudentCrm } from "@/components/blocks/academy/AcademyStudentCrm"
import { AcademyLeadPipeline } from "@/components/blocks/academy/AcademyLeadPipeline"
import { AcademyIntegrationCenter } from "@/components/blocks/academy/AcademyIntegrationCenter"

/** The two jobs performed inside one Academy resource. */
export type AcademyControlCenterProps = AcademyControlCenterViewProps
/** Public API role for AcademyControlCenterMode. */
export type AcademyControlCenterMode = "growth" | "system"

/** Resolved copy passed into the pure Academy page. */
export type AcademyControlCenterLabels = {
    readonly loading: string
    readonly openSite: string
    readonly tabsLabel: string
    readonly tabs: ReadonlyArray<{
        readonly id: AcademyControlCenterMode
        readonly label: string
    }>
}

/** Atoms the pure Academy page draws; domain blocks own their own requests and failures. */
export type AcademyControlCenterData = {
    readonly title: string
    readonly siteId: string
    readonly publicHost?: string
    readonly mode: AcademyControlCenterMode
    /** The failure the connected half composed for a settled failed read; drawn in place of the sections. */
    readonly notice?: QueryNoticeViewData
    readonly labels: AcademyControlCenterLabels
}

/** Actions the pure Academy page emits; every argument is an atom. */
export type AcademyControlCenterActions = {
    readonly selectMode: (mode: AcademyControlCenterMode) => void
    readonly openPublicSite: () => void
    /** Re-read the site list after a failed answer. */
    readonly retryNotice: () => void
}

/** Pure page state; domain blocks own their own requests and failures. */
export type AcademyControlCenterViewProps = {
    readonly state: "restoring" | "failed" | "ready"
    readonly props: AcademyControlCenterData
    readonly on: AcademyControlCenterActions
}

/** Compose one Academy destination without taking ownership of block requests. */
export const AcademyControlCenterBase = (props: AcademyControlCenterProps) => {
    const { state } = props
    const { title, siteId, publicHost, mode, notice, labels } = props.props
    const { retryNotice } = props.on
    const { selectMode, openPublicSite } = props.on
    const settledSections =
        mode === "growth"
            ? [
                  <AcademyGrowthSummary key="item-0" siteId={siteId} />,
                  <AcademyStudentCrm key="item-1" siteId={siteId} />,
                  <AcademyLeadPipeline key="item-2" siteId={siteId} />,
              ]
            : [<AcademyIntegrationCenter key="item-0" siteId={siteId} />]
    const sections =
        state === "failed"
            ? [
                  <div key="item-0">
                      {notice === undefined ? null : <QueryNoticeView props={notice} on={{ retry: retryNotice }} />}
                  </div>,
              ]
            : state === "restoring"
              ? [<EmptyNotice key="item-0" message={labels.loading} />]
              : settledSections
    const publicSite =
        publicHost === undefined ? undefined : (
            <Button variant="secondary" size="sm" onPress={openPublicSite}>
                {labels.openSite}
            </Button>
        )
    return (
        <div>
            <div>
                <Heading level={1}>{title}</Heading>
                {publicSite}
            </div>

            <ChoiceTabs
                props={{
                    label: labels.tabsLabel,
                    selectedKey: mode,
                    tabs: labels.tabs,
                    variant: "primary",
                }}
                on={{
                    select: (key) => selectMode(key as AcademyControlCenterMode),
                }}
            />
            {sections}
        </div>
    )
}
