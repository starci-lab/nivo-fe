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
    const order = orders.ok ? orders.data.find((row) => row.id === purchaseId) : undefined
    const invoice = invoices.ok ? invoices.data.find((row) => row.catalogOrder?.id === purchaseId) : undefined
    const workspace = workspaces.ok ? workspaces.data.find((row) => row.catalogOrder?.id === purchaseId) : undefined
    return {
        ok: true,
        data: {
            purchaseId,
            observedAt: new Date().toISOString(),
            order: !orders.ok
                ? {
                      state: "unavailable",
                      code: orders.code ?? null,
                  }
                : order === undefined
                  ? {
                        state: "missing",
                    }
                  : {
                        state: "observed",
                        status: order.status,
                        offerName: order.catalogItem?.name ?? null,
                        tierName: order.catalogTier?.name ?? null,
                    },
            payment: !invoices.ok
                ? {
                      state: "unavailable",
                      code: invoices.code ?? null,
                  }
                : invoice === undefined
                  ? {
                        state: "not-raised",
                    }
                  : {
                        state: "observed",
                        invoiceId: invoice.id,
                        status: invoice.status,
                        amountVnd: invoice.amountVnd,
                        paidAt: invoice.paidAt,
                    },
            provisioning: !workspaces.ok
                ? {
                      state: "unavailable",
                      code: workspaces.code ?? null,
                  }
                : workspace === undefined
                  ? {
                        state: "not-admitted",
                    }
                  : {
                        state: "observed",
                        workspaceId: workspace.id,
                        workspaceName: workspace.name,
                        workspaceStatus: workspace.status,
                    },
        },
    }
}
