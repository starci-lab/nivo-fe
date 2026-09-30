import { useTranslations } from "next-intl"
import { NotFoundPageBase } from "./component"

/** Props for {@link NotFoundPage}: the app's locale-aware home address. */
export type NotFoundPageProps = { readonly homeHref: string }

/** Render an unknown address with translated copy and a route-aware way home. */
export const NotFoundPage = ({ homeHref }: NotFoundPageProps) => {
    const t = useTranslations("boundary.notFound")
    return (
        <NotFoundPageBase
            props={{
                message: t("message"),
                description: t("description"),
                actionLabel: t("home"),
                actionHref: homeHref,
            }}
        />
    )
}
