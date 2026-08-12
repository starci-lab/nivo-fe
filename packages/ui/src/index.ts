/**
 * THE PUBLIC SURFACE of the shared canon.
 *
 * ONE COPY, THREE APPS. In the previous repository each app carried its own `components/` tree, and
 * the cost was not duplication in the abstract: ten separate files independently redeclared
 * `ComponentType<SVGProps<SVGSVGElement>>`, so the glyph vendor had leaked into ten places and no
 * single edit could remove it. A tier that lives here cannot drift, because there is nowhere for it
 * to drift to.
 *
 * WHAT MAY LIVE HERE. Everything below a block: the contract registry, leaves, composites, branches
 * and shells. A block carries feature meaning and therefore belongs to the app that owns the
 * feature - putting one here would make the package know what a course, an invoice or a landing
 * hero is, and it must not.
 *
 * The registry itself is the exception worth naming: it is shared MACHINERY with per-product
 * ENTRIES, so the table starts small and grows one checked entry at a time.
 */

export {
    CONTRACTS,
    CONTRACT_KEYS,
    contractNodeProps,
    contractSpec,
} from "./contracts"
export type {
    AllowedClassName,
    ChildrenOf,
    ContractChildSpec,
    ContractKey,
    ContractPropValue,
    ContractSpec,
} from "./contracts"

export {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "./contracts/props"
export type {
    BlockProps,
    ComponentActions,
    ComponentData,
    CompositeComponent,
    CompositeProps,
    ContractBranchProps,
    ContractComponent,
    DataValue,
    LeafComponent,
    LeafProps,
} from "./contracts/props"

export { Icon } from "./leaves/Icon"
export type { IconData, IconName, IconProps, IconRole } from "./leaves/Icon"

export { ContractContent, Tree } from "./branches/Tree"
export type { TreeProps } from "./branches/Tree"
