"use client";

import { Heading, Text, Badge } from "@starci/grammar/core";
import type { ComponentType } from "react";
import { Breadcrumbs, RouteTabs, TileIcon } from "@nivo/ui";

/** Stable routed task identities owned by the shared installed-module shell. */
export type AgentOSModuleView = "setup" | "test" | "operate" | "settings" | "diagnostics";

/** Copy and runtime identity shared by every route in one installed module. */
export type ModuleRouteShellData = {
  readonly workspaceLabel: string;
  readonly moduleName: string;
  readonly moduleKind: string;
  readonly lifecycleLabel: string;
  readonly contextVersion: string;
  readonly channelLabel: string;
  readonly controllerLabel: string;
  readonly activeView: AgentOSModuleView;
};

/** Stable component-type lane used to replace the shell body without accepting prebuilt JSX. */
export type ModuleRouteShellBlockProps<P extends object> = ModuleRouteShellData & {
  readonly content: ComponentType<P>;
  readonly contentProps: P;
  readonly onBackToModules: () => void;
  readonly onNavigate: (view: AgentOSModuleView) => void;
};
const ROUTES: ReadonlyArray<{
  readonly id: AgentOSModuleView;
  readonly label: string;
}> = [{
  id: "setup",
  label: "Setup"
}, {
  id: "test",
  label: "Test"
}, {
  id: "operate",
  label: "Operate"
}, {
  id: "settings",
  label: "Settings"
}, {
  id: "diagnostics",
  label: "Diagnostics"
}];

/** Keep module identity and context continuity stable while one typed task body changes. */
export const ModuleRouteShellBlock = <P extends object,>(props: ModuleRouteShellBlockProps<P>) => {
  const {
    workspaceLabel,
    moduleName,
    moduleKind,
    lifecycleLabel,
    contextVersion,
    channelLabel,
    controllerLabel,
    activeView,
    content: Content,
    contentProps,
    onBackToModules,
    onNavigate
  }: ModuleRouteShellBlockProps<P> = props;
  return <div>


  <Breadcrumbs props={{
      mode: "trail",
      label: "AgentOS module path",
      steps: [{
        id: "workspace",
        label: workspaceLabel
      }, {
        id: "modules",
        label: "Modules"
      }, {
        id: "module",
        label: moduleName,
        isCurrent: true
      }]
    }} on={{
      activate: id => id !== "module" && onBackToModules()
    }} /><div><div>




      <TileIcon props={{
          icon: "agentos",
          signal: "attention"
        }} /><div>


        <Text size="sm" tone="accent" weight="semibold">{moduleKind}</Text>


        <Heading level={1} scale="display">{moduleName}</Heading>


        <Text size="md" tone="muted">{`Active context ${contextVersion} · ${channelLabel} · ${controllerLabel}`}</Text>

        <Badge tone="success">{lifecycleLabel}</Badge></div></div></div>




  <RouteTabs props={{
      label: "Module sections",
      selectedKey: activeView,
      tabs: ROUTES
    }} on={{
      select: key => onNavigate(key as AgentOSModuleView)
    }} />


  <Content {...contentProps} /></div>;
};
