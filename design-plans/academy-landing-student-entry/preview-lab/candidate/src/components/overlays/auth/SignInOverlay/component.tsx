import { ContractContent, type ContractComponent, type ContractKey } from "@nivo/ui"
import { ModalShell } from "@/components/shells/ModalShell"

/**
 * OVERLAY - `SignInOverlay`, presentational half.
 *
 * PORTED from `starci-academy-fe/src/components/overlays/auth/SignInOverlay/component.tsx`.
 *
 * IT OWNS A SURFACE THAT COVERS THE PAGE, and nothing else - canon OVERLAY-1. The entity inside it
 * belongs to a block (OVERLAY-9), so this file takes no title, no copy and no domain prop: it has
 * never heard of authentication, and the same arrangement carries a confirmation tomorrow.
 *
 * THE PANEL KEEPS ITS OWN TITLE, deliberately. The same panel is a whole route elsewhere, where
 * nothing hosts it - so a title supplied by the host would exist on one surface and be missing on
 * the other, and the panel would have to know which it was inside. That is exactly the property
 * this case needs: `/[locale]/sign-in` and this overlay are two hosts for ONE block, and the block
 * cannot be made to care which one it is in.
 *
 * IT DOES NOT TOUCH THE VENDOR. The focus trap, the backdrop, the placement and the scroll lock
 * are `ModalShell`'s, wrapped once at the shell tier - which is what stops two surfaces disagreeing
 * about how a modal behaves.
 */

/** Props for {@link SignInOverlayBase}. */
export type SignInOverlayProps<K extends ContractKey> = {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the surface. */
    readonly isOpen: boolean
    /** Typed branch mounted inside the otherwise content-agnostic modal shell. */
    readonly render: ContractComponent<K>
    /** Every way out: the close control, Escape, the backdrop, and a successful sign-in. */
    readonly onDismiss: () => void
}

/**
 * Draw the covering surface.
 *
 * @param input - {@link SignInOverlayProps}
 * @returns The modal shell with the typed branch inside it.
 */
export const SignInOverlayBase = <const K extends ContractKey>(input: SignInOverlayProps<K>) => (
    <ModalShell isOpen={input.isOpen} size="xs" onDismiss={input.onDismiss}>
        <ContractContent contract={input.render.meta.contract} render={input.render} />
    </ModalShell>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure", domain: "auth" } as const
