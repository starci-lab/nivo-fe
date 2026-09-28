import PurchaseStatusFlow from "@/components/blocks/agentos/PurchaseStatusFlow";

/** Route identity supplied by the purchase segment. */
export type AgentOSWorkspacePurchasePageProps = {
    readonly params: Promise<{ readonly purchaseId: string }>;
};

/**
 * The `/[locale]/agentos/workspaces/purchases/[purchaseId]` screen, connected half.
 *
 * THE ROUTE IS A ROUTE AGAIN. `app/.../purchases/[purchaseId]/page.tsx` names which page renders at
 * which URL and hands the segment over unopened; unwrapping `purchaseId` and mounting the
 * payment-pending and provisioning states of that one purchase identity is this feature's work.
 *
 * @param input - The routed purchase segment.
 * @returns The page.
 */
export const AgentOSWorkspacePurchasePage = async ({ params }: AgentOSWorkspacePurchasePageProps) => {
    const { purchaseId } = await params;
    return <PurchaseStatusFlow purchaseId={purchaseId} />;
};

export default AgentOSWorkspacePurchasePage;
