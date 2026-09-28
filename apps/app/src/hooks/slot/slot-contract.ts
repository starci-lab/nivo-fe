/*
 * Interim local port of the `modules/slot` seam contract (cut fe-canon, stub-first).
 *
 * The canonical owner `apps/app/src/modules/slot` belongs to sibling ordinal 3, which has not
 * landed yet; when it does, every import of this file is repointed to `@/modules/slot` and this
 * file is deleted. The exported surface is kept byte-compatible with the reference
 * (`examples/shape-slot` src/modules/slot/index.ts) so the replacement is a pure specifier swap.
 */

/**
 * The data status of ONE api. Every field is an atom, so a slot may cross into a pure Base.
 * A block with three apis carries three slots, and each renders its own status independently.
 */
export type Slot<T> = {
    readonly isLoading?: boolean;
    readonly isForbidden?: boolean;
    readonly isError?: boolean;
    readonly items?: T;
};

/** The part of a query result a slot is derived from. */
export type SlotSource<T> = {
    readonly data?: T;
    readonly isLoading: boolean;
    readonly error?: { readonly status?: number };
};

/** Folds a query result into a slot; 403 is its own status, never a generic error. */
export const toSlot = <T,>(source: SlotSource<T>): Slot<T> => ({
    isLoading: source.isLoading,
    isForbidden: source.error?.status === 403,
    isError: source.error !== undefined && source.error.status !== 403,
    items: source.data,
});

/** Resolved copy of the data-status recipe for one slot. */
export type SlotLabels = {
    readonly empty: string;
    readonly forbidden: string;
    readonly error: string;
    readonly retry: string;
};
