import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { I18nProvider } from "@nivo/i18n/provider"
import { NivoGrammarTheme } from "@nivo/ui"
import { getMessages } from "next-intl/server"
import { ThemeProvider } from "next-themes"
import { ACADEMY, inLocale } from "@/modules/academy/template"
import { CLIENT_NAMESPACES, pickMessages } from "@/modules/i18n/messages"
import { routing } from "@/modules/i18n/routing"
import { toLocale } from "@/modules/i18n/config"
import type { ComponentProps } from "react"

/** The routed locale segment, awaited by every handler in this file. */
export type LocaleSegment = {
    /** Next hands the dynamic segment over as a promise. */
    readonly params: Promise<{
        readonly locale: string
    }>
}

/** Props every route under this shell receives. */
type LocaleLayoutProps = {
    /** The rendered route. */
    readonly children: ComponentProps<"div">["children"]
    /** The locale segment, which Next hands over as a promise. */
    readonly params: Promise<{
        locale: string
    }>
}

/**
 * Which locales are built.
 *
 * Named rather than discovered, so a locale added to `LOCALES` and forgotten here fails at build
 * instead of falling back to the default for every visitor who asks for it.
 *
 * @returns One entry per locale this app ships copy for.
 */
export const generateStaticParams = () =>
    routing.locales.map((locale) => ({
        locale,
    }))

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
export const generateMetadata = async ({ params }: LocaleSegment): Promise<Metadata> => {
    const { locale } = await params
    const resolved = toLocale(locale)
    return {
        title: inLocale(ACADEMY.identity.name, resolved),
        description: inLocale(ACADEMY.identity.tagline, resolved),
    }
}

/**
 * The document shell.
 *
 * THE THEME IS THE DEVICE'S UNTIL THE PERSON CHOOSES. The provider follows the system setting by
 * default, keeps a choice made through the toggle, and writes its class onto `<html>` before first
 * paint, which is why `<html>` suppresses the hydration warning: the class differs from the server's
 * markup on purpose, and nothing else on the element may.
 *
 * The locale travels two ways: onto `<html lang>`, so a screen reader pronounces the page
 * correctly, and into the provider, so a client section can ask for a string instead of holding a
 * sentence beside its markup. Only the namespaces a client component reads are handed to the
 * provider; the rest of the catalogue stays on the server.
 *
 * AN UNKNOWN SEGMENT IS A 404, NOT A FALLBACK. `/fr` is a page that was never written; answering it
 * with the English one would tell a crawler that address exists and hand a reader a language they
 * did not ask for.
 *
 * IT LIVES IN `features/layouts` RATHER THAN BESIDE THE ROUTE, which is what makes the route a
 * route: `app/[locale]/layout.tsx` names which shell renders at which URL and hands the work here.
 * The stylesheet the document needs stays beside the route, because that import is the route tree's
 * own document wiring rather than this shell's markup.
 *
 * @param input - {@link LocaleLayoutProps}
 * @returns The html document.
 */
export const AcademyLocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }
    const messages = pickMessages(await getMessages(), CLIENT_NAMESPACES)
    return (
        <html lang={locale} suppressHydrationWarning>
            <body className="min-h-dvh bg-background text-foreground antialiased">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <NivoGrammarTheme>
                        <I18nProvider locale={locale} messages={messages}>
                            {children}
                        </I18nProvider>
                    </NivoGrammarTheme>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default AcademyLocaleLayout
