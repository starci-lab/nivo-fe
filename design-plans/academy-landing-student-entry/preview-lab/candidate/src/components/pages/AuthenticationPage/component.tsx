import {
    SurfaceFormCard, Tree,
    defineContractComponent, defineContractProjection,
} from "@nivo/ui"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"
import type { AuthMode } from "@/components/blocks/auth/AuthenticationPanel/component"

/*
 * PORTED from starci-academy-fe's `AuthenticationPage`, save for the import
 * block above and the `initialMode` this academy's overlay needs.
 *
 * WHAT THE PORT FIXED. The page written here by hand projected the panel
 * straight into `centred-page-column` and drew no card at all, so the screen was
 * a form floating on the page background -- the washed-out look the owner
 * reported. The reference nests differently and that nesting IS the surface: the
 * route's contract holds a `SurfaceFormCard`, and the card holds the column.
 * Reading the contracts alone would not have shown it, because the contract
 * graph is identical either way; only the reference says a CARD renders that
 * node.
 */

/** What the authentication page reports. */
export type AuthenticationPageActions = {
    /** Called after the panel establishes a session. */
    readonly signedIn?: () => void
}

/** Props for {@link AuthenticationPageBase}. */
export type AuthenticationPageProps = {
    /** Which lane to open on. The route opens on sign-in. */
    readonly initialMode?: AuthMode
    readonly on?: AuthenticationPageActions
}

/**
 * Draw the authentication block as the one centred surface on the route.
 *
 * @param input - {@link AuthenticationPageProps}
 */
export const AuthenticationPageBase = ({ initialMode = "signIn", on }: AuthenticationPageProps) => {
    const cardContent = defineContractComponent("authentication-panel-card", {
        panel: defineContractProjection("centred-page-column", () => (
            <AuthenticationPanel initialMode={initialMode} onSignedIn={() => on?.signedIn?.()} />
        )),
    })
    return (
        <Tree
            contract="centred-authentication-page"
            render={defineContractComponent("centred-authentication-page", {
                surface: defineContractProjection("authentication-panel-card", () => (
                    <SurfaceFormCard contract="authentication-panel-card" render={cardContent} />
                )),
            })}
        />
    )
}

/** Source-level tier marker for the authentication page. */
export const meta = { world: "pure", domain: "auth" } as const
