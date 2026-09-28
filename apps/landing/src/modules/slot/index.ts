/** Minimal local slot contract; replace with the published shape-slot seam when it lands. */
export type Slot<T> = { readonly isLoading?: boolean; readonly isForbidden?: boolean; readonly isError?: boolean; readonly items?: T }
/** Copy resolved for the shared slot status view. */
export type SlotLabels = { readonly empty: string; readonly forbidden: string; readonly error: string; readonly retry: string }
