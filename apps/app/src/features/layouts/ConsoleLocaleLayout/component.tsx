import type { ReactNode } from "react"
import { ConsoleProviders, type ConsoleProvidersData } from "@/app/[locale]/providers"

/** The resolved request facts the provider stack needs, resolved by its connected index. */
type ConsoleLocaleLayoutBaseData = ConsoleProvidersData

/** Props for {@link ConsoleLocaleLayoutBase}: resolved data and the routed stream. */
type ConsoleLocaleLayoutBaseProps = {
    readonly props: ConsoleLocaleLayoutBaseData
    readonly children: ReactNode
}

/** Mount the console provider stack around the routed stream. */
export const ConsoleLocaleLayoutBase = ({ props, children }: ConsoleLocaleLayoutBaseProps) => (
    <ConsoleProviders props={props}>{children}</ConsoleProviders>
)
