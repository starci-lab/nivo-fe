/** The data status of one API. Each status is explicit so a slot can cross into a pure view. */
export type Slot<T> = {
    readonly isLoading?: boolean
    readonly isForbidden?: boolean
    readonly isError?: boolean
    readonly items?: T
}

/** The part of a query result a slot is derived from. */
export type SlotSource<T> = {
    readonly data?: T
    readonly isLoading: boolean
    readonly error?: { readonly status?: number }
}

/** Folds a query result into a slot, keeping forbidden status separate from other errors. */
export const toSlot = <T,>(source: SlotSource<T>): Slot<T> => ({
    isLoading: source.isLoading,
    isForbidden: source.error?.status === 403,
    isError: source.error !== undefined && source.error.status !== 403,
    items: source.data,
})

/** Resolved copy of the data-status recipe for one slot. */
export type SlotLabels = {
    readonly empty: string
    readonly forbidden: string
    readonly error: string
    readonly retry: string
}
