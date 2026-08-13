import type { Metadata, Viewport } from "next"
import { AppProviders } from "../providers"
import "../globals.css"
import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { getMessages, getTimeZone, getTranslations, setRequestLocale } from "next-intl/server"
import { routing } from "@/i18n/routing"

/**
 * Browser-level metadata for every route under this shell.
 *
 * A FUNCTION, because the description is a translated string and a module constant is evaluated
 * before any request exists - there is no locale to resolve against at that moment.
 *
 * @returns The document metadata.
 */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("app")
    return { title: "nivo app", description: t("description") }
}

/** Viewport behaviour for every route under this shell. */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
}

/** Props for {@link RootLayout}. */
interface RootLayoutProps {
    /** The rendered route. */
    readonly children: React.ReactNode
    /** The routed locale segment, which Next hands over as a promise. */
    readonly params: Promise<{ readonly locale: string }>
}

/**
 * Which locales are built.
 *
 * Named rather than discovered, so a locale added to `LOCALES` and forgotten here fails at build
 * instead of quietly falling back to the default for every visitor who asks for it.
 *
 * @returns One entry per locale this app ships copy for.
 */
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }))

/**
 * The document shell.
 *
 * THE LOCALE COMES FROM THE PATH. This layout sits inside `[locale]`, so the segment IS the answer -
 * read, validated, and handed down. It used to call `getLocale()` against a fixed default, which was
 * honest while the app served one language and became a lie the moment it served two.
 *
 * IT IS HANDED DOWN RATHER THAN RE-READ BELOW, because this is the last file that can read it. The
 * providers below are a client boundary, and a client component cannot ask the server which request
 * it belongs to - `NextIntlClientProvider` throws outright when it is mounted from client code with
 * no locale, which is exactly how this was found: both routes prerendered into an unreadable digest
 * until the build was actually run.
 *
 * `getLocale()` rather than the default constant, so `src/i18n/request.ts` stays the ONE place that
 * decides. Naming the default again here would work today and would quietly lie the moment a reader
 * can choose.
 *
 * `lang` on the document takes the same value for the same reason: a page whose markup says `vi`
 * while its copy is English is a page every screen reader and every translation prompt reads wrong.
 *
 * @param input - The rendered route.
 * @returns The html document.
 */
const RootLayout = async ({ children, params }: RootLayoutProps) => {
    /*
     * THE SEGMENT IS VALIDATED BEFORE ANYTHING ELSE. `/xx/provisioning` is a path a reader can type,
     * and an unrecognised locale reaching the message loader throws on a file that is not there -
     * a 500 where a 404 is the truthful answer.
     */
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }
    /*
     * Opting this whole subtree into static rendering. Without it every route under the frame becomes
     * dynamic the first time anything reads the locale, which is every route.
     */
    setRequestLocale(locale)
    const [messages, timeZone] = await Promise.all([getMessages(), getTimeZone()])
    return (
        <html lang={locale} suppressHydrationWarning>
            <body className="min-h-dvh bg-background text-foreground antialiased">
                <AppProviders locale={locale} messages={messages} timeZone={timeZone}>{children}</AppProviders>
            </body>
        </html>
    )
}

export default RootLayout
