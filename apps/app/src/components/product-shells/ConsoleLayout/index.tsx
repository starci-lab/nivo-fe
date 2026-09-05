"use client";

import { useEffect } from "react";
import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { ConsoleLayoutBase } from "./component";

/** Connected console frame input already projected by the framework route boundary. */
export type ConsoleLayoutProps<P extends object> = {
  readonly body: ComponentType<P>;
  readonly bodyProps: P;
};

/**
 * Where an anonymous reader is sent, carrying the console route that interrupted them.
 *
 * THE INTERRUPTED ROUTE TRAVELS ON THE QUERY, NOT IN STATE. A reader who arrives from a shared deep
 * link has no state yet; the address is the only thing that survives the round trip through the
 * sign-in page, and the sign-in page reads it back from there. The locale prefix is not carried:
 * `usePathname` answers without it and the router puts it back on the way in.
 *
 * @param pathname - The locale-less console route the reader was on.
 * @returns The sign-in address, with the route to return to when there is one worth returning to.
 */
const signInHrefFor = (pathname: string | null): string =>
  pathname === null || pathname === "" || pathname === "/" ? "/authentication" : `/authentication?returnTo=${encodeURIComponent(pathname)}`;

/** Guard the authenticated console and hand drawing to its pure layout twin. */
export const ConsoleLayout = <P extends object,>(props: ConsoleLayoutProps<P>) => {
  const {
    body,
    bodyProps
  }: ConsoleLayoutProps<P> = props;
  const t = useTranslations("console");
  const router = useRouter();
  const pathname = usePathname();
  const status = useSession().state.status;
  useEffect(() => {
    if (status === "anonymous") router.replace(signInHrefFor(pathname));
  }, [status, router, pathname]);
  return <ConsoleLayoutBase
    body={body}
    bodyProps={bodyProps}
    navigationLabel={t("navigationLabel")}
    primaryLabel={t("workspaceLabel")}
  />;
};

/** Registry identity for the connected console layout twin. */
