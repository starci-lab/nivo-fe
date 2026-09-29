"use client"

import { useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import type { SidebarGroup } from "@starci/grammar/common"
import { IconSource } from "@nivo/ui"
import { usePathname, useRouter } from "@/hooks"
import { SidebarBase } from "./component"

/** Which console surface the navigation is drawn on: the persistent rail, or the mobile drawer. */
export type SidebarMode = "desktop" | "mobile"

/** Every SidebarMode member, beside its union per the closed-vocabulary law. */
export const SIDEBAR_MODES: ReadonlyArray<SidebarMode> = ["desktop", "mobile"] as const

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
const STORAGE_KEY = "nivo-console-navigation-collapsed"

/*
 * The collapsed preference is external state: it lives in browser storage, not in React. The
 * `storage` event keeps other tabs in step, while `collapsedListeners` carries same-tab writes the
 * event never fires for. `collapsedMemory` is the fallback for an environment whose storage throws,
 * so the control still answers the click instead of reading the failure as "never stored".
 */
const collapsedListeners = new Set<() => void>()
let collapsedMemory: boolean | undefined

const subscribeCollapsed = (onChange: () => void): (() => void) => {
    if (typeof window === "undefined") {
        return () => undefined
    }
    collapsedListeners.add(onChange)
    window.addEventListener("storage", onChange)
    return () => {
        collapsedListeners.delete(onChange)
        window.removeEventListener("storage", onChange)
    }
}

const getCollapsedSnapshot = (): boolean => {
    try {
        const value = globalThis.localStorage?.getItem(STORAGE_KEY)
        if (value === "true") return true
        if (value === "false") return false
    } catch {
        /* persistence is optional */
    }
    return collapsedMemory ?? false
}

const getCollapsedServerSnapshot = (): boolean => false

const writeCollapsed = (collapsed: boolean) => {
    collapsedMemory = collapsed
    try {
        globalThis.localStorage?.setItem(STORAGE_KEY, String(collapsed))
    } catch {
        /* persistence is optional */
    }
    for (const listener of collapsedListeners) listener()
}

/** Nivo route/translation adapter over the shared Grammar sidebar renderer. */
export const Sidebar = (props: SidebarProps) => {
    const mode = props.mode ?? "desktop"
    const t = useTranslations("console")
    const router = useRouter()
    const pathname = usePathname()
    const isCollapsed = useSyncExternalStore(subscribeCollapsed, getCollapsedSnapshot, getCollapsedServerSnapshot)
    const selectedKey =
        [...DESTINATIONS]
            .filter((destination) => pathname.startsWith(destination.route))
            .sort((left, right) => right.route.length - left.route.length)[0]?.key ?? "overview"

    const setCollapsed = (collapsed: boolean) => {
        writeCollapsed(collapsed)
    }
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
