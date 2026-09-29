"use client"

import { I18nProvider } from "@heroui/react"
import { NextIntlClientProvider, type Messages } from "next-intl"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { SessionProvider } from "@/modules/auth/session"
import { NivoGrammarTheme } from "../NivoGrammarTheme"

/** The resolved request facts the provider stack needs, resolved by the layout. */
export type ConsoleProvidersData = {
    readonly locale: string
    readonly messages: Messages
    readonly timeZone: string
}

/** Props for {@link ConsoleProviders}: resolved data and the routed stream. */
export type ConsoleProvidersProps = {
    readonly props: ConsoleProvidersData
    readonly children: ReactNode
}

/**
 * Mount request locale, vendor theme and session contexts around the routed stream.
 *
 * The providers are client components (one of them, `@heroui/react`, is `client-only` and cannot
 * even be imported from a server module), so the whole stack is one connected unit: this file is
 * the client boundary the locale layout hands its resolved request facts to.
 */
export const ConsoleProviders = ({ props, children }: ConsoleProvidersProps) => {
    const { locale, messages, timeZone } = props
    return (
        <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
            <I18nProvider locale={locale}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <NivoGrammarTheme>
                        <SessionProvider>{children}</SessionProvider>
                    </NivoGrammarTheme>
                </ThemeProvider>
            </I18nProvider>
        </NextIntlClientProvider>
    )
}

export default ConsoleProviders
