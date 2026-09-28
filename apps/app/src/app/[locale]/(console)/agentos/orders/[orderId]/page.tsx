import { AgentOSPage } from "@/features/pages/AgentOSPage"

/** Payment and provisioning status must be read from the current owner-scoped snapshot. */
export const dynamic = "force-dynamic"

/** Dynamic route values for resuming one AgentOS order. */
type AgentOSOrderRouteProps = { readonly params: Promise<{ readonly orderId: string }> }

/** Mount the AgentOS product surface for one existing order. */
const Page = async ({ params }: AgentOSOrderRouteProps) => {
    const { orderId } = await params
    return <AgentOSPage mode="resume" orderId={orderId} />
}

export default Page
