import { cn } from "@heroui/react"
import { IconSource, NivoBrand, ThemeToggle, type ThemeToggleProps } from "@nivo/ui"
import { Button, IconButton, NavigationFeatureNav, TextAction } from "@starci/grammar/common"
import { SITE_CLASS_NAMES } from "@/features/layouts/SiteShell"
import { SITE_HEADER_MENU_TRIGGER_CLASS_NAME } from "./classNames"

/** One resolved destination: its words and the address for the language being rendered. */
type SiteHeaderLink = {
    readonly id: string
    readonly label: string
    readonly href: string
}

/** A first-level navigation entry: a destination, or a group with one discovery layer. */
export type SiteHeaderEntry =
    | SiteHeaderLink
    | {
          readonly id: string
          readonly label: string
          readonly children: ReadonlyArray<SiteHeaderLink>
      }

/** The sentences the header draws, resolved from the catalog by the connected half. */
type SiteHeaderCopy = {
    readonly homeLabel: string
    readonly primaryNavigationLabel: string
    readonly mobileNavigationLabel: string
    readonly quickActionsLabel: string
    readonly openNavigationLabel: string
    readonly closeNavigationLabel: string
    readonly login: string
    readonly contact: string
    readonly theme: ThemeToggleProps
}

/** The addresses the header links to, localised by the connected half. */
type SiteHeaderHrefs = {
    readonly home: string
    readonly login: string
    readonly contact: string
}

const isNavigationGroup = (
    entry: SiteHeaderEntry,
): entry is Extract<SiteHeaderEntry, { readonly children: ReadonlyArray<unknown> }> => "children" in entry

type NavigationListProps = {
    readonly navigation: ReadonlyArray<SiteHeaderEntry>
    readonly variant: "desktop" | "mobile"
    readonly onFollow?: () => void
}

const NavigationList = ({ navigation, variant, onFollow }: NavigationListProps) => (
    <div className={variant === "desktop" ? SITE_CLASS_NAMES.navigationList : SITE_CLASS_NAMES.navigationMobileList}>
        {navigation.map((item) => (
            <div key={item.id}>
                {isNavigationGroup(item) ? (
                    <details className={SITE_CLASS_NAMES.navigationGroup}>
                        <summary
                            className={cn(
                                SITE_CLASS_NAMES.navigationSummary,
                                variant === "mobile" && SITE_CLASS_NAMES.navigationSummaryMobile,
                            )}
                        >
                            {item.label}
                        </summary>
                        <div
                            className={
                                variant === "desktop"
                                    ? SITE_CLASS_NAMES.navigationPanel
                                    : SITE_CLASS_NAMES.navigationPanelMobile
                            }
                        >
                            {item.children.map((child) => (
                                <div key={child.href}>
                                    <TextAction href={child.href} appearance="section" size="sm" onFollow={onFollow}>
                                        {child.label}
                                    </TextAction>
                                </div>
                            ))}
                        </div>
                    </details>
                ) : (
                    <TextAction href={item.href} appearance="section" size="sm" onFollow={onFollow}>
                        {item.label}
                    </TextAction>
                )}
            </div>
        ))}
    </div>
)

/** The disclosure's settled situation: whether the compact navigation is open. */
type SiteHeaderBaseData = {
    readonly open: boolean
    readonly copy: SiteHeaderCopy
    readonly hrefs: SiteHeaderHrefs
    readonly navigation: ReadonlyArray<SiteHeaderEntry>
}

/** The disclosure's commands back into the connected half. */
type SiteHeaderBaseActions = {
    readonly toggle: () => void
    readonly follow: () => void
}

/** Props for {@link SiteHeaderBase}: the disclosure's situation and its commands. */
type SiteHeaderBaseProps = {
    readonly props: SiteHeaderBaseData
    readonly on: SiteHeaderBaseActions
}

/** Accessible global navigation with one compact disclosure layer on small screens. */
export const SiteHeaderBase = (props: SiteHeaderBaseProps) => {
    const { props: data, on } = props
    const panelId = "site-mobile-navigation"

    return (
        <NavigationFeatureNav
            className={SITE_CLASS_NAMES.header}
            identity={
                <a className={SITE_CLASS_NAMES.headerBrand} href={data.hrefs.home} aria-label={data.copy.homeLabel}>
                    <NivoBrand props={{ label: data.copy.homeLabel, variant: "lockup", scale: "navbar" }} />
                </a>
            }
            navigation={
                <div className={SITE_CLASS_NAMES.headerDesktopNavigation}>
                    <NavigationList navigation={data.navigation} variant="desktop" />
                </div>
            }
            navigationLabel={data.copy.primaryNavigationLabel}
            actions={
                <div className={SITE_CLASS_NAMES.headerActions}>
                    <ThemeToggle label={data.copy.theme.label} options={data.copy.theme.options} />
                    <TextAction href={data.hrefs.login} appearance="section" size="sm">
                        {data.copy.login}
                    </TextAction>
                    <Button href={data.hrefs.contact} variant="primary" size="sm">
                        {data.copy.contact}
                    </Button>
                </div>
            }
            actionsLabel={data.copy.quickActionsLabel}
            compactNavigationTrigger={
                <div className={SITE_HEADER_MENU_TRIGGER_CLASS_NAME}>
                    <IconButton
                        source={IconSource("sidebar", "leading")}
                        label={data.open ? data.copy.closeNavigationLabel : data.copy.openNavigationLabel}
                        isActive={data.open}
                        aria-controls={panelId}
                        aria-expanded={data.open}
                        onPress={on.toggle}
                    />
                </div>
            }
            compactNavigationTriggerLabel={data.open ? data.copy.closeNavigationLabel : data.copy.openNavigationLabel}
            featureNavigation={
                data.open ? (
                    <div id={panelId} className={SITE_CLASS_NAMES.headerMobileNavigation}>
                        <NavigationList navigation={data.navigation} variant="mobile" onFollow={on.follow} />
                        <div className={SITE_CLASS_NAMES.headerMobileActions}>
                            <ThemeToggle label={data.copy.theme.label} options={data.copy.theme.options} />
                            <TextAction href={data.hrefs.login} appearance="section" size="sm" onFollow={on.follow}>
                                {data.copy.login}
                            </TextAction>
                            <Button href={data.hrefs.contact} variant="primary" width="fill" onFollow={on.follow}>
                                {data.copy.contact}
                            </Button>
                        </div>
                    </div>
                ) : undefined
            }
            featureNavigationLabel={data.copy.mobileNavigationLabel}
        />
    )
}
