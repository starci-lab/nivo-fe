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
    ChildrenOf,
    ContractChildSpec,
    ContractKey,
    ContractPropValue,
    ContractSpec,
    LayoutClassName,
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

/*
 * The tiers, named one at a time.
 *
 * `export *` is not used and must not be: every tier file also exports a `meta` marker, so a star
 * re-export would collide on the first two tiers and then silently shadow as more arrive. Naming
 * each symbol also keeps this file an honest inventory of what the package actually offers.
 *
 * This list grows as screens need it rather than all at once - an export nobody imports is a
 * promise the package has not been asked to keep.
 */

export { Avatar } from "./leaves/Avatar"
export type { AvatarData, AvatarProps } from "./leaves/Avatar"
export { ActionLink } from "./leaves/ActionLink"
export type { ActionLinkActions, ActionLinkData, ActionLinkProps } from "./leaves/ActionLink"
export { Badge } from "./leaves/Badge"
export type { BadgeData, BadgeProps, BadgeTone } from "./leaves/Badge"
export { Button } from "./leaves/Button"
export type { ButtonActions, ButtonData, ButtonProps } from "./leaves/Button"
export { Breadcrumbs } from "./leaves/Breadcrumbs"
export type { BreadcrumbsActions, BreadcrumbsData, BreadcrumbsProps, BreadcrumbStep } from "./leaves/Breadcrumbs"
export { Checkbox } from "./leaves/Checkbox"
export { ChoiceTabs } from "./leaves/ChoiceTabs"
export type { ChoiceTabData, ChoiceTabsActions, ChoiceTabsData, ChoiceTabsProps } from "./leaves/ChoiceTabs"
export { Divider } from "./leaves/Divider"
export type { DividerData, DividerProps } from "./leaves/Divider"
export { Heading } from "./leaves/Heading"
export type { HeadingData, HeadingProps } from "./leaves/Heading"
export { Icon } from "./leaves/Icon"
export type { IconData, IconName, IconProps, IconRole } from "./leaves/Icon"
export { MicrochipArtwork } from "./leaves/MicrochipArtwork"
export type { MicrochipArtworkData, MicrochipArtworkProps, MicrochipArtworkTone } from "./leaves/MicrochipArtwork"
export { Input } from "./leaves/Input"
export type { InputData, InputKind, InputProps } from "./leaves/Input"
export { Label } from "./leaves/Label"
export { Text } from "./leaves/Text"
export type { TextData, TextProps } from "./leaves/Text"
export { TextLink } from "./leaves/TextLink"
export type { TextLinkData, TextLinkProps } from "./leaves/TextLink"
export { ThemeSwitch } from "./leaves/ThemeSwitch"
export type { ThemeSwitchActions, ThemeSwitchData, ThemeSwitchProps } from "./leaves/ThemeSwitch"
export { SelectionList } from "./leaves/SelectionList"
export type { SelectionListActions, SelectionListData, SelectionListGroup, SelectionListItem, SelectionListProps } from "./leaves/SelectionList"

export { Field } from "./composites/Field"
export type { FieldActions, FieldData, FieldKind, FieldProps } from "./composites/Field"
export { LifecycleStep } from "./composites/LifecycleStep"
export type { LifecycleStepData, LifecycleStepProps, LifecycleStepState } from "./composites/LifecycleStep"
export { LabelledProgressRow } from "./composites/LabelledProgressRow"
export type { LabelledProgressRowData, LabelledProgressRowProps } from "./composites/LabelledProgressRow"
export { RequestSummary } from "./composites/RequestSummary"
export type { RequestSummaryActions, RequestSummaryData, RequestSummaryProps } from "./composites/RequestSummary"
export { StatusActionCard } from "./composites/StatusActionCard"
export type { StatusActionCardActions, StatusActionCardData, StatusActionCardProps } from "./composites/StatusActionCard"
export { HelmComponentStatusTable } from "./composites/HelmComponentStatusTable"
export type { HelmComponentStatusRow, HelmComponentStatusTableData, HelmComponentStatusTableProps } from "./composites/HelmComponentStatusTable"
export { OperationActionRail } from "./composites/OperationActionRail"
export type { OperationAction, OperationActionRailActions, OperationActionRailData, OperationActionRailProps } from "./composites/OperationActionRail"

export { ContractContent, Tree } from "./branches/Tree"
export type { TreeProps } from "./branches/Tree"
export { SurfaceCard } from "./branches/SurfaceCard"
export { SurfaceFormCard } from "./branches/SurfaceFormCard"
export type { SurfaceFormCardProps } from "./branches/SurfaceFormCard"
export { SurfaceListCard } from "./branches/SurfaceListCard"
export type { SurfaceListCardActions, SurfaceListCardData, SurfaceListCardProps } from "./branches/SurfaceListCard"
export { HighlightCard } from "./branches/HighlightCard"
export type { HighlightCardProps } from "./branches/HighlightCard"
export { DrawerBranch } from "./branches/DrawerBranch"
export type { DrawerBranchProps } from "./branches/DrawerBranch"
export { DropdownBranch } from "./branches/DropdownBranch"
export type {
    DropdownBranchActions,
    DropdownBranchData,
    DropdownBranchItemData,
    DropdownBranchPlacement,
    DropdownBranchProps,
    DropdownBranchSectionData,
} from "./branches/DropdownBranch"
export { ModalBranch } from "./branches/ModalBranch"
export type { ModalBranchProps } from "./branches/ModalBranch"
export { CollapsibleRail } from "./branches/CollapsibleRail"
export type { CollapsibleRailProps } from "./branches/CollapsibleRail"
export { ScrollViewport } from "./branches/ScrollViewport"
export type { ScrollViewportProps } from "./branches/ScrollViewport"
export { StarCiDashboardThemeBoundary } from "./branches/StarCiDashboardThemeBoundary"
export type { StarCiDashboardThemeBoundaryProps } from "./branches/StarCiDashboardThemeBoundary"
