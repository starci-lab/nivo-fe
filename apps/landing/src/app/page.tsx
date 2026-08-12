import { Icon } from "@nivo/ui"

/**
 * The seed route.
 *
 * It draws one leaf from the shared package on purpose: it is the smallest thing that proves the
 * workspace link, the Next transpile step and the Tailwind `@source` line all work. When this page
 * renders a sized glyph, the scaffold is sound and screens can be built on it.
 *
 * @returns The page.
 */
const Page = () => (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3">
        <Icon props={{ name: "spark", role: "heading" }} />
        <h1 className="text-2xl font-semibold">nivo</h1>
        <p className="text-sm text-neutral-500">Trang giới thiệu sản phẩm.</p>
    </main>
)

export default Page
