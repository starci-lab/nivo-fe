"use client"

import { useCallback, useRef } from "react"
import { defineContractProjection } from "@nivo/ui"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"
import { _SignInOverlay } from "./component"

/**
 * OVERLAY - `SignInOverlay`, connected half.
 *
 * PORTED from `starci-academy-fe/src/components/overlays/auth/SignInOverlay/index.tsx`, minus the
 * `initialMode` prop: the academy has one journey, because it has one entry mutation.
 *
 * It resolves one thing: that being signed in is also a way out. The panel reports success, the
 * surface closes, and whatever opened it never learns why - which is what keeps the landing from
 * growing an opinion about authentication.
 */

/** Props for {@link SignInOverlay}. */
export type SignInOverlayConnectedProps = {
    /** Whether the surface is on screen. Owned by whoever opened it. */
    readonly isOpen: boolean
    /** Every way out. */
    readonly onDismiss: () => void
}

/**
 * Mount the panel inside the covering surface.
 *
 * @param input - {@link SignInOverlayConnectedProps}
 * @returns The overlay.
 */
export const SignInOverlay = ({ isOpen, onDismiss }: SignInOverlayConnectedProps) => {
    // Held in a ref so the callback handed to the panel keeps one identity: a changing prop would
    // remount the panel, and a reader part way through typing would lose it.
    const dismiss = useRef(onDismiss)
    dismiss.current = onDismiss

    const onSignedIn = useCallback(() => {
        dismiss.current()
    }, [])

    return (
        <_SignInOverlay
            isOpen={isOpen}
            onDismiss={onDismiss}
            render={defineContractProjection("centred-page-column", () => (
                /*
                 * Mounted only while the surface is open, not merely hidden with it. The panel runs
                 * the auth machine, and a second copy of every field id must not remain in the
                 * document behind a closed surface.
                 */
                isOpen ? <AuthenticationPanel onSignedIn={onSignedIn} /> : null
            ))}
        />
    )
}

/** Source-level tier marker. */
export const meta = { world: "connected", domain: "auth" } as const
