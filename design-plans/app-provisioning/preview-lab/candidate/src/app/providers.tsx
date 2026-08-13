"use client"

import { I18nProvider } from "@heroui/react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import messages from "../../../../../../apps/app/src/messages/vi.json"
import { DEFAULT_LOCALE, TIME_ZONE } from "../../../../../../apps/app/src/i18n/config"

/**
 * The same three contexts `apps/app/src/app/providers.tsx` mounts, for the same reasons, so the
 * candidate renders under the production locale, catalogue and theme hooks rather than defaults of
 * its own.
 *
 * Target path on materialization: none. This file already exists in the app; Apply reuses it.
 *
 * THE CATALOGUE IS IMPORTED, NOT COPIED. `messages` is the app's own `src/messages/vi.json`, so
 * every word these screenshots seal is a word the app already ships; a candidate holding its own
 * copy would be evidence about a catalogue nobody deploys.
 *
 * It is passed EXPLICITLY here only because this build is a static export. In the app the same file
 * arrives through `src/i18n/request.ts` and the next-intl plugin, which run per request - a scope a
 * static export never enters. Wiring that plugin here was tried and fails at prerender. The loading
 * mechanism therefore differs, for the same declared reason `output: "export"` differs; the words do
 * not.
 */

/** Props for {@link CandidateProviders}. */
export interface CandidateProvidersProps {
    /** Everything rendered under the contexts. */
    readonly children: ReactNode
}

/**
 * Mount the contexts above the candidate route.
 *
 * @param props - {@link CandidateProvidersProps}
 * @returns The provided tree.
 */
export const CandidateProviders = ({ children }: CandidateProvidersProps) => (
    /*
     * `timeZone` is passed for the same reason the app's request config passes it, and it is not
     * decorative: with no zone configured next-intl formats server-side in the machine's zone and
     * client-side in the reader's, and reports `ENVIRONMENT_FALLBACK` the first time it has to.
     * Nothing on this screen prints a date yet - which is exactly why it is worth setting now,
     * before the first one arrives and takes a hydration mismatch with it.
     */
    <NextIntlClientProvider locale={DEFAULT_LOCALE} messages={messages} timeZone={TIME_ZONE}>
        <I18nProvider locale={DEFAULT_LOCALE}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                {children}
            </ThemeProvider>
        </I18nProvider>
    </NextIntlClientProvider>
)
