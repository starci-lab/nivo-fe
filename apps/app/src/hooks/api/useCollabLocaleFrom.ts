"use client";

import { setCollabLocaleReader, type CollabLocaleReader } from "@/modules/api/collab";

/**
 * Point the Collab transport at the reader that answers with the reader's language.
 *
 * Every refusal the gateway sends is meant to come back localised, so the transport has to be told
 * which language to ask in - and only the routing-aware component knows the active locale. This
 * hook is how a component binds it, reached as `useCollabLocaleFrom` from `@/hooks`; a `modules/`
 * owner calls {@link setCollabLocaleReader} directly, because a module may not reach the hooks
 * root.
 *
 * @param reader - Answers with the active locale.
 */
export const useCollabLocaleFrom = (reader: CollabLocaleReader) => {
    setCollabLocaleReader(reader);
};
