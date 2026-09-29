import { BOUNDARY_COPY } from "@/modules/landing/boundary"
import { NotFoundPageBase } from "./component"

/** Public API role for NotFoundPageProps. */
export type NotFoundPageProps = { readonly [key: string]: never }

/** PAGE - the answer to an address no route owns, with the way back to the home page. */
export const NotFoundPage = (props: NotFoundPageProps) => {
    void props
    return <NotFoundPageBase props={{ ...BOUNDARY_COPY.notFound, actionHref: "/" }} />
}
