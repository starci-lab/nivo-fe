import type { Metadata, Viewport } from "next"
import messages from "../../../../../../apps/app/src/messages/vi.json"
import { CandidateProviders } from "./providers"
import "./globals.css"

/**
 * Document title and description Next reads for the candidate's head.
 *
 * The title is read out of the shipped catalogue rather than typed here, for the same reason the
 * page's labels are: a screen whose tab says one word and whose heading says another is a screen
 * with two names, and only one of them is the name translators maintain.
 *
 * The app reaches the same string through `getTranslations` in `generateMetadata`; this build reads
 * the JSON directly because a static export has no request scope for the server helper to run in -
 * the same declared difference `providers.tsx` records.
 */
export const metadata: Metadata = {
    title: `${messages.provisioning.title} — candidate`,
    description: "Preview candidate for case-prov, direction dir-c-fleet.",
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
 * The document shell, matching `apps/app/src/app/layout.tsx`'s body classes so the candidate is
 * measured on the same ground the app draws on.
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
