import { Button } from "../../leaves/Button"
import { Tree } from "../../branches/Tree"
import type { CompositeProps } from "../../contracts/props"
import { defineLeafComponent, defineContractComponent } from "../../contracts/props"

/** One lifecycle action resolved by the owning domain block. */
export type OperationAction = { readonly id: string; readonly label: string; readonly disabled?: boolean; readonly pending?: boolean }
/** Stable rail identity and its ordered operations. */
export type OperationActionRailData = { readonly id: string; readonly actions: ReadonlyArray<OperationAction> }
/** Report which lifecycle action was selected. */
export type OperationActionRailActions = { readonly select?: (id: string) => void }
/** Closed data and action surface for a lifecycle action rail. */
export type OperationActionRailProps = CompositeProps<OperationActionRailData, OperationActionRailActions>

/** Keep lifecycle actions in one closed, wrapping rail. */
export const OperationActionRail = ({ props, on, isLoading = false }: OperationActionRailProps) => (
    <Tree
        contract="inline-action-run"
        render={defineContractComponent("inline-action-run", {
            action: props.actions.map((action) => defineLeafComponent("button", {}, () => (
                <Button
                    key={action.id}
                    props={{ label: action.label, disabled: action.disabled, isPending: action.pending }}
                    on={{ press: () => on?.select?.(action.id) }}
                    isLoading={isLoading}
                />
            ))),
        })}
    />
)

/** Source-level tier marker for the lifecycle action rail. */
export const meta = { shape: "composite", world: "pure" } as const
