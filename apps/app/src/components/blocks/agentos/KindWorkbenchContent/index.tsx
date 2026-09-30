import { Heading, Text } from "@starci/grammar/common"
import { AccountingWorkbenchBlock } from "../AccountingWorkbenchBlock"
import { SalesWorkbenchBlock } from "../SalesWorkbenchBlock"
import { activeTasks, nextTask, type WorkbenchProps } from "../../../../modules/agentos/kind-workbench"
import { KIND_WORKBENCH_CONTENT_CLASS_NAME } from "./classNames"

/** Props for {@link KindWorkbenchContent}. */
export type KindWorkbenchContentProps = {
    readonly props: WorkbenchProps
    readonly mode:
        | "support-queue"
        | "accounting-sheet"
        | "calendar-week"
        | "document-reader"
        | "sales-pipeline"
        | "conversation-inbox"
        | "generic-workbench"
        | "unavailable"
}

type WorkbenchFact = { readonly id: string; readonly label: string; readonly value: string }
type WorkbenchContentViewProps = {
    readonly title: string
    readonly caption: string
    readonly facts: ReadonlyArray<WorkbenchFact>
    readonly notice?: string
}

const WorkbenchContentView = ({ title, caption, facts, notice }: WorkbenchContentViewProps) => (
    <div className={KIND_WORKBENCH_CONTENT_CLASS_NAME}>
        <div>
            <Heading level={3}>{title}</Heading>
            <Text size="xs" tone="muted">
                {caption}
            </Text>
        </div>
        <div>
            {facts.map((fact) => (
                <div key={fact.id}>
                    <Text size="sm">{fact.label}</Text>
                    <Text size="sm" weight="semibold">
                        {fact.value}
                    </Text>
                </div>
            ))}
        </div>
        {notice === undefined ? undefined : (
            <Text size="sm" tone="muted">
                {notice}
            </Text>
        )}
    </div>
)

/** Draw one registered AgentOS workbench without request or shell ownership. */
export const KindWorkbenchContent = (props: KindWorkbenchContentProps) => {
    const { props: workbench, mode }: KindWorkbenchContentProps = props
    const { copy } = workbench
    if (mode === "sales-pipeline") return <SalesWorkbenchBlock moduleId={workbench.moduleId} />
    if (mode === "accounting-sheet")
        return (
            <AccountingWorkbenchBlock
                moduleId={workbench.moduleId}
                kindKey={workbench.kindKey}
                workbenchVersion={workbench.workbenchVersion}
            />
        )
    if (mode === "conversation-inbox")
        return (
            <WorkbenchContentView
                title={copy.workbench.inbox}
                caption={copy.workbench.registered({ kind: workbench.kindKey, version: workbench.workbenchVersion })}
                facts={[
                    { id: "open", label: copy.workbench.open, value: "8" },
                    { id: "waiting", label: copy.workbench.waiting, value: "3" },
                    { id: "module", label: copy.workbench.module, value: workbench.moduleId },
                ]}
            />
        )
    if (mode === "support-queue")
        return (
            <WorkbenchContentView
                title={copy.workbench.support}
                caption={copy.workbench.slaCaption({ kind: workbench.kindKey, version: workbench.workbenchVersion })}
                facts={[
                    { id: "open", label: copy.workbench.open, value: String(activeTasks(workbench).length) },
                    {
                        id: "risk",
                        label: copy.workbench.highUrgent,
                        value: String(
                            activeTasks(workbench).filter(
                                (task) => task.priority === "high" || task.priority === "urgent",
                            ).length,
                        ),
                    },
                    {
                        id: "next",
                        label: copy.workbench.next,
                        value: nextTask(workbench)?.title ?? copy.workbench.clear,
                    },
                    {
                        id: "source",
                        label: copy.workbench.channel,
                        value: workbench.events?.[0]?.source ?? copy.workbench.waitChannel,
                    },
                ]}
                notice={copy.workbench.supportNotice}
            />
        )
    if (mode === "calendar-week")
        return (
            <WorkbenchContentView
                title={copy.workbench.calendar}
                caption={copy.workbench.scheduleCaption({
                    kind: workbench.kindKey,
                    version: workbench.workbenchVersion,
                })}
                facts={[
                    { id: "proposals", label: copy.workbench.proposals, value: String(activeTasks(workbench).length) },
                    {
                        id: "next",
                        label: copy.workbench.confirmation,
                        value: nextTask(workbench)?.title ?? copy.workbench.noMeeting,
                    },
                    {
                        id: "due",
                        label: copy.workbench.due,
                        value:
                            nextTask(workbench)?.dueAt === null || nextTask(workbench) === undefined
                                ? copy.workbench.notScheduled
                                : new Date(nextTask(workbench)?.dueAt ?? "").toLocaleString(),
                    },
                    { id: "state", label: copy.workbench.calendarMutation, value: copy.workbench.blocked },
                ]}
                notice={copy.workbench.calendarNotice}
            />
        )
    if (mode === "document-reader")
        return (
            <WorkbenchContentView
                title={copy.workbench.reader}
                caption={copy.workbench.knowledgeCaption({
                    kind: workbench.kindKey,
                    version: workbench.workbenchVersion,
                })}
                facts={[
                    {
                        id: "answers",
                        label: copy.workbench.evidenceTasks,
                        value: String(activeTasks(workbench).length),
                    },
                    {
                        id: "next",
                        label: copy.workbench.groundedAnswer,
                        value: nextTask(workbench)?.title ?? copy.workbench.noAnswer,
                    },
                    {
                        id: "events",
                        label: copy.workbench.acceptedEvents,
                        value: String(workbench.events?.length ?? 0),
                    },
                    { id: "policy", label: copy.workbench.policy, value: copy.workbench.citations },
                ]}
                notice={copy.workbench.readerNotice}
            />
        )
    if (mode === "generic-workbench")
        return (
            <WorkbenchContentView
                title={copy.workbench.generic}
                caption={copy.workbench.genericCaption({ version: workbench.workbenchVersion })}
                facts={[
                    { id: "kind", label: copy.workbench.kind, value: workbench.kindKey },
                    { id: "module", label: copy.workbench.module, value: workbench.moduleId },
                ]}
                notice={copy.workbench.genericNotice}
            />
        )
    return (
        <WorkbenchContentView
            title={copy.workbench.unavailable}
            caption={`${workbench.kindKey}@${workbench.workbenchVersion}`}
            facts={[{ id: "module", label: copy.workbench.module, value: workbench.moduleId }]}
            notice={copy.workbench.unavailableNotice}
        />
    )
}
