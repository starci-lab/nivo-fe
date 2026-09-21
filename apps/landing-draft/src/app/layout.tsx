import { NivoGrammarRoot } from "@nivo/ui"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { SiteShell } from "@/components/site"
import { PUBLIC_SITE_URL, SITE_DESCRIPTION, SITE_TITLE } from "@/resources/site"
import "./globals.css"

/** Browser-level metadata for every canonical public route. */
export const metadata: Metadata = {
    metadataBase: new URL(PUBLIC_SITE_URL),
    title: {
        default: SITE_TITLE,
        template: "%s | NIVO",
    },
    description: SITE_DESCRIPTION,
    openGraph: {
        type: "website",
        locale: "vi_VN",
        siteName: "NIVO",
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
    },
    robots: {
        index: true,
        follow: true,
    },
}

/** Viewport behaviour for every route under this shell. */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#ffffff",
}

/** Props for the document shell. */
type RootLayoutProps = {
    /** The rendered route. */
    readonly children: ReactNode
}

/** The document shell selects the NIVO family once and mounts shared public chrome. */
const RootLayout = ({ children }: RootLayoutProps) => (
    <html lang="vi">
        <body>
            <NivoGrammarRoot theme="light">
                <SiteShell>{children}</SiteShell>
            </NivoGrammarRoot>
        </body>
    </html>
)

export default RootLayout
