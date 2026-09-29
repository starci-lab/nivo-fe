/** Utility classes for the exploration card grids and their responsive columns. */
export const CLASS_NAMES = {
    three: "grid grid-cols-3 gap-4 max-lg:grid-cols-2 [@media(max-width:48rem)]:grid-cols-1",
    two: "grid grid-cols-2 gap-4 [@media(max-width:48rem)]:grid-cols-1",
} as const
