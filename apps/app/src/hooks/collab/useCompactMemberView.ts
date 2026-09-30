
import { useState, useSyncExternalStore } from "react"

/**
 * The same 48rem edge ChatWorkspace's installed compact rail presentation reads
 * (`compactRailQuery` in @starci/grammar). Below it the surface keeps the peer
 * tabs and the member chip on one chrome row and presents the member content as
 * a bottom sheet instead of the right-edge drawer.
 */
const COMPACT_MEMBER_QUERY = "(max-width: 47.999rem)"

const subscribeToCompactMember = (onStoreChange: () => void): (() => void) => {
    if (typeof window === "undefined") {
        return () => undefined
    }
    const query = window.matchMedia(COMPACT_MEMBER_QUERY)
    query.addEventListener("change", onStoreChange)
    return () => query.removeEventListener("change", onStoreChange)
}
const getCompactMemberSnapshot = (): boolean =>
    typeof window !== "undefined" && window.matchMedia(COMPACT_MEMBER_QUERY).matches
const getCompactMemberServerSnapshot = (): boolean => false

/** The compact member presentation the connected page settles into the base chrome. */
export type CompactMemberView = {
    /** The viewport is in the compact member-sheet presentation. */
    readonly isCompactMembers: boolean
    readonly isRailOpen: boolean
    readonly changeRailOpen: (isOpen: boolean) => void
}

/**
 * Follow the compact member breakpoint and own the member-sheet open flag.
 *
 * THE SHEET IS DERIVED, NOT CLOSED BY AN EFFECT. The sheet may be open only
 * while the viewport is compact and the Office surface is ready, so the flag is
 * keyed on that allowance: when it flips, the render-phase adjustment resets
 * the sheet to closed, and a stale open flag can never reopen it on the next
 * compact pass.
 *
 * @param surfaceReady - The Office surface is in its ready state.
 */
export const useCompactMemberView = (surfaceReady: boolean): CompactMemberView => {
    const compactMembers = useSyncExternalStore(
        subscribeToCompactMember,
        getCompactMemberSnapshot,
        getCompactMemberServerSnapshot,
    )
    const allowed = surfaceReady && compactMembers
    const [rail, setRail] = useState<{ readonly allowed: boolean; readonly open: boolean }>({
        allowed,
        open: false,
    })
    if (rail.allowed !== allowed) {
        setRail({ allowed, open: false })
    }
    return {
        isCompactMembers: compactMembers,
        isRailOpen: rail.open && allowed,
        changeRailOpen: (isOpen) => setRail({ allowed, open: isOpen }),
    }
}
