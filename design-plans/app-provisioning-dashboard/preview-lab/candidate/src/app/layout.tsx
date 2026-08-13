import type { Metadata, Viewport } from "next"
import { Tree, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"
import consoleMessages from "../messages/console.vi.json"
import { ConsoleNav } from "../components/layouts/ConsoleNav"
import { CandidateProviders } from "./providers"
import "./globals.css"

/**
 * The document shell AND the console's frame.
 *
 * TARGET PATH: `apps/app/src/app/layout.tsx`.
 *
 * THIS IS WHERE THE CHROME LIVES, AND CANON IS EXPLICIT ABOUT WHY. LAYOUT-1 says the framework
 * boundary is the one place that receives `children`, and that it closes that node into the
 * contract's `page` leaf IMMEDIATELY. LAYOUT-8 then refuses `children` on any component layout at
 * all. So `ConsoleNav` below takes nothing from the routed body - it is a SIBLING of the body, not a
 * parent of it, which is also what keeps it from repainting when a link is followed (LAYOUT-7).
 *
 * RENAMING THE SLOT WOULD NOT HAVE HELPED. A component layout taking `content: ReactNode` satisfies
 * `starci-fe/no-children-slot`, which reads the slot's NAME, while still breaking LAYOUT-8, which is
 * about the RELATIONSHIP. The lint would have gone green over the same defect.
 *
 * THE LANDMARK IS HERE RATHER THAN IN EACH PAGE. `console-body-main` carries `host: "main"`, so every
 * route under this frame is skippable by a screen reader without remembering to mark itself. The
 * shipped `/provisioning` page has zero `main` elements today - measured during its Apply parity pass
 * - and this is the node that fixes it for every route at once.
 */

/**
 * Document title and description Next reads for the candidate's head.
 *
 * Read from the shipped catalogue rather than typed here. The app reaches the same string through
 * `getTranslations`; a static export has no request scope for the server helper, which is the one
 * declared difference this build carries.
 */
export const metadata: Metadata = {
    title: `${consoleMessages.console.title} — candidate`,
    description: "Preview candidate for case-console, direction dir-a-sidebar.",
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
 * The document, the console frame, and the routed body inside it.
 *
 * @param input - The rendered route.
 * @returns The html document.
 */
const CandidateLayout = ({ children }: CandidateLayoutProps) => (
    <html lang="vi" suppressHydrationWarning>
        <body className="min-h-dvh bg-background text-foreground antialiased">
            <CandidateProviders>
                <Tree
                    contract="sidebar-then-body-app"
                    render={defineContractComponent("sidebar-then-body-app", {
                        /*
                         * A PROJECTION, not a contract component. `ConsoleNav` is a layout: it draws
                         * the whole `sidebar-nav-cluster` node itself because it resolves which
                         * section is current, and that is its own domain (LAYOUT-3). What it must not
                         * do is learn anything about the body beside it.
                         */
                        sidebar: defineContractProjection("sidebar-nav-cluster", () => <ConsoleNav />),
                        body: defineContractComponent("console-body-main", {
                            page: defineLeafComponent("page", {}, () => children),
                        }),
                    })}
                />
            </CandidateProviders>
        </body>
    </html>
)

export default CandidateLayout
