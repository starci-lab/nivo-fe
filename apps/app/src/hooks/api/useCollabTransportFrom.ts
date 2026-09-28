"use client";

import { setCollabTransport, type CollabTransport } from "@/modules/api/collab";

/**
 * Bind the transport every Collab call travels on.
 *
 * The session root or a live channel owns which implementation answers, but only a component may
 * reach the hooks root - a `modules/` owner calls {@link setCollabTransport} directly instead.
 * This hook is how a component binds it, reached as `useCollabTransportFrom` from `@/hooks`.
 *
 * @param next - The transport in force from here on.
 */
export const useCollabTransportFrom = (next: CollabTransport) => {
    setCollabTransport(next);
};
