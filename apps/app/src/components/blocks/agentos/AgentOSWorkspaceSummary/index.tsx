import { CONTENT_CLASS_NAME } from "./classNames";
import type { AgentWorkspaceControlCenter } from "@/modules/api/console";
import { SurfaceCard, Text } from "@starci/grammar/common";
/** Stable workspace identity and labels consumed by the summary block. */
export type AgentOSWorkspaceSummaryProps = {
    readonly data: AgentWorkspaceControlCenter;
    readonly labels: {
        readonly section: string;
        readonly status: string;
        readonly plan: string;
        readonly allocation: string;
        readonly host: string;
        readonly chart: string;
        /** The one line shown in place of the instance facts when the workspace has no instance yet. */
        readonly unprovisioned: string;
    };
};
const fact = (label: string, value: string) => <Text size="sm">{label}: {value}</Text>;
/**
 * Show stable workspace identity and commercial allocation separately from live usage.
 *
 * An owned workspace with no instance keeps its status line; the plan, allocation, host and chart lines
 * are facts about an instance, so with none they give way to one sentence saying so.
 */
export const AgentOSWorkspaceSummary = (props: AgentOSWorkspaceSummaryProps) => {
    const { data, labels }: AgentOSWorkspaceSummaryProps = props;
    const { instance } = data;
    const instanceFacts = instance === null ? <Text size="sm" tone="muted">{labels.unprovisioned}</Text> : <>{fact(labels.plan, instance.planCode ?? "—")}{fact(labels.allocation, `${instance.ramMb} MB · ${instance.vcpu} vCPU`)}{fact(labels.host, instance.hostname)}{fact(labels.chart, instance.chartVersion)}</>;
    return <SurfaceCard label={labels.section}><div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><>{fact(labels.status, data.workspace.status)}{instanceFacts}</></div></SurfaceCard>;
};
