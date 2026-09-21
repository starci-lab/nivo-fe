import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { IDEA_SLUGS, IdeaDetailPage, getIdeaBySlug } from "@/components/pages/explore"

type IdeaDetailRouteProps = {
    readonly params: Promise<{ readonly slug: string }>
}

/** Static identities for the approved public Idea inventory. */
export const generateStaticParams = () => IDEA_SLUGS

/** Article metadata follows the same governed Idea object as the rendered page. */
export const generateMetadata = async ({ params }: IdeaDetailRouteProps): Promise<Metadata> => {
    const { slug } = await params
    const idea = getIdeaBySlug(slug)
    if (idea === undefined) return { title: "Idea không khả dụng", robots: { index: false, follow: true } } // vn-ok: Canonical Vietnamese public fallback.
    return {
        title: idea.title,
        description: idea.thesis,
        alternates: { canonical: `/ideas/${idea.slug}` },
        openGraph: {
            type: "article",
            title: idea.title,
            description: idea.thesis,
            url: `/ideas/${idea.slug}`,
        },
    }
}

/** The `/ideas/[slug]` adapter refuses unknown or non-public knowledge objects. */
const IdeaDetailRoute = async ({ params }: IdeaDetailRouteProps) => {
    const { slug } = await params
    const idea = getIdeaBySlug(slug)
    if (idea === undefined) notFound()
    return <IdeaDetailPage idea={idea} />
}

export default IdeaDetailRoute
