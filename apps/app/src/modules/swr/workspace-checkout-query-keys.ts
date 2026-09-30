import type { WorkspacePurchaseEntryInput } from "@/modules/api/__generated__/core"
import type { NivoQueryKey } from "@/modules/swr/query-key-types"

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The entry key carries the
 * purchase and the workspace the read claims, so a read of one workspace never answers another's.
 */

/** Cache identity of one entry resolution: the purchase and the workspace the caller claims ready. */
export const workspaceCheckoutEntryQueryKey = (request: WorkspacePurchaseEntryInput): NivoQueryKey => [
    "workspace-checkout",
    "entry",
    request.purchaseId,
    request.workspaceId,
]

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The offer-identity key is a
 * function rather than a module constant so it stays out of the frozen-value shape the same rule checks.
 */

/** Cache identity of one offer selection: the exact offer identity and version the screen presents. */
export const workspaceCheckoutOffersQueryKey = (offerId: string, offerVersion: string): NivoQueryKey => [
    "workspace-checkout",
    "offers",
    offerId,
    offerVersion,
]

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The purchase-identity key is
 * exported so the two command hooks of this seam can refresh exactly the read they moved.
 */

/** Cache identity of one purchase's composed status read. */
export const workspaceCheckoutStatusQueryKey = (purchaseId: string): NivoQueryKey => [
    "workspace-checkout",
    "status",
    purchaseId,
]
