import type { ComponentType } from "react"

/** Keep a compact cockpit region in the shared page flow. */
export const cockpitPane = <P extends object>(wideOnly: boolean, Content: ComponentType<P>, contentProps: P) =>
    wideOnly ? (
        <div>
            <Content {...contentProps} />
        </div>
    ) : (
        <div>
            <Content {...contentProps} />
        </div>
    )
