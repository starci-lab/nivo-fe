"use client"

import { NextIntlClientProvider } from "next-intl"
import type { ComponentProps } from "react"

/** Shared client provider boundary for app layouts and scoped message catalogs. */
export const I18nProvider = (props: ComponentProps<typeof NextIntlClientProvider>) => (
    <NextIntlClientProvider {...props} />
)
