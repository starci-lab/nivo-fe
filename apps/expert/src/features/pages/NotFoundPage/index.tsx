import { useLocale, useTranslations } from "next-intl"
import { getPathname } from "@/modules/i18n/navigation"
import { NotFoundPageBase } from "./component"

/** Public API role for NotFoundPageProps. */
export type NotFoundPageProps = { readonly [key: string]: never }

/** PAGE - the answer to an address no route owns, with the locale-aware way back to the home page. */
export const NotFoundPage = (props: NotFoundPageProps) => {
    void props
    const t = useTranslations("boundary.notFound")
    const locale = useLocale()
    return (
        <NotFoundPageBase
            props={{
                message: t("message"),
                description: t("description"),
                actionLabel: t("home"),
                actionHref: getPathname({ href: "/", locale }),
            }}
        />
    )
}
