import { AgentOSOpenClawLaunch } from "@/components/blocks/agentos/AgentOSOpenClawLaunch"

/** Every atom the bridge needs: the exact workspace route identity and nothing else. */
type AgentOSOpenClawLaunchBridgeBaseData = {
    readonly workspaceId: string
}

/** Complete input of {@link AgentOSOpenClawLaunchBridgeBase}: resolved atoms only, no launch state crosses in. */
type AgentOSOpenClawLaunchBridgeBaseProps = {
    readonly props: AgentOSOpenClawLaunchBridgeBaseData
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type AgentOSOpenClawLaunchBridgeProps = AgentOSOpenClawLaunchBridgeBaseProps

/** Compose the connected launch block without proxying launch state through PageProps. */
export const AgentOSOpenClawLaunchBridgeBase = (props: AgentOSOpenClawLaunchBridgeProps) => {
    const { props: data }: AgentOSOpenClawLaunchBridgeProps = props
    return <AgentOSOpenClawLaunch workspaceId={data.workspaceId} />
}
