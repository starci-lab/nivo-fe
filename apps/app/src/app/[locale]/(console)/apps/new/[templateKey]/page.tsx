import { redirect } from "next/navigation"

type LegacyTemplateRouteProps = {
    readonly params: Promise<{ readonly locale: string, readonly templateKey: string }>
}

/** Preserve old bookmarks while keeping `/apps/create/:templateKey` canonical. */
const Page = async ({ params }: LegacyTemplateRouteProps) => {
    const { locale, templateKey } = await params
    const localeSegment = locale === "vi" ? "" : `/${locale}`
    redirect(`${localeSegment}/apps/create/${encodeURIComponent(templateKey)}`)
}

export default Page