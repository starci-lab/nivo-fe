"use client"

import { Heading, Text, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import { useTranslations } from "next-intl"

/**
 * The authenticated console's persistent product bar.
 *
 * This bar deliberately contains only copy already owned by the console catalogue. Search,
 * language, theme, notification and account controls are absent until their own product behavior
 * exists; visual precedent cannot manufacture actions.
 */
export const ConsoleTopBar = () => {
    const t = useTranslations("console")

    return (
        <Tree
            contract="console-desktop-topbar"
            render={defineContractComponent("console-desktop-topbar", {
                brand: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: t("brand"), level: 2 }} />
                )),
                title: defineLeafComponent("text", {}, () => (
                    <Text props={{ content: t("title"), weight: "semibold" }} />
                )),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "layout", world: "connected" } as const
