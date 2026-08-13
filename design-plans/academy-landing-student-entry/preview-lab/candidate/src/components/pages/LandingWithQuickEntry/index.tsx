"use client"

import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { Button, Heading, Text, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import { SignInOverlay } from "@/components/overlays/auth/SignInOverlay"
import { ACADEMY_NAME } from "@/modules/academy/identity"

/**
 * The quick-entry seam, standing in for the landing.
 *
 * DELIBERATELY NOT THE WHOLE LANDING. That page is already live and already proven; rebuilding it
 * in the candidate would review the wrong thing and invite Apply to port a second copy of it. What
 * this scene owes is the one relationship the landing does not have yet: a control that summons the
 * overlay, and a page still standing behind it.
 *
 * IT OPENS NO HOST OF ITS OWN. The first draft wrote `<main className="flex …">` and canon lint
 * refused it three times over - an element with no key, a literal structural class, and a bare
 * `<div>`. The shape is typed instead: `centred-page-column` for the column,
 * `stacked-peer-controls` for the control run, because that is the slot a `button` leaf is
 * admitted into. `spread-choice-row` looked closer by name and takes only `checkbox` and
 * `text-link`, which is the sort of thing the table knows and a reader does not.
 *
 * @returns The stand-in landing with its entry control.
 */
export const LandingWithQuickEntry = () => {
    const t = useTranslations("landing.hero")
    const [isOpen, setIsOpen] = useState(false)
    const open = useCallback(() => setIsOpen(true), [])
    const dismiss = useCallback(() => setIsOpen(false), [])

    return (
        <>
            <Tree
                contract="centred-page-column"
                render={defineContractComponent("centred-page-column", {
                    header: defineContractComponent("centred-title-pair", {
                        title: defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: ACADEMY_NAME, level: 1 }} />
                        )),
                        description: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: t("seeCourses"), size: "sm", tone: "muted" }} />
                        )),
                    }),
                    body: [
                        defineContractComponent("stacked-peer-controls", {
                            control: [
                                defineLeafComponent("button", {}, () => (
                                    <Button props={{ label: t("tryFree"), variant: "primary" }} on={{ press: open }} />
                                )),
                            ],
                        }),
                    ],
                })}
            />
            <SignInOverlay isOpen={isOpen} onDismiss={dismiss} />
        </>
    )
}
