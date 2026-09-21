import { Heading, TextAction } from "@starci/grammar/common";
import { CLASS_NAMES as C } from "@/components/pages/LandingPage/classNames";
type IdeaRouteProps = { readonly params: Promise<{ readonly slug: string }> };
/** Dynamic idea recovery state for unknown or not-yet-reviewed entries. */
const IdeaDetailRoute = async (props: IdeaRouteProps) => { void props; return <main className={C.canonicalPage} aria-labelledby="idea-unavailable-title"><div className={C.canonicalShell}><TextAction href="/ideas" appearance="route">← Ideas</TextAction><p className={C.eyebrow}>Knowledge discovery · Unavailable</p><Heading level={1}>This idea is not ready for publication.</Heading><p id="idea-unavailable-title" className={C.canonicalLede}>The slug is unknown, draft, or awaiting review. Unverified metadata and claims are not shown.</p><div className={C.canonicalActions}><TextAction href="/ideas" appearance="route">Return to Ideas</TextAction><TextAction href="/contact?intent=press-and-research" appearance="route">Ask about content</TextAction></div></div></main>; };
export default IdeaDetailRoute;
