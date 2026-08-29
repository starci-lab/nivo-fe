"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ConsoleNavBase, type ConsoleDestinationKey, type ConsoleNavMode } from "./component";
export type { ConsoleDestinationKey, ConsoleNavMode } from "./component";
/** Optional presentation selected by a console shell consumer. */
export interface ConsoleNavProps {
  readonly mode?: ConsoleNavMode;
}
interface ConsoleDestination {
  readonly key: ConsoleDestinationKey;
  readonly route: string | null;
}
const DESTINATIONS: ReadonlyArray<ConsoleDestination> = [{
  key: "overview",
  route: "/overview"
}, {
  key: "apps",
  route: "/apps"
}, {
  key: "agentos",
  route: "/agentos"
}, {
  key: "servers",
  route: null
}, {
  key: "domains",
  route: null
}, {
  key: "wallet",
  route: "/wallet"
}, {
  key: "support",
  route: null
}];

/** Connect current route and locale-aware navigation to the pure console destination owner. */
export const ConsoleNav = (props: ConsoleNavProps) => {
  const {
    mode = "desktop"
  }: ConsoleNavProps = props;
  const t = useTranslations("console");
  const router = useRouter();
  const route = usePathname();
  const selectedKey = DESTINATIONS.find(destination => destination.route !== null && route.startsWith(destination.route))?.key ?? "overview";
  const activate = (key: ConsoleDestinationKey) => {
    const destination = DESTINATIONS.find(candidate => candidate.key === key);
    if (destination?.route !== null && destination?.route !== undefined) router.push(destination.route);
  };
  return <ConsoleNavBase mode={mode} selectedKey={selectedKey} labels={{
    navigation: t("navigationLabel"),
    openMenu: t("openMenu"),
    closeMenu: t("closeMenu"),
    title: t("title"),
    services: t("servicesCaption"),
    account: t("accountCaption"),
    unavailable: t("unavailable"),
    destinations: {
      overview: t("nav.overview"),
      apps: t("nav.apps"),
      agentos: t("nav.agentos"),
      servers: t("nav.servers"),
      domains: t("nav.domains"),
      wallet: t("nav.wallet"),
      support: t("nav.support")
    }
  }} onActivate={activate} />;
};

/** Registry identity for the connected console navigation twin. */
