"use client"

import { Modal } from "@heroui/react"
import type { ReactNode } from "react"

/** Copy and content owned by the centered, controlled modal mechanic. */
export type ModalBranchProps = {
    readonly isOpen: boolean
    readonly title: string
    readonly closeLabel: string
    readonly content: ReactNode
    readonly onDismiss: () => void
}

/** Own modal focus, dismissal, backdrop and the single scrolling body. */
export const ModalBranch = ({ isOpen, title, closeLabel, content, onDismiss }: ModalBranchProps) => (
    <Modal.Root isOpen={isOpen} onOpenChange={(open) => { if (!open) onDismiss() }}>
        <Modal.Trigger className="hidden" aria-hidden="true" tabIndex={-1} />
        <Modal.Backdrop isDismissable>
            <Modal.Container placement="center" scroll="inside" size="md">
                <Modal.Dialog>
                    <Modal.Header className="border-b border-separator px-4 py-4">
                        <Modal.Heading className="text-lg font-semibold text-foreground">{title}</Modal.Heading>
                        <Modal.CloseTrigger aria-label={closeLabel} className="min-h-10 rounded-large px-3 text-sm font-semibold text-foreground outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-accent">
                            {closeLabel}
                        </Modal.CloseTrigger>
                    </Modal.Header>
                    <Modal.Body className="p-0">{content}</Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    </Modal.Root>
)

/** Source-level tier marker for the named modal mechanics owner. */
export const meta = { shape: "branch", world: "pure" } as const
