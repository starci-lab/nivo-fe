import { AgentOSDashboardPage } from "@/components/blocks/agentos/AgentOSDashboardPage"

/** Route state for the dashboard, new workspace flow, or persisted order. */
export type AgentOSPageProps =
    | { readonly mode: "dashboard" }
    | { readonly mode: "create" }
    | { readonly mode: "resume"; readonly orderId: string }

/** Compose the interactive AgentOS route block for the requested route state. */
export const AgentOSPage = (props: AgentOSPageProps) => <AgentOSDashboardPage {...props} />

export default AgentOSPage