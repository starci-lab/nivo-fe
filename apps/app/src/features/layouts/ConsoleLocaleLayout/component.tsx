import { I18nProvider } from "@heroui/react";
import { NextIntlClientProvider, type Messages } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { SessionProvider } from "@/modules/auth/session";
import { NivoGrammarTheme } from "../NivoGrammarTheme";

/** The resolved request facts the provider stack needs, resolved by its connected index. */
export type ConsoleLocaleLayoutBaseData = {
    readonly locale: string;
    readonly messages: Messages;
    readonly timeZone: string;
};

/** Props for {@link ConsoleLocaleLayoutBase}: resolved data and the routed stream. */
export type ConsoleLocaleLayoutBaseProps = {
    readonly props: ConsoleLocaleLayoutBaseData;
    readonly children: ReactNode;
};

/** Mount request locale, vendor theme and session contexts around the routed stream. */
export const ConsoleLocaleLayoutBase = ({ props, children }: ConsoleLocaleLayoutBaseProps) => {
    const { locale, messages, timeZone } = props;
    return <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
        <I18nProvider locale={locale}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <NivoGrammarTheme>
                    <SessionProvider>{children}</SessionProvider>
                </NivoGrammarTheme>
            </ThemeProvider>
        </I18nProvider>
    </NextIntlClientProvider>;
};
