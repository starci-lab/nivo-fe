"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { AccountMenu } from "@/components/blocks/auth/AccountMenu";
import { LanguageMenu } from "@/components/blocks/locale/LanguageMenu";
import { Sidebar } from "@/components/product-shells/Sidebar";
import { ConsoleTopBarBase } from "./component";

/**
 * The authenticated console's persistent product bar.
 *
 * Its tools are capability-backed: locale routing, theme state, account sign-out and the narrow
 * destination drawer already have owners. Search, commerce and notifications remain absent because
 * Nivo does not yet own those behaviors; visual precedent cannot manufacture actions.
 */
export type ConsoleTopBarProps = Record<string, never>;
/** Public API role for ConsoleTopBar. */
export const ConsoleTopBar = (props: ConsoleTopBarProps) => {
  void props;
  const t = useTranslations("console");
  const {
    resolvedTheme,
    setTheme
  } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const isDark = isMounted && resolvedTheme === "dark";
  return <ConsoleTopBarBase brandLabel={t("brand")} contextLabel={t("title")} actionsLabel={t("actionsLabel")} compactNavigationTriggerLabel={t("openMenu")} isDark={isDark} lightThemeLabel={t("theme.light")} darkThemeLabel={t("theme.dark")} localeControl={LanguageMenu} localeControlProps={{}} accountControl={AccountMenu} accountControlProps={{}} drawerControl={Sidebar} drawerControlProps={{
    mode: "mobile"
  }} onToggleTheme={() => setTheme(isDark ? "light" : "dark")} />;
};

