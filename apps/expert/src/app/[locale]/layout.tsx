import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages } from "next-intl/server"
import { ACADEMY, inLocale } from "@/modules/academy/template"
import { routing } from "@/i18n/routing"
import type { Locale } from "@/i18n/config"
import "../globals.css"

/** The routed locale segment, awaited by every handler in this file. */
export interface LocaleSegment {
    /** Next hands the dynamic segment over as a promise. */
    readonly params: Promise<{ readonly locale: string }>
}

/** Props every route under this shell receives. */
interface LocaleLayoutProps {
    /** The rendered route. */
    readonly children: React.ReactNode
    /** The locale segment, which Next hands over as a promise. */
    readonly params: Promise<{ locale: string }>
}

/**
 * Which locales are built.
 *
 * Named rather than discovered, so a locale added to `LOCALES` and forgotten here fails at build
 * instead of falling back to the default for every visitor who asks for it.
 *
 * @returns One entry per locale this app ships copy for.
 */
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }))

/**
 * The tab and the search result belong to the ACADEMY, not to nivo.
 *
 * These strings come from the mounted template rather than from a message catalogue for the same
 * reason the hero does: they are one academy's own words, and a product that translated them would
 * be rewriting a customer's sentences. What this DOES choose is which of the versions the expert
 * authored to use, and it can now choose correctly.
 *
 * THIS IS WHY THE LOCALE MOVED INTO THE PATH. The description used to resolve at the default locale
 * whatever the reader had chosen, because a cookie cannot be read this early -- so a page rendering
 * in Vietnamese described itself to every crawler in English. A segment is known before the route
 * is matched, so the two now agree.
 *
 * @param input - The locale segment.
 * @returns Title and description in the reader's language.
 */
export const generateMetadata = async (
    { params }: LocaleSegment,
): Promise<Metadata> => {
    const { locale } = await params
    const resolved = (hasLocale(routing.locales, locale) ? locale : routing.defaultLocale) as Locale
    return {
        title: inLocale(ACADEMY.identity.name, resolved),
        description: inLocale(ACADEMY.identity.tagline, resolved),
    }
}

/** Viewport behaviour for every route under this shell. */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
}

/**
 * The document shell.
 *
 * The locale travels two ways: onto `<html lang>`, so a screen reader pronounces the page
 * correctly, and into the provider, so a client section can ask for a string instead of holding a
 * sentence beside its markup.
 *
 * AN UNKNOWN SEGMENT IS A 404, NOT A FALLBACK. `/fr` is a page that was never written; answering it
 * with the English one would tell a crawler that address exists and hand a reader a language they
 * did not ask for.
 *
 * @param input - {@link LocaleLayoutProps}
 * @returns The html document.
 */
const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }
    const messages = await getMessages()
    return (
        <html lang={locale} suppressHydrationWarning>
            <body className="min-h-dvh antialiased">
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    )
}

export default LocaleLayout
