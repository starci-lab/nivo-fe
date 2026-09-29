import { NextIntlClientProvider } from "next-intl"
import type { ComponentProps } from "react"

/**
 * Shared provider for app layouts and scoped message catalogs.
 *
 * WHY NO `"use client"`: `next-intl` picks its `NextIntlClientProvider` per module layer. Imported from a
 * Server Component this file gets the server-aware variant that infers `locale` from the request; marking the
 * file itself a client module would pin the plain client variant, which throws when `locale` is omitted.
 */
export const I18nProvider = (props: ComponentProps<typeof NextIntlClientProvider>) => (
    <NextIntlClientProvider {...props} />
)
