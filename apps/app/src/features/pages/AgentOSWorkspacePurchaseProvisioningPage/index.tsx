import PurchaseStatusFlow from "@/components/blocks/agentos/PurchaseStatusFlow";

/** Route identity supplied by the purchase segment. */
export type AgentOSWorkspacePurchaseProvisioningPageProps = {
    readonly params: Promise<{ readonly purchaseId: string }>;
};

/**
 * The `/[locale]/agentos/workspaces/purchases/[purchaseId]/provisioning` screen, connected half.
 *
 * THE ROUTE IS A ROUTE AGAIN. `app/.../purchases/[purchaseId]/provisioning/page.tsx` names which
 * page renders at which URL and hands the segment over unopened; unwrapping `purchaseId` and
 * mounting the provisioning surface of that one purchase identity is this feature's work.
 *
 * @param input - The routed purchase segment.
 * @returns The page.
 */
export const AgentOSWorkspacePurchaseProvisioningPage = async ({ params }: AgentOSWorkspacePurchaseProvisioningPageProps) => {
    const { purchaseId } = await params;
    return <PurchaseStatusFlow purchaseId={purchaseId} surface="provisioning" />;
};

export default AgentOSWorkspacePurchaseProvisioningPage;
