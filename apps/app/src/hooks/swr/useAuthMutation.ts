import useSWRMutation from "swr/mutation"

/** The press input shape shared by viewer-scoped and signed-out public mutations. */
export type MutationTrigger<TInput> = {
    readonly arg: TInput
}

/**
 * Own a signed-out public command in its separate cache namespace.
 *
 * Authentication commands run without a viewer key and do not invalidate viewer-scoped queries.
 * The viewer-scoped `useNivoMutation` wrapper owns the other policy and its invalidation behavior.
 */
export const useAuthMutation = <TAnswer, TInput>(key: string, mutation: (input: TInput) => Promise<TAnswer>) =>
    useSWRMutation(
        ["NIVO_AUTH_MUTATION", key] as const,
        (_key, { arg }: MutationTrigger<TInput>) => mutation(arg),
    )
