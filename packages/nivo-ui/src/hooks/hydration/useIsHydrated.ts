import { useSyncExternalStore } from "react"

const subscribeNever = (): (() => void) => () => undefined
const getClientHydration = (): boolean => true
const getServerHydration = (): boolean => false

/**
 * Reports whether React is reading the hydrated client snapshot.
 *
 * The value is false while rendering on the server and true when the client takes over, without
 * waiting for an effect or subscribing to a changing store.
 *
 * @returns Whether the client snapshot is active.
 */
export const useIsHydrated = (): boolean =>
    useSyncExternalStore(subscribeNever, getClientHydration, getServerHydration)
