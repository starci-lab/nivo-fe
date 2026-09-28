import { NivoBrand } from "@nivo/ui"
import { Button, PageContainer, TextAction } from "@starci/grammar/common"
import { ACTIVATION_LINK, SITE_COPY, SITE_LINKS, SITE_NAVIGATION, type SiteNavigationItem } from "@/modules/landing/site"
import { SITE_CLASS_NAMES } from "../SiteShell"

const isNavigationGroup = (item: SiteNavigationItem): item is Extract<SiteNavigationItem, { readonly children: ReadonlyArray<unknown> }> => "children" in item

type NavigationListProps = {
    readonly variant: "desktop" | "mobile"
    readonly onFollow?: () => void
}

const NavigationList = ({ variant, onFollow }: NavigationListProps) => (
    <ul className={variant === "desktop" ? SITE_CLASS_NAMES.navigationList : SITE_CLASS_NAMES.navigationMobileList}>
        {SITE_NAVIGATION.map((item) => (
            <li key={item.label}>
                {isNavigationGroup(item) ? (
                    <details className={SITE_CLASS_NAMES.navigationGroup}>
                        <summary>{item.label}</summary>
                        <ul>
                            {item.children.map((child) => (
                                <li key={child.href}>
                                    <TextAction href={child.href} appearance="section" size="sm" onFollow={onFollow}>
                                        {child.label}
                                    </TextAction>
                                </li>
                            ))}
                        </ul>
                    </details>
                ) : (
                    <TextAction href={item.href} appearance="section" size="sm" onFollow={onFollow}>
                        {item.label}
                    </TextAction>
                )}
            </li>
        ))}
    </ul>
)

/** The disclosure's settled situation: whether the compact navigation is open. */
export type SiteHeaderBaseData = {
    readonly open: boolean
}

/** The disclosure's commands back into the connected half. */
export type SiteHeaderBaseActions = {
    readonly toggle: () => void
    readonly follow: () => void
    readonly menuTrigger: (element: HTMLButtonElement | null) => void
}

/** Public API role for SiteHeaderBaseProps. */
export type SiteHeaderBaseProps = {
    readonly props: SiteHeaderBaseData
    readonly on: SiteHeaderBaseActions
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type SiteHeaderProps = SiteHeaderBaseProps

/** Accessible global navigation with one compact disclosure layer on small screens. */
export const SiteHeaderBase = (props: SiteHeaderProps) => {
    const { props: data, on } = props
    const panelId = "site-mobile-navigation"

    return (
        <header className={SITE_CLASS_NAMES.header}>
            <PageContainer className={SITE_CLASS_NAMES.headerBar}>
                <a className={SITE_CLASS_NAMES.headerBrand} href={SITE_LINKS.home} aria-label={SITE_COPY.homeLabel}>
                    <NivoBrand props={{ label: "NIVO", variant: "lockup", scale: "navbar" }} />
                </a>

                <nav className={SITE_CLASS_NAMES.headerDesktopNavigation} aria-label={SITE_COPY.primaryNavigationLabel}>
                    <NavigationList variant="desktop" />
                </nav>

                <div className={SITE_CLASS_NAMES.headerActions} aria-label={SITE_COPY.quickActionsLabel}>
                    <TextAction href={SITE_LINKS.login} appearance="section" size="sm">{SITE_COPY.login}</TextAction>
                    {ACTIVATION_LINK === null ? (
                        <Button href={SITE_LINKS.contact} variant="primary" size="sm">{SITE_COPY.contact}</Button>
                    ) : (
                        <Button href={ACTIVATION_LINK.href} variant="primary" size="sm">{ACTIVATION_LINK.label}</Button>
                    )}
                </div>

                <button
                    ref={on.menuTrigger}
                    className={SITE_CLASS_NAMES.headerMenuTrigger}
                    type="button"
                    aria-controls={panelId}
                    aria-expanded={data.open}
                    aria-label={data.open ? SITE_COPY.closeNavigationLabel : SITE_COPY.openNavigationLabel}
                    onClick={on.toggle}
                >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                </button>
            </PageContainer>

            {data.open ? (
                <nav id={panelId} className={SITE_CLASS_NAMES.headerMobileNavigation} aria-label={SITE_COPY.mobileNavigationLabel}>
                    <NavigationList variant="mobile" onFollow={on.follow} />
                    <div className={SITE_CLASS_NAMES.headerMobileActions}>
                        <TextAction href={SITE_LINKS.login} appearance="section" size="sm" onFollow={on.follow}>
                            {SITE_COPY.login}
                        </TextAction>
                        <Button href={SITE_LINKS.contact} variant="primary" width="fill" onFollow={on.follow}>
                            {SITE_COPY.contact}
                        </Button>
                    </div>
                </nav>
            ) : null}
        </header>
    )
}
