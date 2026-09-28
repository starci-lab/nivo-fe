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
export type ConsoleTopBarProps = { readonly [key: string]: never };

/**
 * Mount the connected locale menu through a stable pure render function.
 *
 * The render-boundary law keeps a world-reading owner's render paths on statically resolved pure
 * targets; a bare connected component is not one. A module-level function is both resolved and
 * referentially stable, so the mounted menu keeps its identity - and its open state - across
 * re-renders exactly as the direct reference did.
 */
const renderLocaleControl = () => <LanguageMenu />;
/** The account menu on the same bridge. */
const renderAccountControl = () => <AccountMenu />;

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
  return <ConsoleTopBarBase
    state={{
      localeControl: renderLocaleControl,
      localeControlProps: {},
      accountControl: renderAccountControl,
      accountControlProps: {}
    }}
    props={{
      brandLabel: t("brand"),
      contextLabel: t("title"),
      actionsLabel: t("actionsLabel"),
      isDark,
      lightThemeLabel: t("theme.light"),
      darkThemeLabel: t("theme.dark")
    }}
    on={{ toggleTheme: () => setTheme(isDark ? "light" : "dark") }}
  />;
};

