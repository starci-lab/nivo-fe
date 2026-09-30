import { NotFoundPage } from "@nivo/ui"
import { getLocale } from "next-intl/server"
import { getPathname } from "@/modules/i18n"

/** Keep console chrome around the shared not-found answer. */
const NotFound = async () => {
    const locale = await getLocale()
    return <NotFoundPage homeHref={getPathname({ href: "/", locale })} />
}

export default NotFound
