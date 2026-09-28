import CheckoutReviewFlow from "@/components/blocks/agentos/CheckoutReviewFlow";

/**
 * The `/[locale]/agentos/workspaces/new/checkout` screen, connected half.
 *
 * THE ROUTE IS A ROUTE AGAIN. `app/.../workspaces/new/checkout/page.tsx` names which page renders
 * at which URL and mounts exactly this entry; the checkout-review surface itself - the frozen
 * offer, the purchaser admission and the payment start - is the block's world, resolved through
 * `@/hooks` like every other connected unit.
 *
 * @returns The page.
 */
export const AgentOSWorkspaceCheckoutPage = () => <CheckoutReviewFlow />;

export default AgentOSWorkspaceCheckoutPage;
