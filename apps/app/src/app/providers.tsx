"use client"

import { I18nProvider } from "@heroui/react"
import { NextIntlClientProvider, type Messages } from "next-intl"
import { ThemeProvider } from "next-themes"
import { SessionProvider } from "@/modules/auth/session"
import type { ReactNode } from "react"

/**
 * The contexts that sit above every route, and nothing else.
 *
 * Neither of them decides what a screen looks like, which is why they live beside the root layout
 * rather than in the component tree: no tier owns them. The layout is a server component, and this
 * file is the client boundary that lets them sit above every route without turning the whole shell
 * into client code.
 *
 * VENDOR LOCALE - `I18nProvider`. HeroUI's controls are built on react-aria, which resolves dates,
 * numbers and its own built-in strings against a LOCALE. Without a provider each control reads the
 * browser's locale independently, so a server render and the browser that hydrates it can disagree
 * - the hydration mismatch that only appears on somebody else's machine.
 *
 * THEME - `ThemeProvider`. `attribute="class"` rather than the `data-theme` attribute because the
 * vendor's stylesheet keys off `.dark`, and `globals.css` declares its `dark` variant against the
 * same hook. `system` is the default because a reader who has told their OS which they want has
 * already answered the question.
 *
 * WHERE THE LOCALE COMES FROM. The root layout reads it once with `getLocale()` and hands it in.
 * Both providers below take that same value, so the product catalogue and the vendor formatter can
 * never disagree about which language a render is in.
 */

/** Props for {@link AppProviders}. */
export interface AppProvidersProps {
    /**
     * The request's locale, resolved on the server.
     *
     * PASSED IN RATHER THAN READ HERE, because this file is a client boundary and a client component
     * cannot ask the server which request it belongs to. `NextIntlClientProvider` throws when it is
     * mounted from client code with no locale, and it threw here: both routes prerendered into an
     * unreadable digest until the app build was actually run.
     */
    readonly locale: string
    /** The catalogue for that locale, looked up on the server. */
    readonly messages: Messages
    /** The zone every date on the screen is written in. */
    readonly timeZone: string
    /** Everything rendered under the contexts - in practice, the whole shell. */
    readonly children: ReactNode
}

/**
 * Mount the contexts above every route.
 *
 * @param props - {@link AppProvidersProps}
 * @returns The provided tree.
 */
export const AppProviders = ({ locale, messages, timeZone, children }: AppProvidersProps) => (
    /*
     * TWO PROVIDERS THAT BOTH SAY "LOCALE", AND THEY ARE NOT THE SAME THING.
     *
     * `NextIntlClientProvider` carries THIS PRODUCT'S words - the message catalogue, resolved on the
     * server and handed down already looked up. `I18nProvider` carries the VENDOR's: react-aria
     * formats dates and numbers and ships its own built-in strings, and without it each control
     * reads the browser's locale independently, so a server render and the browser that hydrates it
     * can disagree - the mismatch that only shows up on somebody else's machine.
     *
     * Both take the same locale for the same reason, and neither can stand in for the other.
     */
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
        <I18nProvider locale={locale}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {/*
                  * THE SESSION SITS INSIDE THE VENDOR CONTEXTS AND ABOVE EVERY ROUTE. Inside,
                  * because a control that renders while the session is restoring still needs its
                  * locale and its theme; above, because who is signed in is not a question any one
                  * page owns.
                  */}
                <SessionProvider>{children}</SessionProvider>
            </ThemeProvider>
        </I18nProvider>
    </NextIntlClientProvider>
)
