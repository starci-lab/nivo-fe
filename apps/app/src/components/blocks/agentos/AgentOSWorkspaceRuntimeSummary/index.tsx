import { AgentOSWorkspaceRuntime } from "@/components/blocks/agentos/AgentOSWorkspaceRuntime"
import { AgentOSWorkspaceSummary } from "@/components/blocks/agentos/AgentOSWorkspaceSummary"
import { HelmStackSnapshot } from "@/components/blocks/operations/HelmStackSnapshot"
import type { AgentOSWorkspaceControlCenterLabels } from "@/modules/agentos/workspace-control-center/labels"
import type { AgentWorkspaceControlCenter } from "@/modules/api/agentos-workspaces"
import { PrimaryRailLayout } from "@starci/grammar/common"

type AgentOSWorkspaceRuntimeSummaryProps =
    | {
          readonly view: "summary"
          readonly data: AgentWorkspaceControlCenter
          readonly labels: AgentOSWorkspaceControlCenterLabels["summary"]
      }
    | {
          readonly view: "runtime"
          readonly data: AgentWorkspaceControlCenter
          readonly labels: Pick<AgentOSWorkspaceControlCenterLabels, "runtime" | "stack">
          readonly formatDate: (value: string) => string
      }

/** Draw the overview summary or its infrastructure runtime and stack pair. */
export const AgentOSWorkspaceRuntimeSummary = (props: AgentOSWorkspaceRuntimeSummaryProps) => {
    if (props.view === "summary") return <AgentOSWorkspaceSummary data={props.data} labels={props.labels} />
    return (
        <PrimaryRailLayout
            primary={<AgentOSWorkspaceRuntime data={props.data} labels={props.labels.runtime} formatDate={props.formatDate} />}
            rail={<HelmStackSnapshot runtime={props.data.runtime} labels={props.labels.stack} />}
            align="start"
        />
    )
}
