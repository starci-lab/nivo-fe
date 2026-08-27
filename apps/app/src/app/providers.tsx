"use client"

import { I18nProvider } from "@heroui/react"
import { NextIntlClientProvider, type Messages } from "next-intl"
import { ThemeProvider } from "next-themes"
import type { ComponentProps } from "react"
import { SessionProvider } from "@/modules/auth/session"

/** Closed framework provider input; only Next's routed stream occupies the children slot. */
export type AppProvidersProps = {
    readonly locale: string
    readonly messages: Messages
    readonly timeZone: string
    readonly children: ComponentProps<"div">["children"]
}

/** Mount request locale, vendor theme and session contexts around the routed stream. */
export const AppProviders = ({ locale, messages, timeZone, children }: AppProvidersProps) => (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
        <I18nProvider locale={locale}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <SessionProvider>{children}</SessionProvider>
            </ThemeProvider>
        </I18nProvider>
    </NextIntlClientProvider>
)
