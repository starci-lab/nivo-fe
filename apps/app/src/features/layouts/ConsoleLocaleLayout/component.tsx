"use client";

import { I18nProvider } from "@heroui/react";
import { NivoGrammarRoot } from "@nivo/ui";
import { NextIntlClientProvider, type Messages } from "next-intl";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState, type ComponentProps } from "react";
import { SessionProvider } from "@/modules/auth/session";

/** The resolved request facts the provider stack needs, resolved by its connected index. */
export type ConsoleLocaleLayoutBaseData = {
    readonly locale: string;
    readonly messages: Messages;
    readonly timeZone: string;
};

/** Props for {@link ConsoleLocaleLayoutBase}: resolved data and the routed stream. */
export type ConsoleLocaleLayoutBaseProps = {
    readonly props: ConsoleLocaleLayoutBaseData;
    readonly children: ComponentProps<"div">["children"];
};

/** Keep the nivo family palette on the same resolved theme as the console shell. */
const ResolvedNivoGrammarRoot = ({
    children
}: Pick<ConsoleLocaleLayoutBaseProps, "children">) => {
    const { resolvedTheme } = useTheme();
    const [isHydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);
    const grammarTheme = isHydrated && (resolvedTheme === "dark" || resolvedTheme === "light")
        ? resolvedTheme
        : "system";

    return <NivoGrammarRoot theme={grammarTheme}>{children}</NivoGrammarRoot>;
};

/** Mount request locale, vendor theme and session contexts around the routed stream. */
export const ConsoleLocaleLayoutBase = ({ props, children }: ConsoleLocaleLayoutBaseProps) => {
    const { locale, messages, timeZone } = props;
    return <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
        <I18nProvider locale={locale}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ResolvedNivoGrammarRoot>
                    <SessionProvider>{children}</SessionProvider>
                </ResolvedNivoGrammarRoot>
            </ThemeProvider>
        </I18nProvider>
    </NextIntlClientProvider>;
};
