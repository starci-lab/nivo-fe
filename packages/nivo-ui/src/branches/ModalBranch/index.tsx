"use client"

import { Modal } from "@heroui/react"
import type { ComponentType } from "react"
import {
    MODAL_BODY_CLASS_NAME,
    MODAL_CLOSE_CLASS_NAME,
    MODAL_HEADER_CLASS_NAME,
    MODAL_HEADING_CLASS_NAME,
    MODAL_TRIGGER_CLASS_NAME,
} from "./classNames"

/** Copy and content owned by the centered, controlled modal mechanic. */
export type ModalBranchProps<P extends object> = {
    readonly isOpen: boolean
    readonly title: string
    readonly closeLabel: string
    readonly content: ComponentType<P>
    readonly contentProps: P
    readonly onDismiss: () => void
}

/** Own modal focus, dismissal, backdrop and the single scrolling body. */
export const ModalBranch = <P extends object>(props: ModalBranchProps<P>) => {
    const Content = props.content
    return (
        <Modal.Root
            isOpen={props.isOpen}
            onOpenChange={(open) => {
                if (!open) props.onDismiss()
            }}
        >
            <Modal.Trigger className={MODAL_TRIGGER_CLASS_NAME} aria-hidden="true" tabIndex={-1} />
            <Modal.Backdrop isDismissable>
                <Modal.Container placement="center" scroll="inside" size="md">
                    <Modal.Dialog>
                        <Modal.Header className={MODAL_HEADER_CLASS_NAME}>
                            <Modal.Heading className={MODAL_HEADING_CLASS_NAME}>{props.title}</Modal.Heading>
                            <Modal.CloseTrigger aria-label={props.closeLabel} className={MODAL_CLOSE_CLASS_NAME}>
                                {props.closeLabel}
                            </Modal.CloseTrigger>
                        </Modal.Header>
                        <Modal.Body className={MODAL_BODY_CLASS_NAME}>
                            <Content {...props.contentProps} />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal.Root>
    )
}
