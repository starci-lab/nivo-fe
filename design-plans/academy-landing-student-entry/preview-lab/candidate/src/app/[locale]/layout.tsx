import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { ACADEMY_NAME } from "@/modules/academy/identity"
import "../globals.css"

/** The candidate's shell. Deliberately thin: the states under review are the entry ones. */
export const metadata: Metadata = { title: ACADEMY_NAME }

/** Viewport behaviour for every route in the candidate. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 }

/** Props every route under this shell receives. */
type LocaleLayoutProps = {
    /** The rendered route. */
    readonly children: React.ReactNode
    /** Next hands the dynamic segment over as a promise. */
    readonly params: Promise<{ locale: string }>
}

/**
 * The document shell.
 *
 * @param input - {@link LocaleLayoutProps}
 * @returns The html document.
 */
const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
    const { locale } = await params
    setRequestLocale(locale)
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
