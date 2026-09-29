import { useTranslations } from "next-intl"
import { useLocalizedHref } from "@/hooks"
import { SITE_FOOTER_GROUPS, SITE_LINKS } from "@/modules/landing/site"
import { SiteFooterBase } from "./component"

export type { SiteFooterBaseData, SiteFooterBaseProps, SiteFooterGroup } from "./component"

/** The compact footer shared by every canonical public route: catalog words, localised addresses. */
export const SiteFooter = () => {
    const t = useTranslations("site")
    const href = useLocalizedHref()

    return (
        <SiteFooterBase
            props={{
                homeHref: href(SITE_LINKS.home),
                contactHref: href(SITE_LINKS.contact),
                groups: SITE_FOOTER_GROUPS.map((group) => ({
                    id: group.id,
                    title: t(`footer.groups.${group.id}`),
                    links: group.links.map((link) => ({
                        id: link.id,
                        label: t(`footer.links.${link.id}`),
                        href: href(link.href),
                        external: "external" in link && link.external === true,
                    })),
                })),
                copy: {
                    homeLabel: t("homeLabel"),
                    philosophy: t("philosophy"),
                    distinction: t("distinction"),
                    copyright: t("copyright"),
                    contactNivo: t("contactNivo"),
                },
            }}
        />
    )
}
