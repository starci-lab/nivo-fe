import { AgentOSWorkspaceAiKnowledge } from "@/components/blocks/agentos/AgentOSWorkspaceAiKnowledge"

type AgentOSWorkspaceAiKnowledgePaneProps = { readonly workspaceId: string }

/** Place AI knowledge in its dedicated workspace page section. */
export const AgentOSWorkspaceAiKnowledgePane = (props: AgentOSWorkspaceAiKnowledgePaneProps) => (
    <AgentOSWorkspaceAiKnowledge workspaceId={props.workspaceId} />
)
