import type { ComponentType, ReactNode } from "react"
import type { ContractPropValue } from "@nivo/ui"
import type { ChildrenOf, ContractKey } from "./"

/**
 * THE SLOT SHAPES, bound to the CANDIDATE's table rather than to the shipped one.
 *
 * Every type and every builder below is the shipped `@nivo/ui/contracts/props` derivation, reproduced
 * for exactly one reason: each of them is generic over `ContractKey`, and the shipped `ContractKey`
 * is `keyof` the shipped table. Imported from there, `defineContractComponent("console-body-main", …)`
 * does not merely fail to check - it does not accept the key at all, because the key is not a member
 * of the union the parameter is constrained to.
 *
 * WHAT IS DELIBERATELY NOT COPIED: `BlockProps`. No block is written in this candidate - `FleetRow`
 * is imported from `apps/app` where it already lives - so a copy here would be a shape with no user.
 *
 * The fence these types are is unchanged. `props` is what a component draws, `on` is what it does,
 * `isLoading` is handed down and never decided locally; there is no `children` hole and no
 * `className`, because a caller who can restyle a node has become its second owner.
 */

/**
 * What DATA is: anything a JSON document could hold.
 *
 * A function does not satisfy it, which is the only thing stopping a component being smuggled through
 * `props` - handlers travel in their own slot rather than beside the data.
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

/** A LEAF's props. Three slots, no fourth. */
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

/**
 * Close runtime data over one leaf while exposing only the literals the contract constrains.
 *
 * @param name - The leaf identity the slot declares.
 * @param props - The contract-relevant literals this leaf is drawn with.
 * @param render - The closed render.
 * @returns The branded leaf.
 */
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

/** A COMPOSITE's props. The runtime lanes match a leaf; the type is intentionally distinct. */
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

/**
 * Close runtime data over one composite while exposing contract-relevant literals.
 *
 * @param name - The composite identity the slot declares.
 * @param props - The contract-relevant literals this composite is drawn with.
 * @param render - The closed render.
 * @returns The branded composite.
 */
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
    readonly project: () => ReactNode
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

/** One contract identity with either bound slots or a real component input. */
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

/** Bind either checked named slots or one real component type to an exact contract identity. */
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

/**
 * Brand the complete node produced by a branch that owns wrappers a contract cannot express.
 *
 * @param contract - The contract identity the drawn node satisfies.
 * @param render - The already-drawn node.
 * @returns The branded projection.
 */
export const defineContractProjection = <const K extends ContractKey>(
    contract: K,
    render: () => ReactNode,
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
