import type { ReactNode } from "react"
import { Text } from "@starci/grammar/common"
import { WorkbenchRailCard } from "./component"

/** Props and resolved copy for the shared scope, command notice, and optional rail cards. */
type WorkbenchRailProps = {
    readonly props: {
        readonly className: string
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
export const WorkbenchRail = ({ props }: WorkbenchRailProps) => (
    <div className={props.className}>
        <WorkbenchRailCard props={{ label: props.scopeLabel, children: props.scope }} />
        {props.beforeNotice}
        <WorkbenchRailCard
            props={{
                label: props.noticeLabel,
                children:
                    props.notice ?? (
                        <Text size="xs" tone="muted">
                            {props.noticeEmpty}
                        </Text>
                    ),
            }}
        />
        {props.afterNotice}
    </div>
)
