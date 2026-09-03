import { NavigationFeatureNav, Text } from "@starci/grammar/core";
import type { ComponentType } from "react";
import { NivoBrand, ThemeSwitch } from "@nivo/ui";

/** Pure top-bar labels, controls, and theme command. */
export type ConsoleTopBarProps<L extends object, A extends object, D extends object> = {
  readonly brandLabel: string;
  readonly contextLabel: string;
  readonly actionsLabel: string;
  readonly compactNavigationTriggerLabel: string;
  readonly isDark: boolean;
  readonly lightThemeLabel: string;
  readonly darkThemeLabel: string;
  readonly localeControl: ComponentType<L>;
  readonly localeControlProps: L;
  readonly accountControl: ComponentType<A>;
  readonly accountControlProps: A;
  readonly drawerControl: ComponentType<D>;
  readonly drawerControlProps: D;
  readonly onToggleTheme: () => void;
};

/**
 * Draw the protected Nivo lockup and only capability-backed global tools.
 *
 * The console has no top-bar-level primary destinations today - every route lives in the
 * persistent Sidebar rail - so the `navigation` slot is omitted entirely. The grammar renders no
 * `nav` element when it is absent, which is the point: an empty navigation landmark is still
 * announced, reached and counted by assistive technology while naming nothing.
 */
export const ConsoleTopBarBase = <L extends object, A extends object, D extends object>(props: ConsoleTopBarProps<L, A, D>) => {
  const {
    brandLabel,
    contextLabel,
    actionsLabel,
    compactNavigationTriggerLabel,
    isDark,
    lightThemeLabel,
    darkThemeLabel,
    localeControl: LocaleControl,
    localeControlProps,
    accountControl: AccountControl,
    accountControlProps,
    drawerControl: DrawerControl,
    drawerControlProps,
    onToggleTheme
  }: ConsoleTopBarProps<L, A, D> = props;
  return <NavigationFeatureNav
    identity={<>
      <NivoBrand props={{
          label: brandLabel,
          variant: "lockup",
          scale: "navbar"
        }} />
      <Text weight="semibold">{contextLabel}</Text>
    </>}
    compactNavigationTrigger={<DrawerControl {...drawerControlProps} />}
    compactNavigationTriggerLabel={compactNavigationTriggerLabel}
    actions={<>
      <LocaleControl {...localeControlProps} />
      <ThemeSwitch props={{
          isDark,
          label: isDark ? lightThemeLabel : darkThemeLabel
        }} on={{
          change: onToggleTheme
        }} />
      <AccountControl {...accountControlProps} />
    </>}
    actionsLabel={actionsLabel}
  />;
};

/** Registry identity for the pure console top-bar twin. */
