"use client"

import useSWRMutation from "swr/mutation"
import { useSWRConfig } from "swr"
import { useSession } from "@/modules/auth/session"
import {
    nivoViewerQueryKeyFor,
    viewerCacheKeyFor,
    type NivoQueryKey,
} from "./use-nivo-query"

/** Product mutation identity before the signed-in viewer scope is attached. */
export type NivoMutationKey = readonly [name: string, ...parts: ReadonlyArray<string | number | boolean | null>]

/** Viewer-scoped mutation identity, never containing a bearer credential. */
export type NivoViewerMutationKey = readonly ["NIVO_MUTATION", viewerKey: string, ...mutationKey: NivoMutationKey]

type NivoMutationTrigger<TInput> = { readonly arg: TInput }

/** Query invalidation owned by a named command rather than repeated in its component consumers. */
export type NivoMutationOptions<TAnswer, TInput> = {
    readonly invalidates?: ReadonlyArray<NivoQueryKey> | ((input: TInput, answer: TAnswer) => ReadonlyArray<NivoQueryKey>)
    readonly shouldInvalidate?: (answer: TAnswer) => boolean
}

const invalidateQueries = async <TAnswer, TInput>(
    accessToken: string | null,
    input: TInput,
    answer: TAnswer,
    options: NivoMutationOptions<TAnswer, TInput> | undefined,
    mutateCache: ReturnType<typeof useSWRConfig>["mutate"],
): Promise<void> => {
    if (accessToken === null || options?.shouldInvalidate?.(answer) === false) return
    const invalidates = typeof options?.invalidates === "function"
        ? options.invalidates(input, answer)
        : options?.invalidates ?? []
    await Promise.all(invalidates.map((queryKey) => mutateCache(nivoViewerQueryKeyFor(accessToken, queryKey))))
}

/** Own one signed-in command and expose its press-local lifecycle without mixing it into query state. */
export const useNivoMutation = <TAnswer, TInput>(
    mutationKey: NivoMutationKey | null,
    mutation: (input: TInput) => Promise<TAnswer>,
    options?: NivoMutationOptions<TAnswer, TInput>,
) => {
    const session = useSession()
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null
    const { mutate: mutateCache } = useSWRConfig()
    const key: NivoViewerMutationKey | null = typeof accessToken === "string"
        && accessToken.length > 0
        && mutationKey !== null
        ? ["NIVO_MUTATION", viewerCacheKeyFor(accessToken), ...mutationKey]
        : null
    return useSWRMutation(
        key,
        async (_key: NivoViewerMutationKey, { arg }: NivoMutationTrigger<TInput>) => {
            const answer = await mutation(arg)
            await invalidateQueries(accessToken, arg, answer, options, mutateCache)
            return answer
        },
    )
}
