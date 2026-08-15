import { AgentOSPage } from "@/components/pages/AgentOSPage"

/** Dynamic route values for resuming one AgentOS order. */
type AgentOSOrderRouteProps = { readonly params: Promise<{ readonly orderId: string }> }

/** Mount the AgentOS product surface for one existing order. */
const AgentOSOrderRoute = async ({ params }: AgentOSOrderRouteProps) => {
    const { orderId } = await params
    return <AgentOSPage mode="resume" orderId={orderId} />
}

export default AgentOSOrderRoute
