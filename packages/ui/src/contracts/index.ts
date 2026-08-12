import type {
    CompositeComponent,
    ContractComponent,
    LeafComponent,
} from "./props"

/**
 * THE REGISTRY — nivo expert academy.
 *
 * One entry describes ONE node: the classes it wears, and why the things inside it sit that way.
 * Nothing else. What goes inside is the assembling branch's business.
 *
 * THIS TABLE IS NIVO'S OWN. The machinery below is shared with every app built to this canon, but
 * the entries are not: a registry copied from another product describes that product's nodes, and
 * every key in it is a promise about markup this app does not render. It starts small on purpose
 * and grows one entry at a time, each with a `why` a reader can check against the screen.
 *
 * A KEY'S NAME MUST FIX ITS CHILDREN. `card` is not a name here - it says nothing about what goes
 * inside, so anything can, and the entry stops constraining anything. `thumb-with-title-and-status`
 * says what it holds, so a wrong child is visible on sight. It is also what keeps `why` honest: a
 * key drawing twenty regions cannot say why any one of them is there.
 */

/**
 * The closed set of classes a node may lay its children out with.
 *
 * Closed on purpose. An open string is a door: the first arbitrary value that goes through it is
 * never the last, and the design system stops being able to say what it is.
 */
export type AllowedClassName =
    | "flex"
    | "flex-row"
    | "flex-col"
    | "items-center"
    | "items-start"
    | "justify-between"
    | "gap-1"
    | "gap-2"
    | "gap-3"
    | "gap-4"
    | "min-w-0"
    | "grow"
    | "shrink-0"
    | "w-full"
    | "text-right"
    | "flex-wrap"
    | "gap-0"
    | "truncate"
    | "overflow-hidden"

/** Literal values a contract may require from a child component's data props. */
export type ContractPropValue = string | number | boolean | null

/** A child appears once unless it explicitly declares a repeated run and its resting count. */
export type ContractChildCardinality =
    | { readonly repeats?: false, readonly restingCount?: never }
    | { readonly repeats: true, readonly restingCount: number }

/**
 * One named child slot: a leaf, a fixed composite, or another closed contract identity.
 *
 * `props` here are CONSTRAINTS, not runtime injection. Naming `size: "sm"` says every child in this
 * slot draws at that size; it does not hand the child a value at render time.
 */
export type ContractChildSpec = ContractChildCardinality & (
    | { readonly leaf: string, readonly props?: Readonly<Record<string, ContractPropValue>>, readonly composite?: never, readonly contract?: never }
    | { readonly composite: string, readonly props?: Readonly<Record<string, ContractPropValue>>, readonly leaf?: never, readonly contract?: never }
    | { readonly contract: string, readonly leaf?: never, readonly composite?: never, readonly props?: never }
)

/** One registry entry: a node's own classes, and why what it holds sits that way. */
export interface ContractSpec {
    /** The class string of the node itself. Not a prop, not reachable by a caller. */
    readonly classes: ReadonlyArray<AllowedClassName>
    /** The named slots this node admits, and nothing else. */
    readonly children: Readonly<Record<string, ContractChildSpec>>
    /** Why the things inside sit that way. A reader must be able to check it against the screen. */
    readonly why: string
}

/**
 * Every node this app draws through a contract.
 *
 * Seeded with the one shape the catalogue and the classroom both lean on. Grow it entry by entry;
 * an entry with no `why` a reader can check is an entry that has stopped doing its job.
 */
export const CONTRACTS = {
    "thumb-with-title-and-status": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full"],
        children: {
            thumb: { leaf: "thumbnail" },
            title: { composite: "titled-text" },
            status: { leaf: "badge" },
        },
        why: "The thumbnail identifies the row faster than its name does, so it leads. The title "
            + "takes the slack because a long one must clip rather than push the status off the "
            + "end, and the status trails where the eye lands last - it is the thing a reader "
            + "checks, not the thing they scan for.",
    },
    "name-over-handle": {
        classes: ["flex", "flex-col", "gap-0", "min-w-0"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "medium" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The handle repeats the name in the account's own words, so it sits directly beneath rather than beside - two lines of one identity, not two facts.",
    },
} as const satisfies Readonly<Record<string, ContractSpec>>

/** Every key in the registry. A key not in this union is a compile error at the call site. */
export type ContractKey = keyof typeof CONTRACTS

/** Slot names whose contract entry declares a repeated run. */
type RepeatedSlotNames<K extends ContractKey> = {
    [S in keyof (typeof CONTRACTS)[K]["children"]]:
    (typeof CONTRACTS)[K]["children"][S] extends { readonly repeats: true } ? S : never
}[keyof (typeof CONTRACTS)[K]["children"]]

/** Slot names a caller must fill. */
type RequiredChildNames<K extends ContractKey> = keyof (typeof CONTRACTS)[K]["children"]

/** What one slot admits, derived from how the entry declared it. */
type ChildValue<Spec> =
    Spec extends { readonly leaf: infer N extends string, readonly props?: infer P }
        ? LeafComponent<N, P extends Readonly<Record<string, ContractPropValue>> ? P : Record<string, never>>
        : Spec extends { readonly composite: infer N extends string, readonly props?: infer P }
            ? CompositeComponent<N, P extends Readonly<Record<string, ContractPropValue>> ? P : Record<string, never>>
            : Spec extends { readonly contract: infer C extends ContractKey }
                ? ContractComponent<C>
                : never

/**
 * The exact named render record admitted by one contract key.
 *
 * A repeated slot takes a list; every other slot takes one value. Naming a slot the entry does not
 * declare does not compile, which is the whole point of the record being derived rather than typed
 * by hand.
 */
export type ChildrenOf<K extends ContractKey> = {
    readonly [S in RequiredChildNames<K>]:
    S extends RepeatedSlotNames<K>
        ? ReadonlyArray<ChildValue<(typeof CONTRACTS)[K]["children"][S]>>
        : ChildValue<(typeof CONTRACTS)[K]["children"][S]>
}

/** One registry entry, by key. */
export const contractSpec = (name: ContractKey): ContractSpec => CONTRACTS[name]

/**
 * The props a branch places on the real layout node for one contract.
 *
 * `data-why` travels into the DOM on purpose: the place a tree is wrong is the place a reader is
 * looking when they notice it.
 */
export const contractNodeProps = (name: ContractKey) => {
    const spec = contractSpec(name)
    return {
        "data-tier": "branch",
        "data-node": name,
        "data-why": spec.why,
        className: spec.classes.join(" "),
    }
}

/** Every registry key, in declaration order, so gates and tests can walk the vocabulary. */
export const CONTRACT_KEYS: ReadonlyArray<ContractKey> = Object.keys(CONTRACTS) as Array<ContractKey>
