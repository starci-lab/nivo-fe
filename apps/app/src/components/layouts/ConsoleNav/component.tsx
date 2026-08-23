import { CollapsibleRail, DrawerBranch, Icon, ScrollViewport, SelectionList } from "@nivo/ui"
import type { IconName, SelectionListGroup } from "@nivo/ui"

/** Stable destination keys owned by the console navigation. */
export type ConsoleDestinationKey = "overview" | "apps" | "agentos" | "servers" | "domains" | "wallet" | "support"
/** Supported console navigation presentations. */
export type ConsoleNavMode = "desktop" | "mobile"
/** Complete translated vocabulary required by the pure console navigation. */
export type ConsoleNavLabels = {
    readonly navigation: string
    readonly openMenu: string
    readonly closeMenu: string
    readonly title: string
    readonly services: string
    readonly account: string
    readonly unavailable: string
    readonly destinations: Readonly<Record<ConsoleDestinationKey, string>>
}
/** Pure console navigation input and its destination command. */
export type ConsoleNavBaseProps = {
    readonly mode?: ConsoleNavMode
    readonly selectedKey: ConsoleDestinationKey
    readonly labels: ConsoleNavLabels
    readonly onActivate: (key: ConsoleDestinationKey) => void
}

const SERVICE_KEYS: ReadonlyArray<ConsoleDestinationKey> = ["apps", "agentos", "servers", "domains"]
const ACCOUNT_KEYS: ReadonlyArray<ConsoleDestinationKey> = ["wallet", "support"]
const DISABLED = new Set<ConsoleDestinationKey>(["servers", "domains", "support"])
const ICONS: Readonly<Record<ConsoleDestinationKey, IconName>> = {
    overview: "overview", apps: "apps", agentos: "agentos", servers: "servers",
    domains: "domains", wallet: "wallet", support: "support",
}

/** Draw the selected grouped destinations as a rail or right-edge drawer. */
export const ConsoleNavBase = ({ mode = "desktop", selectedKey, labels, onActivate }: ConsoleNavBaseProps) => {
    const item = (key: ConsoleDestinationKey) => ({
        id: key,
        label: labels.destinations[key],
        icon: ICONS[key],
        ...(DISABLED.has(key) ? { status: labels.unavailable, isDisabled: true } : {}),
    })
    const groups: ReadonlyArray<SelectionListGroup> = [
        { id: "home", items: [item("overview")] },
        { id: "services", label: labels.services, items: SERVICE_KEYS.map(item) },
        { id: "account", label: labels.account, items: ACCOUNT_KEYS.map(item) },
    ]
    const destinations = (presentation: "expanded" | "compact" = "expanded") => <SelectionList
        key={presentation}
        props={{ label: labels.navigation, selectedKey, groups, presentation }}
        on={{ activate: (key) => onActivate(key as ConsoleDestinationKey) }}
    />
    if (mode === "mobile") return <DrawerBranch triggerLabel={labels.openMenu} title={labels.title} closeLabel={labels.closeMenu} content={destinations()} />
    return <CollapsibleRail
        ariaLabel={labels.navigation}
        rail={<ScrollViewport ariaLabel={labels.navigation} content={destinations("expanded")} />}
        collapsedRail={<ScrollViewport ariaLabel={labels.navigation} content={destinations("compact")} />}
        toggleControl={<Icon props={{ name: "sidebar", role: "leading" }} />}
        collapseLabel={labels.closeMenu}
        expandLabel={labels.openMenu}
        storageKey="nivo-console-navigation-collapsed"
    />
}

/** Registry identity for the pure console navigation twin. */
export const meta = { shape: "layout", world: "pure" } as const
