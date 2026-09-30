import { useTranslations } from "next-intl"
import type { SidebarGroup } from "@starci/grammar/common"
import { IconSource } from "@nivo/ui"
import { usePathname, useRouter } from "@/hooks/i18n"
import { usePersistedFlag } from "@/hooks/session"
import { NAVIGATION_COLLAPSED_KEY } from "@/modules/browser-storage"
import { SidebarBase } from "./component"

/** Which console surface the navigation is drawn on: the persistent rail, or the mobile drawer. */
export type SidebarMode = "desktop" | "mobile"


/** What a caller states about the navigation - the surface it belongs to, and nothing else. */
export type SidebarProps = { readonly mode?: SidebarMode }
type DestinationKey = "overview" | "chat" | "agentos" | "apps" | "wallet"
type Destination = {
    readonly key: DestinationKey
    readonly route: string
    readonly group: "workspace" | "account"
    readonly icon: "overview" | "community" | "agentos" | "apps" | "wallet"
}

const DESTINATIONS: ReadonlyArray<Destination> = [
    { key: "overview", route: "/overview", group: "workspace", icon: "overview" },
    { key: "chat", route: "/chat", group: "workspace", icon: "community" },
    { key: "agentos", route: "/agentos", group: "workspace", icon: "agentos" },
    { key: "apps", route: "/apps", group: "workspace", icon: "apps" },
    { key: "wallet", route: "/wallet", group: "account", icon: "wallet" },
]

/** Nivo route/translation adapter over the shared Grammar sidebar renderer. */
export const Sidebar = (props: SidebarProps) => {
    const mode = props.mode ?? "desktop"
    const t = useTranslations("console")
    const router = useRouter()
    const pathname = usePathname()
    const [isCollapsed, setCollapsed] = usePersistedFlag(NAVIGATION_COLLAPSED_KEY, false)
    const selectedKey =
        [...DESTINATIONS]
            .filter((destination) => pathname.startsWith(destination.route))
            .sort((left, right) => right.route.length - left.route.length)[0]?.key ?? "overview"

    const activate = (id: string): boolean => {
        const destination = DESTINATIONS.find((candidate): boolean => candidate.key === id)
        if (destination === undefined) return false
        router.push(destination.route)
        return true
    }
    const item = (destination: Destination) => ({
        id: destination.key,
        label: t(`nav.${destination.key}`),
        source: IconSource(destination.icon, "leading"),
    })
    const groups: ReadonlyArray<SidebarGroup> = (["workspace", "account"] as const).map((group) => ({
        id: group,
        ...(group === "workspace" ? {} : { label: t("accountCaption") }),
        items: DESTINATIONS.filter((destination) => destination.group === group).map(item),
    }))

    return (
        <SidebarBase
            state={mode}
            props={{
                groups,
                selectedKey,
                isCollapsed,
                navigationLabel: t("navigationLabel"),
                openMenuLabel: t("openMenu"),
                closeMenuLabel: t("closeMenu"),
                titleLabel: t("title"),
            }}
            on={{
                action: activate,
                collapsedChange: setCollapsed,
            }}
        />
    )
}
