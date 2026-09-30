import { NavigationFeatureNav, Text } from "@starci/grammar/common"
import type { ComponentType } from "react"
import { NivoBrand } from "@nivo/ui"

/** The mounted controls take no props: the connected half renders them fully resolved. */
type ConsoleTopBarControlProps = { readonly [key: string]: never }

/**
 * The bar's approved drawing: which resolved controls mount in its actions band.
 *
 * The controls arrive as render functions plus their atoms because they read the world - the
 * connected half resolves them, and instantiating them here keeps every render path pure.
 */
type ConsoleTopBarBaseState = {
    readonly localeControl: ComponentType<ConsoleTopBarControlProps>
    readonly localeControlProps: ConsoleTopBarControlProps
    readonly themeControl: ComponentType<ConsoleTopBarControlProps>
    readonly themeControlProps: ConsoleTopBarControlProps
    readonly accountControl: ComponentType<ConsoleTopBarControlProps>
    readonly accountControlProps: ConsoleTopBarControlProps
}

/** Pure top-bar labels. */
type ConsoleTopBarBaseData = {
    readonly brandLabel: string
    readonly contextLabel: string
    readonly actionsLabel: string
}

/** Public API role for ConsoleTopBarBaseProps. */
type ConsoleTopBarBaseProps = {
    readonly state: ConsoleTopBarBaseState
    readonly props: ConsoleTopBarBaseData
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type ConsoleTopBarProps = ConsoleTopBarBaseProps

/**
 * Draw the protected Nivo lockup and only capability-backed global tools.
 *
 * The console has no top-bar-level primary destinations today - every route lives in the
 * persistent Sidebar rail - so the `navigation` slot is omitted entirely. The grammar renders no
 * `nav` element when it is absent, which is the point: an empty navigation landmark is still
 * announced, reached and counted by assistive technology while naming nothing.
 *
 * The compact trigger slot is empty for the same reason, now that `WorkspaceShell.compactNavigation`
 * owns every viewport below 70rem: keeping a second trigger here would leave two compact navigation
 * owners on screen at once below 48rem, and a named but empty group would announce a menu that is
 * not there. The grammar emits the group wrapper regardless, so it is left unnamed.
 */
export const ConsoleTopBarBase = (props: ConsoleTopBarProps) => {
    const {
        state: {
            localeControl: LocaleControl,
            localeControlProps,
            themeControl: ThemeControl,
            themeControlProps,
            accountControl: AccountControl,
            accountControlProps,
        },
        props: { brandLabel, contextLabel, actionsLabel },
    }: ConsoleTopBarProps = props
    return (
        <NavigationFeatureNav
            identity={
                <>
                    <NivoBrand
                        props={{
                            label: brandLabel,
                            variant: "lockup",
                            scale: "navbar",
                        }}
                    />
                    <Text weight="semibold">{contextLabel}</Text>
                </>
            }
            compactNavigationTrigger={null}
            compactNavigationTriggerLabel=""
            actions={
                <>
                    <LocaleControl {...localeControlProps} />
                    <ThemeControl {...themeControlProps} />
                    <AccountControl {...accountControlProps} />
                </>
            }
            actionsLabel={actionsLabel}
        />
    )
}

/** Registry identity for the pure console top-bar twin. */
