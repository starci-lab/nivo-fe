"use client"

import { I18nProvider } from "@heroui/react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import base from "../../../../../../apps/app/src/messages/vi.json"
import consoleMessages from "../messages/console.vi.json"
import { DEFAULT_LOCALE, TIME_ZONE } from "../../../../../../apps/app/src/i18n/config"

/**
 * The same three contexts `apps/app/src/app/providers.tsx` mounts, for the same reasons, so the
 * candidate renders under the production locale, catalogue and theme hooks rather than defaults of
 * its own.
 *
 * Target path on materialization: none. This file already exists in the app; Apply reuses it.
 *
 * THE BASE CATALOGUE IS IMPORTED, NOT COPIED. `base` is the app's own `src/messages/vi.json`, so the
 * words the shipped screens use are the words beside these new ones rather than a second copy that
 * can drift. What IS new is `console.vi.json` next door: the `console` namespace does not exist in
 * the shipped catalogue yet, and Apply merges it in and writes the `en.json` twin.
 *
 * `TIME_ZONE` IS LOAD-BEARING HERE, WHICH IT WAS NOT IN THE AUTHENTICATION CANDIDATE. That case
 * printed no dates. This console prints `renewsAt`, `dueAt` and `expiresAt`, and next-intl left
 * without a zone formats on the server in the SERVER's zone and on the client in the READER's - the
 * same timestamp rendering one way and hydrating into another, which takes the handlers on that
 * subtree down with it.
 *
 * The catalogue is passed EXPLICITLY here only because this build is a static export. In the app the
 * same file arrives through `src/i18n/request.ts` and the next-intl plugin, which run per request - a
 * scope a static export never enters. The loading mechanism therefore differs, for the same declared
 * reason `output: "export"` differs; the words do not.
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
    <NextIntlClientProvider locale={DEFAULT_LOCALE} messages={{ ...base, ...consoleMessages }} timeZone={TIME_ZONE}>
        <I18nProvider locale={DEFAULT_LOCALE}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                {children}
            </ThemeProvider>
        </I18nProvider>
    </NextIntlClientProvider>
)
