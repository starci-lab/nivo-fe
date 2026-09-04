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
    };
};
const fact = (label: string, value: string) => <Text size="sm">{label}: {value}</Text>;
/** Show stable workspace identity and commercial allocation separately from live usage. */
export const AgentOSWorkspaceSummary = (props: AgentOSWorkspaceSummaryProps) => {
    const { data, labels }: AgentOSWorkspaceSummaryProps = props;
    return <SurfaceCard label={labels.section}><div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><>{fact(labels.status, data.workspace.status)}{fact(labels.plan, data.instance.planCode ?? "—")}{fact(labels.allocation, `${data.instance.ramMb} MB · ${data.instance.vcpu} vCPU`)}{fact(labels.host, data.instance.hostname)}{fact(labels.chart, data.instance.chartVersion)}</></div></SurfaceCard>;
};
