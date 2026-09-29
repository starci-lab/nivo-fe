import { cn } from "@heroui/react"
import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { I18nProvider } from "@nivo/i18n/provider"
import { getMessages, getTranslations } from "next-intl/server"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { NivoGrammarTheme } from "@/features/layouts/NivoGrammarTheme"
import { routing } from "@/modules/i18n/routing"
import { SiteShell } from "./component"

export { PUBLIC_SITE_URL } from "@/modules/landing/site"
export { pageMetadata, siteMetadata, type LocaleParams } from "@/modules/landing/metadata"
export { SITE_CLASS_NAMES } from "./classNames"
export { ProcessFlow, type ProcessFlowProps } from "../../../components/blocks/landing/ProcessFlow"
export { SectionIntro, type SectionIntroProps } from "../../../components/blocks/landing/SectionIntro"
export { SiteFooter } from "../SiteFooter"
export { SiteHeader } from "../SiteHeader"
export { SiteMain, type SiteMainProps } from "../SiteMain"
export { SiteShell, type SiteShellProps } from "./component"

/** Props for {@link SiteShellDocument}. */
type SiteShellDocumentProps = {
    /** The rendered route. */
    readonly children: ReactNode
    /** The routed locale segment, which Next hands over as a promise. */
    readonly params: Promise<{ readonly locale: string }>
}

/**
 * Which locales are built, named rather than discovered so a locale added to the routing and
 * forgotten here fails at build.
 *
 * @returns One entry per routed locale.
 */
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }))

/**
 * The document shell.
 *
 * It selects the NIVO family once, under a theme provider that follows the device until the visitor
 * chooses (written onto `<html>` before first paint, hence the suppressed hydration warning on that
 * element alone), so no screen below has to remember a theme, and it declares the document's language from the routed
 * segment, and hands the catalog of that language to every client section below it. AN UNKNOWN
 * SEGMENT IS A 404, not a fallback: `/fr` is a page nobody wrote.
 *
 * THE SITE CONSTANTS TRAVEL OUT THROUGH THIS FILE TOO, and that is deliberate rather than incidental:
 * the routing tree may reach project code only through a feature entry, and the shell owns the site's
 * own identity -- its address, its title, its description -- so the entry that holds the shell is the
 * entry that can hand them to a route's metadata or to its `robots`/`sitemap` handlers.
 *
 * @param input - The rendered route and the locale segment.
 * @returns The html document.
 */
export const SiteShellDocument = async ({ children, params }: SiteShellDocumentProps) => {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) notFound()
    const messages = await getMessages()
    const t = await getTranslations({ locale, namespace: "site" })

    return (
        <html
            lang={locale}
            suppressHydrationWarning
            className="min-w-80 max-w-full overflow-x-clip scroll-smooth motion-reduce:scroll-auto"
        >
            <body
                className={cn(
                    "min-w-80",
                    "max-w-full",
                    "overflow-x-clip",
                    "bg-surface",
                    "text-background-inverse",
                    "font-landing-page",
                    "[text-rendering:optimizeLegibility]",
                )}
            >
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <NivoGrammarTheme>
                        <I18nProvider locale={locale} messages={messages}>
                            <SiteShell skipLabel={t("skipToContent")}>{children}</SiteShell>
                        </I18nProvider>
                    </NivoGrammarTheme>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default SiteShellDocument
