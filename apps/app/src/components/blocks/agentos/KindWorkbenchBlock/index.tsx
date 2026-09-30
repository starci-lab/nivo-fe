import { SurfaceCard } from "@starci/grammar/common"
import type { ComponentType } from "react"
import { KindWorkbenchContent } from "../KindWorkbenchContent"
import type { KindWorkbenchBlockProps, WorkbenchProps, WorkbenchRegistry } from "../../../../modules/agentos/kind-workbench"

export type {
    KindWorkbenchBlockCopy,
    KindWorkbenchBlockProps,
    WorkbenchProps,
    WorkbenchRegistry,
} from "../../../../modules/agentos/kind-workbench"

const registeredWorkbench =
    (mode: Parameters<typeof KindWorkbenchContent>[0]["mode"]): ComponentType<WorkbenchProps> =>
    (props) => <KindWorkbenchContent props={props} mode={mode} />

/** Built-in open registry aligned with backend workbench identities. */
export const DEFAULT_WORKBENCH_REGISTRY: WorkbenchRegistry = {
    "support-queue": registeredWorkbench("support-queue"),
    "accounting-sheet": registeredWorkbench("accounting-sheet"),
    "calendar-week": registeredWorkbench("calendar-week"),
    "document-reader": registeredWorkbench("document-reader"),
    "sales-pipeline": registeredWorkbench("sales-pipeline"),
    "conversation-inbox": registeredWorkbench("conversation-inbox"),
    "generic-workbench": registeredWorkbench("generic-workbench"),
}

const unavailableWorkbench = registeredWorkbench("unavailable")

/** Resolve one kind-owned ComponentType while Chat and the shared shell remain unchanged. */
export const KindWorkbenchBlock = (props: KindWorkbenchBlockProps) => {
    const { copy, moduleId, kindKey, workbenchKey, workbenchVersion, tasks, events, registry } = props
    const Workbench = registry[workbenchKey] ?? unavailableWorkbench
    return (
        <SurfaceCard label={copy.workbench.title} fact={`${workbenchKey}@${workbenchVersion}`}>
            <Workbench
                copy={copy}
                moduleId={moduleId}
                kindKey={kindKey}
                workbenchVersion={workbenchVersion}
                tasks={tasks}
                events={events}
            />
        </SurfaceCard>
    )
}
