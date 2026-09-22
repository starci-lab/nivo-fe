"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { AccountMenu } from "@/components/blocks/auth/AccountMenu";
import { LanguageMenu } from "@/components/blocks/locale/LanguageMenu";
import { ConsoleTopBarBase } from "./component";

/**
 * The authenticated console's persistent product bar.
 *
 * Its tools are capability-backed: locale routing, theme state and account sign-out already have
 * owners, while the narrow destination drawer lives in the shell's `compactNavigation` slot.
 * Search, commerce and notifications remain absent because Nivo does not yet own those behaviors;
 * visual precedent cannot manufacture actions.
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
  return <ConsoleTopBarBase brandLabel={t("brand")} contextLabel={t("title")} actionsLabel={t("actionsLabel")} isDark={isDark} lightThemeLabel={t("theme.light")} darkThemeLabel={t("theme.dark")} localeControl={LanguageMenu} localeControlProps={{}} accountControl={AccountMenu} accountControlProps={{}} onToggleTheme={() => setTheme(isDark ? "light" : "dark")} />;
};

