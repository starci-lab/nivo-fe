import type { ComponentType, ReactNode } from "react"
import type { ChildrenOf, ContractKey, ContractPropValue } from "./"

/**
 * THE SLOT SHAPES, as types rather than as a convention.
 *
 * Every component below a block takes a FIXED set of named slots and no others. Written as a type
 * alias per tier, a fourth slot is not discouraged - it does not compile, because the alias is the
 * whole shape and there is nowhere to put one.
 *
 * This is the difference between a rule and a fence. `interface XProps { props: XData; isLoading?: boolean }`
 * is a rule: correct today, and one `extends` away from carrying a `className` next month.
 * `type XProps = LeafProps<XData>` is a fence.
 */

/**
 * What DATA is: anything a JSON document could hold.
 *
 * A function does not satisfy it, and that is the only thing stopping a component being smuggled
 * through `props` - which is why handlers travel in their own slot rather than beside the data.
 *
 * NOTE FOR AUTHORS: a leaf's or composite's data must be declared with `type`, not `interface`. TypeScript gives
 * an implicit index signature to a type alias and not to an interface, so an interface silently
 * fails this constraint. That is not a quirk to work around - it is the constraint doing its job.
 */
export type DataValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | ReadonlyArray<DataValue>
    | { readonly [key: string]: DataValue }

/** The shape any leaf's, composite's or branch's data must have: data all the way down. */
export type ComponentData = { readonly [key: string]: DataValue }

/** The shape any component's handlers must have: functions, kept apart from the data. */
export type ComponentActions = { readonly [key: string]: ((...args: Array<never>) => void) | undefined }

/**
 * A LEAF's props. Three slots, no fourth.
 *
 * `props` - what it draws. `on` - what it does. `isLoading` - handed down, never decided here.
 * No `children`: only a branch assembles. No `className`: a caller who can restyle a node has
 * become its second owner.
 */
export type LeafProps<D extends ComponentData, A extends ComponentActions = ComponentActions> = {
    readonly props: D
    readonly on?: A
    readonly isLoading?: boolean
}

/** Source identity carried by a leaf implementation, separate from its runtime data. */
export type LeafComponentMeta<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    readonly shape: "leaf"
    readonly name: N
    readonly props: P
}

/** A closed leaf render whose identity and contract-relevant literals survive import boundaries. */
export type LeafComponent<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    (): ReactNode
    readonly meta: LeafComponentMeta<N, P>
}

/** Close runtime data over one leaf while exposing only the literals the contract constrains. */
export const defineLeafComponent = <
    const N extends string,
    const P extends Readonly<Record<string, ContractPropValue>>,
>(
        name: N,
        props: P,
        render: () => ReactNode,
    ): LeafComponent<N, P> => Object.assign(render, {
        meta: { shape: "leaf", name, props } as const,
    })

/**
 * A COMPOSITE's props. The runtime lanes match a leaf, but the type is intentionally distinct:
 * a composite fixes an arrangement of independently meaningful leaves rather than one intrinsic
 * value or control. Closed does not mean freehand: its arrangement is still rendered through a
 * typed Tree contract, never through raw structural markup. If a caller may supply the content,
 * the component is a branch rather than a composite.
 */
export type CompositeProps<D extends ComponentData, A extends ComponentActions = ComponentActions> = {
    readonly props: D
    readonly on?: A
    readonly isLoading?: boolean
}

/** Source identity carried by a reusable fixed composition. */
export type CompositeComponentMeta<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    readonly shape: "composite"
    readonly name: N
    readonly props: P
}

/** A closed composite render whose identity survives import boundaries. */
export type CompositeComponent<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    (): ReactNode
    readonly meta: CompositeComponentMeta<N, P>
}

/** Close runtime data over one composite while exposing contract-relevant literals. */
export const defineCompositeComponent = <
    const N extends string,
    const P extends Readonly<Record<string, ContractPropValue>>,
>(
        name: N,
        props: P,
        render: () => ReactNode,
    ): CompositeComponent<N, P> => Object.assign(render, {
        meta: { shape: "composite", name, props } as const,
    })

/** Source identity carried by every contract value admitted by a contract branch. */
export type ContractComponentMeta<K extends ContractKey> = {
    readonly shape: "contract"
    readonly contract: K
}

/** A checked slot record. It carries content; it is deliberately not callable. */
export type ContractSlots<K extends ContractKey> = {
    readonly kind: "slots"
    readonly meta: ContractComponentMeta<K>
    readonly slots: ChildrenOf<K>
}

/** A branch-owned projection that has already drawn the host a contract cannot express. */
export type ContractProjection<K extends ContractKey> = {
    readonly kind: "projection"
    readonly meta: ContractComponentMeta<K>
    readonly project: ComponentType
}

/** A real component type whose runtime input remains separate from its contract identity. */
export type ContractRenderComponent<
    K extends ContractKey,
    P,
> = ComponentType<P> & {
    readonly kind: "component"
    readonly meta: ContractComponentMeta<K>
}

/** Checked bound content used by Tree and aggregate contract projections. */
export type BoundContractComponent<K extends ContractKey> = ContractSlots<K> | ContractProjection<K>

/**
 * One contract identity with either bound slots or a real component input.
 *
 * Omitting `P` selects the bound lane used by Tree. Supplying `P` selects the component-type lane
 * used by a host that passes runtime `props` without closing them into slot callbacks.
 */
export type ContractComponent<
    K extends ContractKey,
    P = undefined,
> = [P] extends [undefined]
    ? BoundContractComponent<K>
    : ContractRenderComponent<K, P>

/** The two supported builder calls: checked bound slots, or a real component type. */
type DefineContractComponent = {
    <const K extends ContractKey>(contract: K, slots: ChildrenOf<K>): ContractSlots<K>
    <
        const K extends ContractKey,
        P,
    >(
        contract: K,
        render: ComponentType<P>,
    ): ContractRenderComponent<K, P>
}

/**
 * Bind either checked named slots or one real component type to an exact contract identity.
 *
 * The component overload keeps runtime `props` outside the contract metadata. A host can therefore
 * pass changing data into a stable component type without rebuilding a forest of closed callbacks.
 */
export const defineContractComponent = ((contract: ContractKey, input: unknown) => {
    if (typeof input === "function") {
        return Object.assign(input, {
            kind: "component" as const,
            meta: { shape: "contract", contract } as const,
        })
    }
    return {
        kind: "slots" as const,
        meta: { shape: "contract", contract } as const,
        slots: input,
    }
}) as DefineContractComponent

/** Brand the complete node produced by a branch that owns wrappers a contract cannot express. */
export const defineContractProjection = <const K extends ContractKey>(
    contract: K,
    render: ComponentType,
): ContractProjection<K> => ({
        kind: "projection",
        meta: { shape: "contract", contract } as const,
        project: render,
    })

/** A branch that projects one typed contract component into its own wrapper mechanics. */
export type ContractBranchProps<K extends ContractKey> = {
    readonly contract: K
    readonly render: ContractComponent<NoInfer<K>>
    readonly isLoading?: boolean
}

/**
 * A BLOCK's presentational half. Two slots.
 *
 * `state` is the business situation and it picks a tree; `props` is what that tree says. There is
 * no `isLoading` here - a block writes the flag when it hands a tree down, and never receives one.
 * The type is a union per state at the call site, so the data of a situation a surface is NOT in
 * cannot be passed and the data of the one it IS in cannot be omitted.
 */
export type BlockProps<S extends string, D extends ComponentData> = {
    readonly state: S
    readonly props: D
}
