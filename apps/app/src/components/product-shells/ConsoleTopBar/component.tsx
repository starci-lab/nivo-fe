import { NavigationFeatureNav, Text } from "@starci/grammar/common";
import type { ComponentType } from "react";
import { NivoBrand, ThemeSwitch } from "@nivo/ui";

/** Pure top-bar labels, controls, and theme command. */
export type ConsoleTopBarProps<L extends object, A extends object> = {
  readonly brandLabel: string;
  readonly contextLabel: string;
  readonly actionsLabel: string;
  readonly isDark: boolean;
  readonly lightThemeLabel: string;
  readonly darkThemeLabel: string;
  readonly localeControl: ComponentType<L>;
  readonly localeControlProps: L;
  readonly accountControl: ComponentType<A>;
  readonly accountControlProps: A;
  readonly onToggleTheme: () => void;
};

/**
 * Draw the protected Nivo lockup and only capability-backed global tools.
 *
 * The console has no top-bar-level primary destinations today - every route lives in the
 * persistent Sidebar rail - so the `navigation` slot is omitted entirely. The grammar renders no
 * `nav` element when it is absent, which is the point: an empty navigation landmark is still
 * announced, reached and counted by assistive technology while naming nothing.
 *
 * The compact trigger slot is empty for the same reason, now that `WorkspaceShell.compactNavigation`
 * owns every viewport below 70rem: keeping a second trigger here would leave two compact navigation
 * owners on screen at once below 48rem, and a named but empty group would announce a menu that is
 * not there. The grammar emits the group wrapper regardless, so it is left unnamed.
 */
export const ConsoleTopBarBase = <L extends object, A extends object>(props: ConsoleTopBarProps<L, A>) => {
  const {
    brandLabel,
    contextLabel,
    actionsLabel,
    isDark,
    lightThemeLabel,
    darkThemeLabel,
    localeControl: LocaleControl,
    localeControlProps,
    accountControl: AccountControl,
    accountControlProps,
    onToggleTheme
  }: ConsoleTopBarProps<L, A> = props;
  return <NavigationFeatureNav
    identity={<>
      <NivoBrand props={{
          label: brandLabel,
          variant: "lockup",
          scale: "navbar"
        }} />
      <Text weight="semibold">{contextLabel}</Text>
    </>}
    compactNavigationTrigger={null}
    compactNavigationTriggerLabel=""
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
