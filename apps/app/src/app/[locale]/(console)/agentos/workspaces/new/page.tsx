import { AgentOSWorkspaceNewPage } from "@/features/pages/AgentOSWorkspaceNewPage"

/** Current eligible offers and purchaser admission are owner-scoped live data. */
export const dynamic = "force-dynamic"

/** Mount the offer-selection surface of the workspace purchase flow. */
const Page = () => <AgentOSWorkspaceNewPage />

export default Page
