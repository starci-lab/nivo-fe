"use client";

import { I18nProvider } from "@heroui/react";
import { CoreGrammarRoot } from "@starci/grammar/core";
import { NextIntlClientProvider, type Messages } from "next-intl";
import { ThemeProvider, useTheme } from "next-themes";
import { useSyncExternalStore, type ComponentProps } from "react";
import { SessionProvider } from "@/modules/auth/session";

/** Closed framework provider input; only Next's routed stream occupies the children slot. */
export type AppProvidersProps = {
  readonly locale: string;
  readonly messages: Messages;
  readonly timeZone: string;
  readonly children: ComponentProps<"div">["children"];
};

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

/** Keep the Core family palette on the same resolved theme as the console shell. */
const ResolvedCoreGrammarRoot = ({
  children
}: Pick<AppProvidersProps, "children">) => {
  const { resolvedTheme } = useTheme();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const grammarTheme = isHydrated && (resolvedTheme === "dark" || resolvedTheme === "light")
    ? resolvedTheme
    : "system";

  return <CoreGrammarRoot theme={grammarTheme}>{children}</CoreGrammarRoot>;
};

/** Mount request locale, vendor theme and session contexts around the routed stream. */
export const AppProviders = (props: AppProvidersProps) => {
  const { locale, messages, timeZone, children } = props;
  return <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
        <I18nProvider locale={locale}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ResolvedCoreGrammarRoot>
                    <SessionProvider>{children}</SessionProvider>
                </ResolvedCoreGrammarRoot>
            </ThemeProvider>
        </I18nProvider>
    </NextIntlClientProvider>;
};
