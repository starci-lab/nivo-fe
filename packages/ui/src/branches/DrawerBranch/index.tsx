"use client"

import { Drawer } from "@heroui/react"
import type { ComponentType } from "react"

/** Fixed copy and content owned by the right-edge drawer mechanic. */
export type DrawerBranchProps<P extends object> = {
    readonly triggerLabel: string
    readonly title: string
    readonly closeLabel: string
    readonly content: ComponentType<P>
    readonly contentProps: P
}

/** Own HeroUI drawer placement, focus, dismissal, backdrop and the single scroll body. */
export const DrawerBranch = <P extends object>({ triggerLabel, title, closeLabel, content: Content, contentProps }: DrawerBranchProps<P>) => (
    <Drawer.Root>
        <Drawer.Trigger className="min-h-10 rounded-large px-3 text-sm font-semibold text-foreground outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-accent">
            {triggerLabel}
        </Drawer.Trigger>
        <Drawer.Backdrop isDismissable>
            <Drawer.Content placement="right">
                <Drawer.Dialog>
                    <Drawer.Header className="border-b border-separator px-4 py-4">
                        <Drawer.Heading className="text-lg font-semibold text-foreground">{title}</Drawer.Heading>
                        <Drawer.CloseTrigger className="min-h-10 rounded-large px-3 text-sm font-semibold text-foreground outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-accent">
                            {closeLabel}
                        </Drawer.CloseTrigger>
                    </Drawer.Header>
                    <Drawer.Body className="p-0"><Content {...contentProps} /></Drawer.Body>
                </Drawer.Dialog>
            </Drawer.Content>
        </Drawer.Backdrop>
    </Drawer.Root>
)

/** Source-level tier marker for the named drawer mechanics owner. */
export const meta = { shape: "branch", world: "pure" } as const
