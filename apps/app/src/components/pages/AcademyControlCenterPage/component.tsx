import { AcademyControlCenter } from "@/components/blocks/academy/AcademyControlCenter"
import type { AcademyControlCenterMode } from "@/components/blocks/academy/AcademyControlCenter/component"

/** Page-owned route identity and tab composition. */
export type AcademyControlCenterPageViewProps = {
    readonly siteId: string
    readonly mode: AcademyControlCenterMode
    readonly onSelectMode: (mode: AcademyControlCenterMode) => void
}

/** Compose the connected site block while retaining page-level tab state. */
export const AcademyControlCenterPageBase = (view: AcademyControlCenterPageViewProps) => (
    <AcademyControlCenter siteId={view.siteId} mode={view.mode} onSelectMode={view.onSelectMode} />
)

export type { AcademyControlCenterMode }

/** Source-level tier marker for the pure Academy page compositor. */
export const meta = { shape: "page", world: "pure" } as const
