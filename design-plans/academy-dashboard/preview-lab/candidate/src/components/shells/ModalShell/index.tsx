import type { ReactNode } from "react"
import { Modal } from "@heroui/react"

/**
 * SHELL - `ModalShell`: the vendor's covering mechanics, wrapped once.
 *
 * PORTED, NOT DESIGNED. The source is
 * `starci-academy-fe/src/components/shells/ModalShell/index.tsx`, and its future home is
 * `packages/ui/src/shells/ModalShell/index.tsx` — `@nivo/ui` has no `shells/` folder at all today.
 * Canon names ModalShell one of the three shells that may expose `children`, so this is the one tier
 * allowed an untyped interior hole: a modal owns focus trapping, Escape, backdrop dismissal, scroll
 * locking and placement, and neither knows nor arranges what is mounted inside it.
 */

/** How wide the surface is allowed to get. */
export type ModalShellSize = "xs" | "sm" | "md" | "lg"

/** Props for {@link ModalShell}. */
export type ModalShellProps = {
    /** Whether the surface is on screen. Owned by whoever mounts it, never by the shell. */
    readonly isOpen: boolean
    /** How wide it may get. */
    readonly size?: ModalShellSize
    /** Content passed straight to the vendor body without inspection or arrangement. */
    readonly children?: ReactNode
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly onDismiss: () => void
}

/**
 * Draw the vendor modal mechanics and pass its interior straight through.
 *
 * @param input - {@link ModalShellProps}
 * @returns The vendor modal, or nothing rendered when closed.
 */
export const ModalShell = (input: ModalShellProps) => (
    <Modal
        isOpen={input.isOpen}
        onOpenChange={(open: boolean) => {
            if (!open) input.onDismiss()
        }}
    >
        <Modal.Backdrop>
            <Modal.Container size={input.size ?? "md"} placement="center">
                <Modal.Dialog data-tier="shell" data-component="ModalShell">
                    <Modal.CloseTrigger />
                    <Modal.Body className="p-0">{input.children}</Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    </Modal>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "shell", mechanics: true, world: "pure" } as const
