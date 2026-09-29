import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { pageMetadata } from "@/features/layouts/SiteShell"
import ExploreIdeaPage from "@/features/pages/ExploreIdeaPage"
import { IDEA_SLUGS, getIdeaBySlug } from "@/modules/landing/ideas"

type IdeaDetailRouteProps = {
    readonly params: Promise<{ readonly locale: string; readonly slug: string }>
}

/** Static identities for the approved public Idea inventory. */
export const generateStaticParams = () => IDEA_SLUGS

/** Article metadata follows the same governed Idea object, in the same language, as the rendered page. */
export const generateMetadata = async ({ params }: IdeaDetailRouteProps): Promise<Metadata> => {
    const { locale, slug } = await params
    const idea = getIdeaBySlug(slug)
    if (idea === undefined) {
        const detail = await getTranslations({ locale, namespace: "explore.ideaDetail" })
        return { title: detail("notAvailable"), robots: { index: false, follow: true } }
    }
    const t = await getTranslations({ locale, namespace: "explore.ideas" })
    const base = await pageMetadata({ params, page: "explore.ideas", path: `/ideas/${idea.slug}` })
    return {
        ...base,
        title: t(`items.${idea.slug}.title`),
        description: t(`items.${idea.slug}.thesis`),
        openGraph: {
            ...base.openGraph,
            type: "article",
            title: t(`items.${idea.slug}.title`),
            description: t(`items.${idea.slug}.thesis`),
        },
    }
}

/** The `/ideas/[slug]` adapter refuses unknown or non-public knowledge objects. */
const Page = async ({ params }: IdeaDetailRouteProps) => {
    const { slug } = await params
    const idea = getIdeaBySlug(slug)
    if (idea === undefined) notFound()
    return <ExploreIdeaPage idea={idea} />
}

export default Page
