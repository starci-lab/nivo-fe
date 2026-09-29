import type { Viewport } from "next"
import { SiteShellDocument as Layout } from "@/features/layouts/SiteShell"
import "../globals.css"

export { siteMetadata as generateMetadata, generateStaticParams } from "@/features/layouts/SiteShell"

/*
 * The document shell, the stylesheet it needs, and the framework's own viewport slot.
 *
 * The viewport stays in the route file because it is a framework slot the routing tree owns; the
 * shell, its metadata and its static params live in `features/layouts/SiteShell`, which is what this
 * file names and mounts.
 */

/** Viewport behaviour for every route under this shell. */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#ffffff",
}

export default Layout
