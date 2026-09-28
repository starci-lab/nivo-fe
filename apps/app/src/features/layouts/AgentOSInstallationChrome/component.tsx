import type { ReactNode } from "react";
import { RouteTabs, SelectionList, type SelectionListGroup } from "@nivo/ui";

/** Every sentence, grouping and selection the installation chrome renders, resolved by its connected index. */
export type AgentOSInstallationChromeBaseData = {
    readonly modulesLabel: string;
    readonly sectionsLabel: string;
    readonly groups: ReadonlyArray<SelectionListGroup>;
    readonly selectedKey: string;
    readonly selectedTab: string;
    readonly tabs: ReadonlyArray<{ readonly id: string; readonly label: string }>;
};

/** The actions the chrome raises; the connected index binds them to the router. */
export type AgentOSInstallationChromeBaseActions = {
    readonly activate: (id: string) => void;
    readonly selectTab: (key: string) => void;
};

/** Props for {@link AgentOSInstallationChromeBase}: resolved data, actions, and the routed stream. */
export type AgentOSInstallationChromeBaseProps = {
    readonly props: AgentOSInstallationChromeBaseData;
    readonly on: AgentOSInstallationChromeBaseActions;
    readonly children: ReactNode;
};

/** The installation subnavigation and module section tabs, drawn with no world reads of its own. */
export const AgentOSInstallationChromeBase = ({ props, on, children }: AgentOSInstallationChromeBaseProps) =>
    <div className="flex flex-col gap-4" data-region="installation-nested-layout">
        <nav aria-label={props.modulesLabel} data-region="module-subnavigation">
            <SelectionList props={{
                label: props.modulesLabel,
                selectedKey: props.selectedKey,
                groups: props.groups
            }} on={{
                activate: on.activate
            }} />
        </nav>
        <RouteTabs props={{
            label: props.sectionsLabel,
            selectedKey: props.selectedTab,
            tabs: props.tabs
        }} on={{
            select: on.selectTab
        }} />
        {children}
    </div>;
