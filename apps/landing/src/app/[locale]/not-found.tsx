import { NotFoundPage } from "@nivo/ui"
import { getLocale } from "next-intl/server"
import { toLocale } from "@/modules/i18n/config"
import { localizeHref } from "@/modules/i18n/navigation"

/** Mount the shared not-found answer with this app's locale-aware home address. */
const NotFound = async () => {
    const locale = await getLocale()
    return <NotFoundPage homeHref={localizeHref("/", toLocale(locale))} />
}

export default NotFound
