import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTimeZone, getTranslations } from "next-intl/server";
import { Open_Sans } from "next/font/google";
import type { ComponentProps, CSSProperties } from "react";
import { MESSAGE_SCOPES, pickMessages } from "@/modules/i18n/messages";
import { routing } from "@/modules/i18n/routing";
import { ConsoleLocaleLayoutBase } from "./component";

const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"]
});

/**
 * Browser-level metadata for every route under this shell.
 *
 * A FUNCTION, because the description is a translated string and a module constant is evaluated
 * before any request exists - there is no locale to resolve against at that moment.
 *
 * @returns The document metadata.
 */
export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations("app");
  return {
    title: "nivo Console",
    description: t("description")
  };
};

/** Props for {@link ConsoleLocaleLayout}. */
type ConsoleLocaleLayoutProps = {
  /** The rendered route. */
  readonly children: ComponentProps<"div">["children"];
  /** The routed locale segment, which Next hands over as a promise. */
  readonly params: Promise<{
    readonly locale: string;
  }>;
};

/**
 * Which locales are built.
 *
 * Named rather than discovered, so a locale added to `LOCALES` and forgotten here fails at build
 * instead of quietly falling back to the default for every visitor who asks for it.
 *
 * @returns One entry per locale this app ships copy for.
 */
export const generateStaticParams = () => routing.locales.map(locale => ({
  locale
}));

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
 * IT NO LONGER OPTS ITSELF INTO STATIC RENDERING, AND IT IS MORE STATIC THAN IT WAS. This used to
 * call `setRequestLocale(locale)` because anything reading the locale below would otherwise reach
 * the middleware's header and force the whole subtree dynamic. next-intl deprecated that call in
 * favour of `next/root-params`, which `src/i18n/request.ts` now reads: the segment is known before
 * the render begins, so no route has to announce it. The route table is the proof, and it moved the
 * right way - `/[locale]` was reported Dynamic before this change and is reported SSG after, because
 * the page under this layout never called `setRequestLocale` and so was never covered by it.
 *
 * IT SHIPS ONLY THE SHELL COPY. The catalogue is one file per locale and the console alone is most
 * of it, so each route group's own layout (`MessageScope`) adds the namespaces its pages read; the
 * document shell carries `app` and nothing else.
 *
 * IT LIVES IN `features/layouts` RATHER THAN BESIDE THE ROUTE, which is what makes the route a
 * route: `app/[locale]/layout.tsx` names which shell renders at which URL and hands the work here.
 * The viewport declaration and the stylesheet stay beside the route, because those are the route
 * tree's own document slots rather than this shell's markup.
 *
 * `lang` on the document takes the same value for the same reason: a page whose markup says `vi`
 * while its copy is English is a page every screen reader and every translation prompt reads wrong.
 *
 * @param input - The rendered route.
 * @returns The html document.
 */
export const ConsoleLocaleLayout = async ({
  children,
  params
}: ConsoleLocaleLayoutProps) => {
  /*
   * THE SEGMENT IS VALIDATED BEFORE ANYTHING ELSE. `/xx/provisioning` is a path a reader can type,
   * and an unrecognised locale reaching the message loader throws on a file that is not there -
   * a 500 where a 404 is the truthful answer.
   */
  const {
    locale
  } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const [messages, timeZone] = await Promise.all([getMessages(), getTimeZone()]);
  return <html lang={locale} suppressHydrationWarning>
            <body className="min-h-dvh bg-background text-foreground antialiased" style={{
      "--font-open-sans": openSans.style.fontFamily
    } as CSSProperties}>

                <ConsoleLocaleLayoutBase {...{ props: { locale, messages: pickMessages(messages, MESSAGE_SCOPES.root), timeZone }, children }} />
            </body>
        </html>;
};

export default ConsoleLocaleLayout;
