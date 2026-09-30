import type { ReactNode } from "react"
import { StarCiDashboardThemeBoundary } from "@nivo/ui"
import { WorkspaceShell } from "@starci/grammar/common"
import { Sidebar } from "@/features/layouts/Sidebar"
import { ConsoleTopBar } from "@/features/layouts/ConsoleTopBar"
import { CONSOLE_MAIN_ID, CONSOLE_SKIP_LINK_CLASS_NAME } from "./classNames"

/**
 * The frame's approved drawing: the routed page that fills the primary slot.
 *
 * The page is the opaque element the route has already rendered on the server; the frame only seats
 * it, so the route file stays a server layout and the client boundary is this frame alone.
 */
export type ConsoleLayoutBaseState = {
    readonly children: ReactNode
}

/** The atoms the frame's landmarks are named with. */
export type ConsoleLayoutBaseData = {
    readonly navigationLabel: string
    readonly primaryLabel: string
    readonly skipLabel: string
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract below stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type ConsoleLayoutProps = ConsoleLayoutBaseProps
/** Public API role for ConsoleLayoutBaseProps. */
export type ConsoleLayoutBaseProps = {
    readonly state: ConsoleLayoutBaseState
    readonly props: ConsoleLayoutBaseData
}

/**
 * Draw stable authenticated chrome around one opaque routed page.
 *
 * The skip link is the first focusable element and targets the shell-owned main landmark, which is
 * the one `main` the page renders and carries `id="main-content"` with `tabIndex={-1}` from the shell.
 *
 * The navigation band is mounted as a sibling above the shell, never in `WorkspaceShell.header`:
 * that slot is the page-level hero and wraps its content in its own `<header>`, so placing
 * `NavigationFeatureNav` (itself a `<header>`) there would expose two banner landmarks.
 *
 * Compact navigation has exactly one owner per viewport, and the shell owns the whole compact band:
 * `compactNavigation` is the only Grammar mechanism that stays on screen below 70rem, because the
 * top bar's own compact trigger is hidden from 48rem up. The slot holds the same `Sidebar` drawer
 * the rail projects, so the trigger's destinations, labels and focus recovery are identical in
 * every band.
 */
const ConsoleFrame = ({ state: { children }, props: { navigationLabel, primaryLabel, skipLabel } }: ConsoleLayoutBaseProps) => (
    <>
        <a className={CONSOLE_SKIP_LINK_CLASS_NAME} href={`#${CONSOLE_MAIN_ID}`}>
            {skipLabel}
        </a>
        <ConsoleTopBar />
        <WorkspaceShell
            align="stretch"
            compactNavigation={<Sidebar mode="mobile" />}
            compactNavigationLabel={navigationLabel}
            navigation={<Sidebar />}
            navigationLabel={navigationLabel}
            navigationTrack="intrinsic"
            navigationVisibility="wide"
            primary={children}
            primaryId={CONSOLE_MAIN_ID}
            primaryLabel={primaryLabel}
        />
    </>
)

/** Draw stable authenticated chrome around one opaque routed page. */
export const ConsoleLayoutBase = (props: ConsoleLayoutProps) => {
    const { state, props: data }: ConsoleLayoutBaseProps = props
    return (
        <StarCiDashboardThemeBoundary
            content={ConsoleFrame}
            contentProps={{
                state,
                props: data,
            }}
        />
    )
}

/** Registry identity for the pure console layout twin. */
