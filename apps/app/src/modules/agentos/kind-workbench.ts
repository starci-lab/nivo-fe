import type { ComponentType } from "react"
import type { AgentosRuntimeOperationEvent, AgentosRuntimeTask } from "../api/agentos-module-runtime"

type RuntimeWorkbenchGenericCaptionValues = { readonly version: string }
type RuntimeWorkbenchKnowledgeCaptionValues = { readonly kind: string; readonly version: string }
type RuntimeWorkbenchPayableCaptionValues = { readonly kind: string; readonly version: string }
type RuntimeWorkbenchRegisteredValues = { readonly kind: string; readonly version: string }
type RuntimeWorkbenchScheduleCaptionValues = { readonly kind: string; readonly version: string }
type RuntimeWorkbenchSlaCaptionValues = { readonly kind: string; readonly version: string }

/** Settled display labels and typed formatters supplied by the page owner. */
export type KindWorkbenchBlockCopy = {
    readonly workbench: {
        readonly acceptedEvents: string
        readonly accounting: string
        readonly accountingNotice: string
        readonly blocked: string
        readonly calendar: string
        readonly calendarMutation: string
        readonly calendarNotice: string
        readonly channel: string
        readonly citations: string
        readonly clear: string
        readonly confirmation: string
        readonly due: string
        readonly evidencePack: string
        readonly evidenceTasks: string
        readonly execution: string
        readonly generic: string
        readonly genericCaption: (values: RuntimeWorkbenchGenericCaptionValues) => string
        readonly genericNotice: string
        readonly groundedAnswer: string
        readonly highUrgent: string
        readonly inbox: string
        readonly kind: string
        readonly knowledgeCaption: (values: RuntimeWorkbenchKnowledgeCaptionValues) => string
        readonly module: string
        readonly needsReview: string
        readonly next: string
        readonly noAnswer: string
        readonly noApprovals: string
        readonly noMeeting: string
        readonly notScheduled: string
        readonly open: string
        readonly ownerReview: string
        readonly payableCaption: (values: RuntimeWorkbenchPayableCaptionValues) => string
        readonly policy: string
        readonly proposals: string
        readonly qualified: string
        readonly reader: string
        readonly readerNotice: string
        readonly registered: (values: RuntimeWorkbenchRegisteredValues) => string
        readonly reviewOnly: string
        readonly sales: string
        readonly scheduleCaption: (values: RuntimeWorkbenchScheduleCaptionValues) => string
        readonly slaCaption: (values: RuntimeWorkbenchSlaCaptionValues) => string
        readonly support: string
        readonly supportNotice: string
        readonly title: string
        readonly unavailable: string
        readonly unavailableNotice: string
        readonly waitChannel: string
        readonly waiting: string
    }
}

/** Runtime data every open-registry workbench receives from the shared shell. */
export type WorkbenchProps = {
    readonly copy: KindWorkbenchBlockCopy
    readonly moduleId: string
    readonly kindKey: string
    readonly workbenchVersion: string
    readonly tasks?: ReadonlyArray<AgentosRuntimeTask>
    readonly events?: ReadonlyArray<AgentosRuntimeOperationEvent>
}

/** Extensible workbench table; adding a key does not edit the Module Studio shell. */
export type WorkbenchRegistry = Readonly<Record<string, ComponentType<WorkbenchProps>>>

/** Exact registry lookup input for one kind-owned companion surface. */
export type KindWorkbenchBlockProps = WorkbenchProps & {
    readonly workbenchKey: string
    readonly registry: WorkbenchRegistry
}

/** Active work items are the task states the workbench may currently act on. */
export const activeTasks = (props: WorkbenchProps): ReadonlyArray<AgentosRuntimeTask> =>
    props.tasks?.filter((task) => task.status === "open" || task.status === "in_progress") ?? []

/** The first active task in the owner's established order. */
export const nextTask = (props: WorkbenchProps): AgentosRuntimeTask | undefined => activeTasks(props)[0]
