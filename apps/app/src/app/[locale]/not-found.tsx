import { NotFoundPage } from "@nivo/ui"
import { getLocale } from "next-intl/server"
import { getPathname } from "@/modules/i18n"

/** Mount the shared not-found answer with this app's locale-aware home address. */
const NotFound = async () => {
    const locale = await getLocale()
    return <NotFoundPage homeHref={getPathname({ href: "/", locale })} />
}

export default NotFound
