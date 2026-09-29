"use client"

import { setLocaleReader, type LocaleReader } from "@/modules/api/graphql"

/**
 * Point the GraphQL transport at the reader that answers with the reader's language.
 *
 * Every refusal sentence the API sends is localised, so the transport has to be told which language
 * to ask in - and only the routing-aware component knows the active locale. This hook is how a
 * component binds it, reached as `useLocaleFrom` from `@/hooks`; a `modules/` owner calls
 * {@link setLocaleReader} directly, because a module may not reach the hooks root.
 *
 * @param reader - Answers with the active locale.
 */
export const useLocaleFrom = (reader: LocaleReader) => {
    setLocaleReader(reader)
}
