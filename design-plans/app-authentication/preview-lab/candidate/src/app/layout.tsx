import type { Metadata, Viewport } from "next"
import authMessages from "../messages/auth.vi.json"
import { CandidateProviders } from "./providers"
import "./globals.css"

/**
 * The document shell, and nothing else.
 *
 * TARGET PATH: `apps/app/src/app/[locale]/layout.tsx` already exists and already does this; Apply
 * adds no layout for these routes.
 *
 * NO CHROME HERE ON PURPOSE. An authentication route has no sidebar, no nav and no frame - the whole
 * screen is one centred card, and `centred-authentication-page` is the node that says so. This is the
 * opposite of the console case, where the frame was the entire point.
 *
 * THE `main` LANDMARK IS MISSING, AND IT IS MISSING IN PRODUCTION TOO. `centred-authentication-page`
 * carries no `host`, so it renders as a `div` and these routes offer a screen reader nothing to skip
 * to - the same gap the shipped `/sign-in` has today. The one-word fix is written out in
 * `preview-lab/proposed-contracts.ts` rather than applied here, because the registry lives outside
 * this phase's write boundary. It is open question 3.
 */

/** Document title and description Next reads for the candidate's head. */
export const metadata: Metadata = {
    title: `${authMessages.authentication.signIn.title} — candidate`,
    description: "Preview candidate for case-auth, revision 1.2 - one /authentication route.",
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
