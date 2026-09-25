import type { Metadata, Viewport } from "next"
import { PUBLIC_SITE_URL, SITE_DESCRIPTION, SITE_TITLE } from "@/features/layouts/SiteShell"
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

/*
 * The document shell, and the framework's own metadata slots.
 *
 * The metadata and the viewport stay in the route file because they are framework slots the routing
 * tree owns, and they are built from the three constants `features/layouts/SiteShell` re-exports --
 * the entry that also holds the shell which actually renders the document.
 */
export { SiteShellDocument as default } from "@/features/layouts/SiteShell"