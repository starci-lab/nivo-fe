import { NivoBrand } from "@nivo/ui"
import { PageContainer, Text, TextAction } from "@starci/grammar/common"
import { SITE_CLASS_NAMES } from "../SiteShell"

/** One footer group with its words and localised addresses resolved. */
export type SiteFooterGroup = {
    readonly id: string
    readonly title: string
    readonly links: ReadonlyArray<{
        readonly id: string
        readonly label: string
        readonly href: string
        readonly external: boolean
    }>
}

/** What the footer draws, resolved by the connected half. */
export type SiteFooterBaseData = {
    readonly homeHref: string
    readonly contactHref: string
    readonly groups: ReadonlyArray<SiteFooterGroup>
    readonly copy: {
        readonly homeLabel: string
        readonly philosophy: string
        readonly distinction: string
        readonly copyright: string
        readonly contactNivo: string
    }
}

/** Props for {@link SiteFooterBase}: the resolved footer under `props`. */
export type SiteFooterBaseProps = {
    readonly props: SiteFooterBaseData
}

/** The compact footer shared by every canonical public route. */
export const SiteFooterBase = (props: SiteFooterBaseProps) => {
    const { homeHref, contactHref, groups, copy }: SiteFooterBaseData = props.props
    return (
        <footer className={SITE_CLASS_NAMES.footer}>
            <PageContainer className={SITE_CLASS_NAMES.footerInner}>
                <div className={SITE_CLASS_NAMES.footerIdentity}>
                    <a href={homeHref} aria-label={copy.homeLabel}>
                        <NivoBrand props={{ label: "NIVO", variant: "lockup", scale: "navbar" }} />
                    </a>
                    <Text as="p" size="sm">
                        {copy.philosophy}
                    </Text>
                    <Text as="p" size="xs" tone="muted">
                        {copy.distinction}
                    </Text>
                </div>

                <div className={SITE_CLASS_NAMES.footerDirectory}>
                    {groups.map((group, groupIndex) => {
                        const labelId = `footer-group-${groupIndex}`
                        return (
                            <nav aria-labelledby={labelId} key={group.id}>
                                <Text as="p" id={labelId} size="xs" weight="semibold">
                                    {group.title}
                                </Text>
                                <ul>
                                    {group.links.map((link) => (
                                        <li key={link.id}>
                                            <TextAction
                                                href={link.href}
                                                target={link.external ? "_self" : undefined}
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
                    <Text as="span" size="xs">
                        {copy.copyright}
                    </Text>
                    <TextAction href={contactHref} appearance="section" size="sm">
                        {copy.contactNivo}
                    </TextAction>
                </div>
            </PageContainer>
        </footer>
    )
}
