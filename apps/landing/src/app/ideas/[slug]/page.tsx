import { CanonicalIdeaUnavailable } from "@/features/pages/LandingPage"

/**
 * The `/ideas/[slug]` route. It mounts the recovery surface and nothing else.
 *
 * THE SLUG IS DELIBERATELY NOT READ. This draft publishes no governed idea objects, so every slug
 * is unknown and the page owner's single unavailable state is the whole answer - picking over the
 * parameter here would only be a second place that could disagree with that state.
 *
 * @returns The route.
 */
const IdeaDetailRoute = () => <CanonicalIdeaUnavailable />

export default IdeaDetailRoute