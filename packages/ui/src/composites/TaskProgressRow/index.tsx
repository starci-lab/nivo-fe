import { Text } from "../../leaves/Text"
import { Icon } from "../../leaves/Icon"
import type { CompositeProps } from "../../contracts/props"
import { Tree } from "../../branches/Tree"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"

/** One read-only task row in a joined progress list. */
export type TaskProgressRowData = {
    readonly id: string
    readonly title?: string
    readonly fact?: string
    readonly isComplete?: boolean
}

/** Fixed leaf props for a task progress row. */
export type TaskProgressRowProps = CompositeProps<TaskProgressRowData>

/** Draw the fixed mark-title-fact row used by a SurfaceListCard task list. */
export const TaskProgressRow = ({ props, isLoading = false }: TaskProgressRowProps) => {
    const content = defineContractComponent("task-mark-title-fact-row", {
        mark: defineLeafComponent("icon", {}, () => <Icon props={{ name: props.isComplete === true ? "complete" : "pending", role: "leading" }} isLoading={isLoading} />),
        title: defineLeafComponent("text", {}, () => <Text props={{ content: props.title }} isLoading={isLoading} />),
        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.fact, size: "xs" }} isLoading={isLoading} />),
    })
    return <Tree contract="task-mark-title-fact-row" render={content} />
}

/** Source-level tier marker for the task row composition. */
export const meta = { shape: "composite", world: "pure" } as const
