import type { ReactNode } from "react"
import { Text } from "@starci/grammar/common"
import { WORKBENCH_RAIL_CLASS_NAME } from "./classNames"
import { WorkbenchRailCard } from "./component"

export type { WorkbenchSharedCopy } from "./component"

/** Props and resolved copy for the shared scope, command notice, and optional rail cards. */
type WorkbenchRailProps = {
    readonly props: {
        readonly scopeLabel: string
        readonly scope: ReactNode
        readonly beforeNotice?: ReactNode
        readonly noticeLabel: string
        readonly noticeEmpty: string
        readonly notice: ReactNode | null
        readonly afterNotice?: ReactNode
    }
}

/** Draw the common workbench rail frame while keeping each workbench's own cards in place. */
export const WorkbenchRail = (props: WorkbenchRailProps) => (
    <div className={WORKBENCH_RAIL_CLASS_NAME}>
        <WorkbenchRailCard props={{ label: props.props.scopeLabel, children: props.props.scope }} />
        {props.props.beforeNotice}
        <WorkbenchRailCard
            props={{
                label: props.props.noticeLabel,
                children:
                    props.props.notice ?? (
                        <Text size="xs" tone="muted">
                            {props.props.noticeEmpty}
                        </Text>
                    ),
            }}
        />
        {props.props.afterNotice}
    </div>
)
