"use client"

import { useEffect, useRef, useState } from "react"
import { SiteHeaderBase } from "./component"

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
            props={{ open: isOpen }}
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
