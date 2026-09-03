"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Sidebar as GrammarSidebar, Text } from "@starci/grammar/core"
import { DrawerBranch, nivoIconSource } from "@nivo/ui"
import { usePathname, useRouter } from "@/i18n/navigation"

/** Which console surface the navigation is drawn on: the persistent rail, or the mobile drawer. */
export type SidebarMode = "desktop" | "mobile"

/** What a caller states about the navigation - the surface it belongs to, and nothing else. */
export type SidebarProps = { readonly mode?: SidebarMode }
type DestinationKey = "overview" | "apps" | "agentos" | "servers" | "domains" | "wallet" | "support"
type Destination = { readonly key: DestinationKey; readonly route: string | null; readonly group: "home" | "services" | "account" }

const DESTINATIONS: ReadonlyArray<Destination> = [
    { key: "overview", route: "/overview", group: "home" },
    { key: "apps", route: "/apps", group: "services" },
    { key: "agentos", route: "/agentos", group: "services" },
    { key: "servers", route: null, group: "services" },
    { key: "domains", route: null, group: "services" },
    { key: "wallet", route: "/wallet", group: "account" },
    { key: "support", route: null, group: "account" },
]
const STORAGE_KEY = "nivo-console-navigation-collapsed"

/** Nivo route/translation adapter over the shared Grammar sidebar renderer. */
export const Sidebar = (props: SidebarProps) => {
    const mode = props.mode ?? "desktop"
    const t = useTranslations("console")
    const router = useRouter()
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const selectedKey = DESTINATIONS.find((destination) => destination.route !== null && pathname.startsWith(destination.route))?.key ?? "overview"

    useEffect(() => {
        try { setIsCollapsed(globalThis.localStorage?.getItem(STORAGE_KEY) === "true") } catch { /* persistence is optional */ }
    }, [])

    const setCollapsed = (collapsed: boolean) => {
        setIsCollapsed(collapsed)
        try { globalThis.localStorage?.setItem(STORAGE_KEY, String(collapsed)) } catch { /* persistence is optional */ }
    }
    const activate = (id: string) => {
        const destination = DESTINATIONS.find((candidate) => candidate.key === id)
        if (destination?.route === null || destination?.route === undefined) return false
        router.push(destination.route)
        return true
    }
    const item = (destination: Destination) => ({
        id: destination.key,
        label: t(`nav.${destination.key}`),
        source: nivoIconSource(destination.key, "leading"),
        ...(destination.route === null ? { isDisabled: true, trailing: <Text size="xs" tone="muted">{t("unavailable")}</Text> } : {}),
    })
    const groups = (["home", "services", "account"] as const).map((group) => ({
        id: group,
        ...(group === "home" ? {} : { label: t(group === "services" ? "servicesCaption" : "accountCaption") }),
        items: DESTINATIONS.filter((destination) => destination.group === group).map(item),
    }))
    const content = (presentation: "rail" | "drawer", close?: () => void) => <GrammarSidebar
        label={t("navigationLabel")}
        groups={groups}
        selectedKey={selectedKey}
        presentation={presentation}
        isCollapsed={presentation === "rail" && isCollapsed}
        collapseLabel={t("closeMenu")}
        expandLabel={t("openMenu")}
        toggleSource={nivoIconSource("sidebar", "leading")}
        onAction={(id) => { if (activate(id)) close?.() }}
        onCollapsedChange={setCollapsed}
    />

    if (mode === "mobile") return <DrawerBranch triggerLabel={t("openMenu")} title={t("title")} closeLabel={t("closeMenu")} renderContent={(close) => content("drawer", close)} />
    return content("rail")
}
