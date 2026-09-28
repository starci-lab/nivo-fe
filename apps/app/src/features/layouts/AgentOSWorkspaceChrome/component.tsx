import type { ComponentProps } from "react";
import { RouteTabs } from "@nivo/ui";
import { Heading, Text } from "@starci/grammar/common";

/** Every sentence and selection the workspace chrome renders, resolved by its connected index. */
export type AgentOSWorkspaceChromeBaseData = {
    readonly eyebrow: string;
    readonly name: string;
    readonly reference: string;
    readonly tabsLabel: string;
    readonly overviewLabel: string;
    readonly modulesLabel: string;
    readonly selectedKey: "overview" | "modules";
};

/** The one action the chrome raises; the connected index binds it to the router. */
export type AgentOSWorkspaceChromeBaseActions = {
    readonly select: (key: string) => void;
};

/** Props for {@link AgentOSWorkspaceChromeBase}: resolved data, actions, and the routed stream. */
export type AgentOSWorkspaceChromeBaseProps = {
    readonly props: AgentOSWorkspaceChromeBaseData;
    readonly on: AgentOSWorkspaceChromeBaseActions;
    readonly children: ComponentProps<"div">["children"];
};

/** The workspace header and overview/modules route tabs, drawn with no world reads of its own. */
export const AgentOSWorkspaceChromeBase = ({ props, on, children }: AgentOSWorkspaceChromeBaseProps) =>
    <div className="flex flex-col gap-4" data-region="workspace-nested-layout">
        <header className="flex flex-col gap-1" data-region="workspace-context">
            <Text as="p" size="xs" tone="muted">{props.eyebrow}</Text>
            <Heading level={2}>{props.name}</Heading>
            <Text as="p" size="xs" tone="muted">{props.reference}</Text>
        </header>
        <RouteTabs props={{
            label: props.tabsLabel,
            selectedKey: props.selectedKey,
            tabs: [{
                id: "overview",
                label: props.overviewLabel
            }, {
                id: "modules",
                label: props.modulesLabel
            }]
        }} on={{
            select: on.select
        }} />
        {children}
    </div>;
