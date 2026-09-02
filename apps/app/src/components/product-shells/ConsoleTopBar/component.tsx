import { Text } from "@starci/grammar/common";
import type { ComponentType } from "react";
import { NivoBrand, ThemeSwitch } from "@nivo/ui";
import {
  CONSOLE_TOP_BAR_ACTIONS_CLASS_NAME,
  CONSOLE_TOP_BAR_CLASS_NAME,
  CONSOLE_TOP_BAR_DRAWER_CLASS_NAME,
  CONSOLE_TOP_BAR_IDENTITY_CLASS_NAME
} from "./classNames";

/** Pure top-bar labels, controls, and theme command. */
export type ConsoleTopBarProps<L extends object, A extends object, D extends object> = {
  readonly brandLabel: string;
  readonly contextLabel: string;
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

/** Draw the protected Nivo lockup and only capability-backed global tools. */
export const ConsoleTopBarBase = <L extends object, A extends object, D extends object>(props: ConsoleTopBarProps<L, A, D>) => {
  const {
    brandLabel,
    contextLabel,
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
  return <div className={CONSOLE_TOP_BAR_CLASS_NAME}><div className={CONSOLE_TOP_BAR_IDENTITY_CLASS_NAME}>


    <NivoBrand props={{
        label: brandLabel,
        variant: "lockup",
        scale: "navbar"
      }} />
    <Text weight="semibold">{contextLabel}</Text></div><div className={CONSOLE_TOP_BAR_ACTIONS_CLASS_NAME}>


    <LocaleControl {...localeControlProps} />
    <ThemeSwitch props={{
        isDark,
        label: isDark ? lightThemeLabel : darkThemeLabel
      }} on={{
        change: onToggleTheme
      }} />
    <AccountControl {...accountControlProps} />
    <div className={CONSOLE_TOP_BAR_DRAWER_CLASS_NAME}><DrawerControl {...drawerControlProps} /></div></div></div>;
};

/** Registry identity for the pure console top-bar twin. */
