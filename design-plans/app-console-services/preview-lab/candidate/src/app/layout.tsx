import type { Metadata, Viewport } from "next"
import consoleMessages from "../messages/console.vi.json"
import { CandidateProviders } from "./providers"
import "./globals.css"

/**
 * The document shell, and nothing else.
 *
 * TARGET PATH: `apps/app/src/app/[locale]/layout.tsx`, which already builds html/body/AppProviders
 * and nothing more. In PRODUCTION the console frame belongs there, because LAYOUT-1 makes the
 * framework boundary the one place that receives `children` and closes them into the contract's
 * `page` leaf immediately, and LAYOUT-7 is the reason the rail must be a SIBLING of the routed body
 * rather than a parent of it - a rail nested inside the body repaints on every press and takes its
 * own scroll position with it.
 *
 * IT IS NOT COMPOSED HERE, AND THE REASON IS MECHANICAL RATHER THAN A DESIGN CHANGE. Composing it
 * needs three things this file may not reach: the LOCAL contract table (`sidebar-then-body-app` and
 * `console-body-main` do not exist in `packages/ui` and cannot be passed to `@nivo/ui`'s `Tree`,
 * whose `contract` prop is typed against the shipped closed union), the local `Tree` typed by that
 * table, and `ConsoleNav`. All three are the chrome owner's files, not the harness's. A layout that
 * renders `Tree` while the local table is still absent is ALSO a lint failure rather than a missing
 * feature: `routed-page-is-a-main-landmark` resolves `host` by walking up to the nearest contract
 * table, finds `packages/ui`'s, does not find `console-body-main` in it, and reports the landmark as
 * missing - a red gate about a file that was never wrong.
 *
 * SO IN THIS CANDIDATE THE FRAME IS MOUNTED BY EACH SEALED STATE'S ROUTE. That is legal on its own
 * terms, not a workaround: `main-landmark-belongs-to-a-route-file` admits a route `page.tsx` and a
 * `components/pages/<Name>/` surface exactly as it admits a layout, because the guarantee is one
 * `main` owned by whoever owns the whole screen. Each state is its own static URL here, so "the
 * body is replaced while the rail stands" is a claim these screenshots cannot show either way; the
 * claim is made by the ENTRY's `why` and proved at Apply, where the frame sits in the layout above
 * a client-routed body.
 *
 * The composition, written out so the chrome owner ports it rather than re-derives it:
 *
 *     <Tree
 *         contract="sidebar-then-body-app"
 *         render={defineContractComponent("sidebar-then-body-app", {
 *             sidebar: defineContractProjection("home-services-account-nav", () => <ConsoleNav />),
 *             body: defineContractComponent("console-body-main", {
 *                 page: defineLeafComponent("page", {}, () => children),
 *             }),
 *         })}
 *     />
 *
 * `sidebar` is a PROJECTION rather than a slot record because `ConsoleNav` draws that whole node
 * itself - it resolves which destination is current, and that is its own domain under LAYOUT-3.
 */

/**
 * Document title and description Next reads for the candidate's head.
 *
 * Read from the catalogue rather than typed here. The app reaches the same string through
 * `getTranslations`; a static export has no request scope for the server helper, which is the one
 * declared difference this build carries.
 */
export const metadata: Metadata = {
    title: `${consoleMessages.console.title} — candidate`,
    description: "Preview candidate for case-console-services, direction-b revision 2.",
}

/** Viewport Next writes into the head; the sealed states are measured at this scale. */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
}

/** Props for {@link CandidateLayout}. */
interface CandidateLayoutProps {
    /** The routed page. */
    readonly children: React.ReactNode
}

/**
 * The document and the routed body inside it.
 *
 * @param input - The rendered route.
 * @returns The html document.
 */
const CandidateLayout = ({ children }: CandidateLayoutProps) => (
    <html lang="vi" suppressHydrationWarning>
        <body className="min-h-dvh bg-background text-foreground antialiased">
            <CandidateProviders>{children}</CandidateProviders>
        </body>
    </html>
)

export default CandidateLayout
