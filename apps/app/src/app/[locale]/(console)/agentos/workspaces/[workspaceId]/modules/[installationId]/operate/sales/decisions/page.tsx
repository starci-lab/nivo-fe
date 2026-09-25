import { SalesDecisionBlock } from "@/components/blocks/agentos/SalesDecisionBlock";
import type { AgentOSSolutionModuleRouteProps } from "../../../page";

/** The decision surface's own route: it mounts the surface for the installation the route names. */
const AgentOSModuleOperateSalesDecisionsRoute = async ({ params }: AgentOSSolutionModuleRouteProps) => {
  const { workspaceId, installationId } = await params;
  return <SalesDecisionBlock workspaceId={workspaceId} installationId={installationId} />;
};

export default AgentOSModuleOperateSalesDecisionsRoute;