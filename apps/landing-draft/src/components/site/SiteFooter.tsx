import { NivoBrand } from "@nivo/ui"
import { PageContainer, Text, TextAction } from "@starci/grammar/common"
import { SITE_COPY, SITE_FOOTER_GROUPS, SITE_LINKS } from "@/resources/site"
import { SITE_CLASS_NAMES } from "./classNames"

/** The footer has no caller-owned visual or behavioral inputs. */
export type SiteFooterProps = Record<never, never>

/** The compact footer shared by every canonical public route. */
export const SiteFooter = (props: SiteFooterProps) => {
    void props

    return (
        <footer className={SITE_CLASS_NAMES.footer}>
            <PageContainer className={SITE_CLASS_NAMES.footerInner}>
                <div className={SITE_CLASS_NAMES.footerIdentity}>
                    <a href={SITE_LINKS.home} aria-label={SITE_COPY.homeLabel}>
                    <NivoBrand props={{ label: "NIVO", variant: "lockup", scale: "navbar" }} />
                    </a>
                    <Text as="p" size="sm">{SITE_COPY.philosophy}</Text>
                    <Text as="p" size="xs">{SITE_COPY.distinction}</Text>
                </div>

                <div className={SITE_CLASS_NAMES.footerDirectory}>
                    {SITE_FOOTER_GROUPS.map((group, groupIndex) => {
                        const labelId = `footer-group-${groupIndex}`
                        return (
                            <nav aria-labelledby={labelId} key={group.title}>
                                <Text as="p" id={labelId} size="xs" weight="semibold">{group.title}</Text>
                                <ul>
                                    {group.links.map((link) => (
                                        <li key={link.href}>
                                            <TextAction
                                                href={link.href}
                                                target={"external" in link && link.external ? "_self" : undefined}
                                                appearance="section"
                                                size="sm"
                                            >
                                                {link.label}
                                            </TextAction>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )
                    })}
                </div>

                <div className={SITE_CLASS_NAMES.footerLegal}>
                    <Text as="span" size="xs">{SITE_COPY.copyright}</Text>
                    <TextAction href={SITE_LINKS.contact} appearance="section" size="sm">{SITE_COPY.contactNivo}</TextAction>
                </div>
            </PageContainer>
        </footer>
    )
}
