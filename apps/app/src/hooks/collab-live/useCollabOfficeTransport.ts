"use client";

import { useCallback } from "react";
import {
    reconcileCollabRequest,
    setCollabLocaleReader,
    type CollabReconcileCall,
    type CollabReconcileOutcome,
    type CollabResult,
} from "@/modules/api/collab";

/**
 * The Collab Office transport seam the connected page reads directly.
 *
 * It binds the reader's language for Collab refusal copy and exposes the
 * same-intent reconciliation read a resend consults before it sends anything
 * (`contract.collab.chat`: an intent that already committed is never resent).
 * Both stay behind `@/hooks` so a component never imports runtime values from
 * `@/modules/api/collab`.
 */
export type CollabOfficeTransport = {
    readonly reconcileRequest: (call: CollabReconcileCall) => Promise<CollabResult<CollabReconcileOutcome>>;
};

/**
 * Bind this page's language to the Collab transport and hand back the seam a resend
 * consults. Call it once per connected page; the returned read is the same
 * `reconcileRequest` the transport publishes, never a second implementation.
 */
export const useCollabOfficeTransport = (locale: string): CollabOfficeTransport => {
    const readLocale = useCallback(() => locale, [locale]);
    setCollabLocaleReader(readLocale);
    const reconcileRequest = useCallback(
        (call: CollabReconcileCall): Promise<CollabResult<CollabReconcileOutcome>> => reconcileCollabRequest(call),
        [],
    );
    return { reconcileRequest };
};
