/** Common wrapper for a component's render data, actions, and loading state. */
export type ComponentProps<Data, Actions = never> = {
    readonly props: Data
    readonly on?: Actions
    readonly isLoading?: boolean
}