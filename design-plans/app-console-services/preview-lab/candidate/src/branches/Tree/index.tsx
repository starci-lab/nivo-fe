import { Fragment } from "react"
import { contractNodeProps, contractSpec, type ContractKey } from "../../contracts"
import type { ContractComponent, LeafComponent } from "../../contracts/props"

/**
 * BRANCH - `Tree`, the candidate's copy: it draws ONE node of the LOCAL registry.
 *
 * TARGET PATH ON MATERIALIZATION: none. `packages/ui/src/branches/Tree/index.tsx` already is this
 * component, character for character below the import lines. It is copied here for the single reason
 * the local table exists at all: the shipped `Tree` constrains `contract` to `keyof` the shipped
 * table, so it cannot be handed `sidebar-then-body-app`, `console-body-main`,
 * `home-services-account-nav`, `titled-section-stack-page`, `body-with-refusal-note` or
 * `template-offer-row`. Apply deletes this file and the six keys move into the shipped table instead.
 *
 * The three imports are the whole diff: `../../contracts` and `../../contracts/props` resolve to the
 * candidate's table rather than to `@nivo/ui`'s. Both trees coexist at runtime without interfering -
 * `FleetRow` is imported from `apps/app` and goes on rendering through the SHIPPED `Tree` against the
 * shipped table, which is correct, because `identity-kind-status-action-row` is a shipped key.
 *
 * IT OWNS NO CLASS OF ITS OWN. Every class on the rendered node comes from the registry entry, so
 * there is no seam here for a caller or a maintainer to quietly adjust.
 *
 * INSPECTABILITY. The node carries `data-node` (which key drew it) and `data-why` (why the things
 * inside it sit that way). The reason travels into the DOM because the place a tree is wrong is the
 * place a reader is looking when they notice - which is what makes these screenshots auditable
 * against the entries rather than only against each other.
 */

/** Props for {@link Tree}. */
export interface TreeProps<K extends ContractKey> {
    /**
     * The registry key. This is the ONLY layout decision an author makes: it fixes the node's
     * classes and, through the key's own name, what belongs inside it.
     */
    contract: K
    /** Named content whose metadata and source body satisfy this exact contract. */
    render: ContractComponent<NoInfer<K>>
}

/** Props for rendering only a contract's validated content inside a branch-owned host. */
export interface ContractContentProps<K extends ContractKey> {
    /** The registry key whose declared slots are being drawn. */
    contract: K
    /** Named content satisfying that key. */
    render: ContractComponent<NoInfer<K>>
}

/**
 * Render validated slots without choosing or opening their host.
 *
 * @param input - {@link ContractContentProps}
 * @returns The slot contents, in the order the entry declares them.
 */
export const ContractContent = <const K extends ContractKey>({ contract, render }: ContractContentProps<K>) => {
    if (render.kind === "projection") return <>{render.project()}</>
    const spec = contractSpec(contract)
    const slots = render.slots
    return Object.keys(spec.children).flatMap((slot) => {
        const value = slots[slot as keyof typeof slots]
        const values: ReadonlyArray<unknown> = Array.isArray(value)
            ? value
            : value === undefined ? [] : [value]
        return values.map((component: unknown, index: number) => {
            const child = component as ContractComponent<ContractKey> | LeafComponent<string, Readonly<Record<never, never>>>
            if (child.meta.shape === "contract") {
                const contractChild = child as ContractComponent<ContractKey>
                // A projection is a branch that already drew the host for this contract. Opening
                // another Tree around it changes the DOM and therefore the layout.
                if (contractChild.kind === "projection") {
                    return <Fragment key={`${slot}-${index}`}>{contractChild.project()}</Fragment>
                }
                return <Tree key={`${slot}-${index}`} contract={contractChild.meta.contract} render={contractChild} />
            }
            const leaf = child as LeafComponent<string, Readonly<Record<never, never>>>
            return <Fragment key={`${slot}-${index}`}>{leaf()}</Fragment>
        })
    })
}

/**
 * Draw one registry node.
 *
 * @param input - {@link TreeProps}
 * @returns The node the entry describes, opening the element the entry names.
 */
export const Tree = <const K extends ContractKey>({ contract, render }: TreeProps<K>) => {
    const nodeProps = contractNodeProps(contract)
    /*
     * THE ENTRY NAMES THE ELEMENT, NOT THE CALLER. A `<main>` is the document's one main landmark and
     * a `<nav>` is a destination; both are MEANING, and meaning belongs beside the classes and the
     * children that the key already fixes. This is the line that makes `console-body-main` an actual
     * landmark in these screenshots rather than a div wearing a marker.
     */
    const Host = contractSpec(contract).host ?? "div"
    return (
        <Host
            data-component="Tree"
            {...nodeProps}
        >
            <ContractContent contract={contract} render={render} />
        </Host>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure" } as const
