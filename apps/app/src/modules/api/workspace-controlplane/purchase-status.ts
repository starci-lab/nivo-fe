import { type Outcome } from "@nivo/api"
import { myCatalogOrders, myInvoices } from "../commerce"
import { myAgentWorkspace } from "../agentos-workspaces"
import type { WorkspacePurchaseStatus } from "./purchase-types"

/**
 * Read the source-qualified status of one purchase (contract operation `read-purchase-status`).
 *
 * THREE SOURCES ANSWER INDEPENDENTLY AND EACH KEEPS ITS NAME. The order row, the invoice row and
 * the bound workspace row are read together; a source that refuses is reported as unavailable
 * beside the facts the others confirmed, so a slow billing read can never pass for a paid invoice
 * nor hide an already-bound workspace. When no source answered at all the read fails closed.
 *
 * @param purchaseId - The purchase identity returned by {@link startWorkspaceCheckout}.
 * @returns The status, or why no source could be read.
 */
export const readWorkspacePurchaseStatus = async (purchaseId: string): Promise<Outcome<WorkspacePurchaseStatus>> => {
    const [orders, invoices, workspaces] = await Promise.all([myCatalogOrders(), myInvoices(), myAgentWorkspace()])
    if (!orders.ok && !invoices.ok && !workspaces.ok) return orders
    let orderFact: WorkspacePurchaseStatus["order"]
    if (!orders.ok) {
        orderFact = { state: "unavailable", code: orders.code, failure: orders }
    } else {
        const order = orders.data.find((row) => row.id === purchaseId)
        orderFact =
            order === undefined
                ? { state: "missing" }
                : {
                      state: "observed",
                      status: order.status,
                      offerName: order.catalogItem?.name ?? null,
                      tierName: order.catalogTier?.name ?? null,
                  }
    }
    let paymentFact: WorkspacePurchaseStatus["payment"]
    if (!invoices.ok) {
        paymentFact = { state: "unavailable", code: invoices.code, failure: invoices }
    } else {
        const invoice = invoices.data.find((row) => row.catalogOrder?.id === purchaseId)
        paymentFact =
            invoice === undefined
                ? { state: "not-raised" }
                : {
                      state: "observed",
                      invoiceId: invoice.id,
                      status: invoice.status,
                      amountVnd: invoice.amountVnd,
                      paidAt: invoice.paidAt,
                  }
    }
    let provisioningFact: WorkspacePurchaseStatus["provisioning"]
    if (!workspaces.ok) {
        provisioningFact = { state: "unavailable", code: workspaces.code, failure: workspaces }
    } else {
        const workspace = workspaces.data.find((row) => row.catalogOrder?.id === purchaseId)
        provisioningFact =
            workspace === undefined
                ? { state: "not-admitted" }
                : {
                      state: "observed",
                      workspaceId: workspace.id,
                      workspaceName: workspace.name,
                      workspaceStatus: workspace.status,
                  }
    }
    return {
        ok: true,
        data: {
            purchaseId,
            observedAt: new Date().toISOString(),
            order: orderFact,
            payment: paymentFact,
            provisioning: provisioningFact,
        },
    }
}
