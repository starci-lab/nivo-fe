import type {
    GroupChatPageLabels,
    GroupChatPageView,
    GroupChatPageActions,
} from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_FILTERS_CLASS_NAME,
    GROUP_CHAT_TASKS_COLUMN_CLASS_NAME,
    GROUP_CHAT_TASK_ROW_CLASS_NAME,
    GROUP_CHAT_TASK_STATEMENT_CLASS_NAME,
} from "./classNames"
import { Badge, Button, EmptyNotice, Select, SurfaceListCard, Text } from "@starci/grammar/common"
import type { CollabTaskStatus } from "../../../../modules/api/collab"
import type { CollabTasksFilter } from "../../../../hooks"
import { COLLAB_TASK_STATUSES, isCollabTaskStatus } from "../../../../modules/collab/group-chat/model.guards"
import {
    invalidTasksFilter,
    partitionParticipants,
    shortTaskRef,
    taskStatusTone,
} from "../../../../modules/collab/group-chat/model"

const ALL_FILTER_OPTION_ID = "__all__"

/** Props for the Tasks tab: roster-keyed filters and Office-bound rows. */
type TasksPanelProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
}

/** Render the roster-filtered Tasks list. */
export const TasksPanel = (props: TasksPanelProps) => {
    const { view, on, labels } = props
    const { humans, modules } = partitionParticipants(view.participants)
    const invalid = invalidTasksFilter(view.tasks.filter, view.participants)
    const selectFilter = (patch: Partial<CollabTasksFilter>) => on.changeTasksFilter({ ...view.tasks.filter, ...patch })
    const personOptions = [
        { id: ALL_FILTER_OPTION_ID, label: labels.tasks.filterAll },
        ...humans.map((human) => ({ id: human.memberId, label: human.displayName })),
    ]
    const moduleOptions = [
        { id: ALL_FILTER_OPTION_ID, label: labels.tasks.filterAll },
        ...modules.flatMap((module) =>
            module.moduleInstallationId === null
                ? []
                : [{ id: module.moduleInstallationId, label: module.displayName }],
        ),
    ]
    const statusOptions = [
        { id: ALL_FILTER_OPTION_ID, label: labels.tasks.filterAll },
        ...COLLAB_TASK_STATUSES.map((status) => ({
            id: status,
            label: labels.statuses[status],
        })),
    ]
    return (
        <div className={GROUP_CHAT_TASKS_COLUMN_CLASS_NAME}>
            <div className={GROUP_CHAT_FILTERS_CLASS_NAME}>
                <Select
                    name="filter-person"
                    label={labels.tasks.filterPerson}
                    options={personOptions}
                    value={view.tasks.filter.personMemberId ?? ALL_FILTER_OPTION_ID}
                    onValueChange={(personMemberId) =>
                        selectFilter({
                            personMemberId:
                                personMemberId === ALL_FILTER_OPTION_ID ? undefined : (personMemberId ?? undefined),
                        })
                    }
                />
                <Select
                    name="filter-module"
                    label={labels.tasks.filterModule}
                    options={moduleOptions}
                    value={view.tasks.filter.moduleInstallationId ?? ALL_FILTER_OPTION_ID}
                    onValueChange={(moduleInstallationId) =>
                        selectFilter({
                            moduleInstallationId:
                                moduleInstallationId === ALL_FILTER_OPTION_ID
                                    ? undefined
                                    : (moduleInstallationId ?? undefined),
                        })
                    }
                />
                <Select
                    name="filter-status"
                    label={labels.tasks.filterStatus}
                    options={statusOptions}
                    value={view.tasks.filter.status ?? ALL_FILTER_OPTION_ID}
                    onValueChange={(status) =>
                        selectFilter({
                            status:
                                status !== null && isCollabTaskStatus(status) ? status : undefined,
                        })
                    }
                />
            </div>
            <Text size="xs" tone="muted">
                {labels.tasks.filterHint}
            </Text>
            <SurfaceListCard
                label={labels.tasks.title}
                fact={view.tasks.state === "ready" ? labels.tasks.count(view.tasks.rows.length) : undefined}
            >
                {invalid !== null ? (
                    <EmptyNotice message={labels.tasks.invalidFilter} />
                ) : view.tasks.state === "loading" ? (
                    <Text size="sm" tone="muted" isSkeleton>
                        {labels.state.loading}
                    </Text>
                ) : view.tasks.state === "failed" ? (
                    <EmptyNotice
                        message={labels.tasks.failed}
                        actionLabel={labels.state.retry}
                        onAction={on.retryTasks}
                    />
                ) : view.tasks.state === "denied" ? (
                    <EmptyNotice message={labels.tasks.denied} />
                ) : view.tasks.rows.length === 0 ? (
                    <EmptyNotice message={labels.tasks.empty} />
                ) : (
                    view.tasks.rows.map((task) => (
                        <div
                            key={task.taskId}
                            className={GROUP_CHAT_TASK_ROW_CLASS_NAME}
                            id={`collab-task-${task.taskId}`}
                        >
                            <Text size="sm" weight="semibold">
                                {shortTaskRef(task.taskId)}
                            </Text>
                            <div className={GROUP_CHAT_TASK_STATEMENT_CLASS_NAME}>
                                <Text size="sm" overflow="truncate">
                                    {task.statement}
                                </Text>
                            </div>
                            <Badge tone={taskStatusTone(task.status)}>{labels.statuses[task.status]}</Badge>
                            <Text size="xs" tone="muted">
                                {labels.tasks.module(task.owningModuleDisplayName ?? task.owningModuleKey)}
                                {task.askedByDisplayName ? ` • ${labels.tasks.asker(task.askedByDisplayName)}` : ""}
                                {task.assignedToDisplayName
                                    ? ` • ${labels.tasks.assignee(task.assignedToDisplayName)}`
                                    : ""}
                            </Text>
                            <Button size="sm" variant="ghost" onPress={() => on.openTaskCard(task.taskId)}>
                                {labels.tasks.openInOffice}
                            </Button>
                        </div>
                    ))
                )}
            </SurfaceListCard>
        </div>
    )
}
