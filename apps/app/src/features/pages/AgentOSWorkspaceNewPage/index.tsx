import OfferSelectionFlow from "@/components/blocks/agentos/OfferSelectionFlow";

/**
 * The `/[locale]/agentos/workspaces/new` screen, connected half.
 *
 * THE ROUTE IS A ROUTE AGAIN. `app/.../workspaces/new/page.tsx` names which page renders at which
 * URL and mounts exactly this entry; the offer-selection surface of the workspace purchase flow -
 * the eligible offers and the purchaser admission - is the block's world, resolved through
 * `@/hooks` like every other connected unit.
 *
 * @returns The page.
 */
export const AgentOSWorkspaceNewPage = () => <OfferSelectionFlow />;

export default AgentOSWorkspaceNewPage;
