"use client";

type ShellActiveContextValues = { readonly version: string; readonly channel: string; readonly controller: string };
type ShellBoundContextValues = { readonly version: number };
type ShellConversationValues = { readonly number: number };
type ShellUnknownKindValues = { readonly kind: string };
type ShellUnknownStatusValues = { readonly status: string };
type ShellWorkspaceValues = { readonly id: string };

/** Settled display labels and typed formatters supplied by the page owner. */
export type ModuleRouteShellBlockCopy = {
  readonly "shell": {
    readonly "activeContext": (values: ShellActiveContextValues) => string;
    readonly "boundContext": (values: ShellBoundContextValues) => string;
    readonly "channelConnected": string;
    readonly "channelDisconnected": string;
    readonly "controllerAttention": string;
    readonly "controllerHealthy": string;
    readonly "conversation": (values: ShellConversationValues) => string;
    readonly "diagnostics": string;
    readonly "genericAgent": string;
    readonly "kind": {
      readonly "accounting": string;
      readonly "customer-support": string;
      readonly "generic-agent": string;
      readonly "research": string;
      readonly "scheduling": string;
    };
    readonly "live": string;
    readonly "loading": string;
    readonly "modules": string;
    readonly "noContextApplied": string;
    readonly "noExecuteSession": string;
    readonly "operate": string;
    readonly "path": string;
    readonly "primaryOperations": string;
    readonly "reading": string;
    readonly "refused": string;
    readonly "sections": string;
    readonly "settings": string;
    readonly "setup": string;
    readonly "telegramConnected": string;
    readonly "test": string;
    readonly "unavailable": string;
    readonly "unknownKind": (values: ShellUnknownKindValues) => string;
    readonly "unknownStatus": (values: ShellUnknownStatusValues) => string;
    readonly "workspace": (values: ShellWorkspaceValues) => string;
  };
};


import { Heading, Text, Badge } from "@starci/grammar/common";

import type { ComponentType } from "react";
import { Breadcrumbs, RouteTabs, TileIcon } from "@nivo/ui";
import { MODULE_ROUTE_SHELL_CLASS_NAME, MODULE_ROUTE_SHELL_DETAIL_CLASS_NAME, MODULE_ROUTE_SHELL_IDENTITY_CLASS_NAME } from "./classNames";

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
  readonly copy: ModuleRouteShellBlockCopy;
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
  label: ""
}, {
  id: "test",
  label: ""
}, {
  id: "operate",
  label: ""
}, {
  id: "settings",
  label: ""
}, {
  id: "diagnostics",
  label: ""
}];

/** Keep module identity and context continuity stable while one typed task body changes. */
export const ModuleRouteShellBlock = <P extends object,>(props: ModuleRouteShellBlockProps<P>) => {
  const { copy } = props;
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
  const routes = ROUTES.map(route => ({ ...route, label: copy.shell[route.id] }));
  const kindLabels: Readonly<Record<string, string>> = { "generic-agent": copy.shell.kind["generic-agent"], "customer-support": copy.shell.kind["customer-support"], accounting: copy.shell.kind.accounting, scheduling: copy.shell.kind.scheduling, research: copy.shell.kind.research };
  const machineKey = /^custom:[0-9a-f-]{20,}$/i.test(moduleName);
  const heading = machineKey && moduleKind === "generic-agent" ? copy.shell.genericAgent : moduleName;
  return <div className={MODULE_ROUTE_SHELL_CLASS_NAME} data-contract="MEASURE-2 GAP-4 FLOW-3">


  <Breadcrumbs props={{
      mode: "trail",
      label: copy.shell.path,
      steps: [{
        id: "workspace",
        label: workspaceLabel
      }, {
        id: "modules",
        label: copy.shell.modules
      }, {
        id: "module",
        label: moduleName,
        isCurrent: true
      }]
    }} on={{
      activate: id => id !== "module" && onBackToModules()
      }} /><div>




      <TileIcon props={{
          icon: "agentos",
          signal: "attention"
      }} /><div className={MODULE_ROUTE_SHELL_IDENTITY_CLASS_NAME} data-contract="GAP-2">


        <Text size="xs">{(Object.hasOwn(kindLabels, moduleKind) ? kindLabels[moduleKind] : copy.shell.unknownKind({ kind: moduleKind }))}</Text>


        <Heading level={1}>{heading}</Heading>
        {machineKey ? <Text size="sm" tone="muted">{moduleName}</Text> : null}


        <div className={MODULE_ROUTE_SHELL_DETAIL_CLASS_NAME} data-contract="GAP-2">
          <Text size="sm" tone="muted">{copy.shell.activeContext({ version: contextVersion, channel: channelLabel, controller: controllerLabel })}</Text>

          <Badge tone="neutral">{lifecycleLabel}</Badge>
        </div>
      </div></div>




  <RouteTabs props={{
      label: copy.shell.sections,
      selectedKey: activeView,
      tabs: routes
    }} on={{
      select: key => onNavigate(key as AgentOSModuleView)
    }} />


  <Content {...contentProps} /></div>;
};
