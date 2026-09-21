import { AgentOSPage } from "@/components/pages/AgentOSPage"

/** Purchase offers and admission state are owner-scoped live data. */
export const dynamic = "force-dynamic"

/** Mount the pre-persistence AgentOS creation flow. */
const AgentOSCreateRoute = () => <AgentOSPage mode="create" />

export default AgentOSCreateRoute
