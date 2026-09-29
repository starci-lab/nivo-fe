import { NivoBrand } from "@nivo/ui"
import { Button, PageContainer, TextAction } from "@starci/grammar/common"
import { SITE_CLASS_NAMES } from "../SiteShell"

/** One resolved destination: its words and the address for the language being rendered. */
export type SiteHeaderLink = {
    readonly id: string
    readonly label: string
    readonly href: string
}

/** A first-level navigation entry: a destination, or a group with one discovery layer. */
export type SiteHeaderEntry = SiteHeaderLink | {
    readonly id: string
    readonly label: string
    readonly children: ReadonlyArray<SiteHeaderLink>
}

/** The sentences the header draws, resolved from the catalog by the connected half. */
export type SiteHeaderCopy = {
    readonly homeLabel: string
    readonly primaryNavigationLabel: string
    readonly mobileNavigationLabel: string
    readonly quickActionsLabel: string
    readonly openNavigationLabel: string
    readonly closeNavigationLabel: string
    readonly login: string
    readonly contact: string
}

/** The addresses the header links to, localised by the connected half. */
export type SiteHeaderHrefs = {
    readonly home: string
    readonly login: string
    readonly contact: string
}

const isNavigationGroup = (entry: SiteHeaderEntry): entry is Extract<SiteHeaderEntry, { readonly children: ReadonlyArray<unknown> }> => "children" in entry

type NavigationListProps = {
    readonly navigation: ReadonlyArray<SiteHeaderEntry>
    readonly variant: "desktop" | "mobile"
    readonly onFollow?: () => void
}

const NavigationList = ({ navigation, variant, onFollow }: NavigationListProps) => (
    <ul className={variant === "desktop" ? SITE_CLASS_NAMES.navigationList : SITE_CLASS_NAMES.navigationMobileList}>
        {navigation.map((item) => (
            <li key={item.id}>
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
    readonly copy: SiteHeaderCopy
    readonly hrefs: SiteHeaderHrefs
    readonly navigation: ReadonlyArray<SiteHeaderEntry>
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
                <a className={SITE_CLASS_NAMES.headerBrand} href={data.hrefs.home} aria-label={data.copy.homeLabel}>
                    <NivoBrand props={{ label: "NIVO", variant: "lockup", scale: "navbar" }} />
                </a>

                <nav className={SITE_CLASS_NAMES.headerDesktopNavigation} aria-label={data.copy.primaryNavigationLabel}>
                    <NavigationList navigation={data.navigation} variant="desktop" />
                </nav>

                <div className={SITE_CLASS_NAMES.headerActions} aria-label={data.copy.quickActionsLabel}>
                    <TextAction href={data.hrefs.login} appearance="section" size="sm">{data.copy.login}</TextAction>
                    {/* Product activation has no published destination yet, so Contact is the one call to action. */}
                    <Button href={data.hrefs.contact} variant="primary" size="sm">{data.copy.contact}</Button>
                </div>

                <button
                    ref={on.menuTrigger}
                    className={SITE_CLASS_NAMES.headerMenuTrigger}
                    type="button"
                    aria-controls={panelId}
                    aria-expanded={data.open}
                    aria-label={data.open ? data.copy.closeNavigationLabel : data.copy.openNavigationLabel}
                    onClick={on.toggle}
                >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                </button>
            </PageContainer>

            {data.open ? (
                <nav id={panelId} className={SITE_CLASS_NAMES.headerMobileNavigation} aria-label={data.copy.mobileNavigationLabel}>
                    <NavigationList navigation={data.navigation} variant="mobile" onFollow={on.follow} />
                    <div className={SITE_CLASS_NAMES.headerMobileActions}>
                        <TextAction href={data.hrefs.login} appearance="section" size="sm" onFollow={on.follow}>
                            {data.copy.login}
                        </TextAction>
                        <Button href={data.hrefs.contact} variant="primary" width="fill" onFollow={on.follow}>
                            {data.copy.contact}
                        </Button>
                    </div>
                </nav>
            ) : null}
        </header>
    )
}
