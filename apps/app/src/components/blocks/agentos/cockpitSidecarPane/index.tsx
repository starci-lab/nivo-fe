import type { ComponentType } from "react"

/** Keep evidence content in the shared cockpit sidecar flow. */
export const cockpitSidecarPane = <P extends object>(wideOnly: boolean, Content: ComponentType<P>, contentProps: P) =>
    wideOnly ? (
        <div>
            <Content {...contentProps} />
        </div>
    ) : (
        <div>
            <Content {...contentProps} />
        </div>
    )
