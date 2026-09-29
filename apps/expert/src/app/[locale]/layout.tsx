import type { Viewport } from "next"
import type { ComponentProps } from "react"
import "../globals.css"
import { AcademyLocaleLayout } from "@/features/layouts/AcademyLocaleLayout"

export { generateMetadata, generateStaticParams } from "@/features/layouts/AcademyLocaleLayout"

/*
 * The `/[locale]` shell, the stylesheet the document needs, and the framework's own viewport slot.
 *
 * The viewport declaration is Next's own exported constant, so it stays in the route file: the
 * framework reads that slot out of the route tree, and the shell, its metadata and its static
 * params live in `features/layouts/AcademyLocaleLayout`, which is what this file names and mounts.
 */

/** Props the locale segment hands its shell: the routed stream and the promised locale. */
type AcademyLocaleRouteProps = {
    readonly children: ComponentProps<"div">["children"]
    readonly params: Promise<{
        readonly locale: string
    }>
}

/** Mount the academy locale shell on this route segment. */
const Layout = ({ children, params }: AcademyLocaleRouteProps) => (
    <AcademyLocaleLayout params={params}>{children}</AcademyLocaleLayout>
)

export default Layout

/** Viewport behaviour for every route under this shell. */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
}
