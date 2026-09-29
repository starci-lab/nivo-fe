"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { ThemeToggle } from "@/components/blocks/theme/ThemeToggle"
import { useLocalizedHref } from "@/hooks"
import { SITE_LINKS, SITE_NAVIGATION } from "@/modules/landing/site"
import { SiteHeaderBase, type SiteHeaderEntry } from "./component"

/** The connected header takes no input: its disclosure state is owned here. */
export type SiteHeaderProps = Record<string, never>

/**
 * Accessible global navigation with one compact disclosure layer on small screens.
 *
 * The disclosure state and its focus recovery live in this connected half: Escape closes the
 * compact navigation and returns focus to the trigger that opened it, while the drawing itself
 * stays pure in `component.tsx`.
 */
export const SiteHeader = (props: SiteHeaderProps) => {
    void props
    const [isOpen, setIsOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const t = useTranslations("site")
    const href = useLocalizedHref()
    const navigation: ReadonlyArray<SiteHeaderEntry> = SITE_NAVIGATION.map((item) =>
        "children" in item
            ? {
                  id: item.id,
                  label: t(`navigation.${item.id}`),
                  children: item.children.map((child) => ({
                      id: child.id,
                      label: t(`navigation.${child.id}`),
                      href: href(child.href),
                  })),
              }
            : { id: item.id, label: t(`navigation.${item.id}`), href: href(item.href) },
    )

    useEffect(() => {
        if (!isOpen) return undefined

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return
            setIsOpen(false)
            triggerRef.current?.focus()
        }

        window.addEventListener("keydown", closeOnEscape)
        return () => window.removeEventListener("keydown", closeOnEscape)
    }, [isOpen])

    return (
        <SiteHeaderBase
            state={{ themeControl: <ThemeToggle /> }}
            props={{
                open: isOpen,
                navigation,
                hrefs: { home: href(SITE_LINKS.home), login: SITE_LINKS.login, contact: href(SITE_LINKS.contact) },
                copy: {
                    homeLabel: t("homeLabel"),
                    primaryNavigationLabel: t("primaryNavigationLabel"),
                    mobileNavigationLabel: t("mobileNavigationLabel"),
                    quickActionsLabel: t("quickActionsLabel"),
                    openNavigationLabel: t("openNavigationLabel"),
                    closeNavigationLabel: t("closeNavigationLabel"),
                    login: t("login"),
                    contact: t("contact"),
                },
            }}
            on={{
                toggle: () => setIsOpen((value) => !value),
                follow: () => setIsOpen(false),
                menuTrigger: (element) => {
                    triggerRef.current = element
                },
            }}
        />
    )
}
