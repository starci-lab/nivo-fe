"use client"

import { I18nProvider } from "@heroui/react"
import type { Messages } from "next-intl"
import { I18nProvider as NextI18nProvider } from "@nivo/i18n/provider"
import { NivoGrammarTheme } from "@nivo/ui"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { SessionProvider } from "@/modules/auth/session"

/** The resolved request facts the provider stack needs, resolved by the layout. */
export type ConsoleProvidersData = {
    readonly locale: string
    readonly messages: Messages
    readonly timeZone: string
}

/** Props for {@link ConsoleProviders}: resolved data and the routed stream. */
type ConsoleProvidersProps = {
    readonly props: ConsoleProvidersData
    readonly children: ReactNode
}

/** Mount locale, vendor theme and session providers around the routed stream. */
export const ConsoleProviders = ({ props, children }: ConsoleProvidersProps) => {
    const { locale, messages, timeZone } = props
    return (
        <NextI18nProvider locale={locale} messages={messages} timeZone={timeZone}>
            <I18nProvider locale={locale}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <NivoGrammarTheme>
                        <SessionProvider>{children}</SessionProvider>
                    </NivoGrammarTheme>
                </ThemeProvider>
            </I18nProvider>
        </NextI18nProvider>
    )
}

export default ConsoleProviders