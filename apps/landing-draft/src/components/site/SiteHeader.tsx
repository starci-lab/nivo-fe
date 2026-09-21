"use client"

import { NivoBrand } from "@nivo/ui"
import { Button, PageContainer, TextAction } from "@starci/grammar/common"
import { useEffect, useRef, useState } from "react"
import { ACTIVATION_LINK, SITE_COPY, SITE_LINKS, SITE_NAVIGATION, type SiteNavigationItem } from "@/resources/site"
import { SITE_CLASS_NAMES } from "./classNames"

const isNavigationGroup = (item: SiteNavigationItem): item is Extract<SiteNavigationItem, { readonly children: readonly unknown[] }> => "children" in item

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

/** The global header has no caller-owned visual or behavioral inputs. */
export type SiteHeaderProps = Record<never, never>

/** Accessible global navigation with one compact disclosure layer on small screens. */
export const SiteHeader = (props: SiteHeaderProps) => {
    void props
    const [isOpen, setIsOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const panelId = "site-mobile-navigation"

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
                    ref={triggerRef}
                    className={SITE_CLASS_NAMES.headerMenuTrigger}
                    type="button"
                    aria-controls={panelId}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? SITE_COPY.closeNavigationLabel : SITE_COPY.openNavigationLabel}
                    onClick={() => setIsOpen((value) => !value)}
                >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                </button>
            </PageContainer>

            {isOpen ? (
                <nav id={panelId} className={SITE_CLASS_NAMES.headerMobileNavigation} aria-label={SITE_COPY.mobileNavigationLabel}>
                    <NavigationList variant="mobile" onFollow={() => setIsOpen(false)} />
                    <div className={SITE_CLASS_NAMES.headerMobileActions}>
                        <TextAction href={SITE_LINKS.login} appearance="section" size="sm" onFollow={() => setIsOpen(false)}>
                            {SITE_COPY.login}
                        </TextAction>
                        <Button href={SITE_LINKS.contact} variant="primary" width="fill" onFollow={() => setIsOpen(false)}>
                            {SITE_COPY.contact}
                        </Button>
                    </div>
                </nav>
            ) : null}
        </header>
    )
}
