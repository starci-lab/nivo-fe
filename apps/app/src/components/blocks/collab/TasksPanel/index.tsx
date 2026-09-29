import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_NATIVE_FIELD_CLASS_NAME,
    GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME,
    GROUP_CHAT_FILTERS_CLASS_NAME,
    GROUP_CHAT_TASKS_COLUMN_CLASS_NAME,
    GROUP_CHAT_TASK_ROW_CLASS_NAME,
    GROUP_CHAT_TASK_STATEMENT_CLASS_NAME,
} from "./classNames"
import { EmptyNotice, Text } from "@starci/grammar/common"
import { Badge, Button, SurfaceListCard } from "@starci/grammar/common"
import type { CollabTaskStatus } from "../../../../modules/api/collab"
import type { CollabTasksFilter } from "../../../../hooks"
import {
    invalidTasksFilter,
    partitionParticipants,
    shortTaskRef,
    taskStatusTone,
} from "../../../../modules/collab/group-chat/model"

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
    return (
        <div className={GROUP_CHAT_TASKS_COLUMN_CLASS_NAME}>
            <div className={GROUP_CHAT_FILTERS_CLASS_NAME}>
                <label className={GROUP_CHAT_NATIVE_FIELD_CLASS_NAME} htmlFor="collab-filter-person">
                    <Text size="sm" weight="semibold">
                        {labels.tasks.filterPerson}
                    </Text>
                    <select
                        className={GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME}
                        id="collab-filter-person"
                        name="filter-person"
                        value={view.tasks.filter.personMemberId ?? ""}
                        onChange={(event) =>
                            selectFilter({
                                personMemberId:
                                    event.currentTarget.value === "" ? undefined : event.currentTarget.value,
                            })
                        }
                    >
                        <option value="">{labels.tasks.filterAll}</option>
                        {humans.map((human) => (
                            <option key={human.memberId} value={human.memberId}>
                                {human.displayName}
                            </option>
                        ))}
                    </select>
                </label>
                <label className={GROUP_CHAT_NATIVE_FIELD_CLASS_NAME} htmlFor="collab-filter-module">
                    <Text size="sm" weight="semibold">
                        {labels.tasks.filterModule}
                    </Text>
                    <select
                        className={GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME}
                        id="collab-filter-module"
                        name="filter-module"
                        value={view.tasks.filter.moduleInstallationId ?? ""}
                        onChange={(event) =>
                            selectFilter({
                                moduleInstallationId:
                                    event.currentTarget.value === "" ? undefined : event.currentTarget.value,
                            })
                        }
                    >
                        <option value="">{labels.tasks.filterAll}</option>
                        {modules.map((module) => (
                            <option
                                key={module.moduleInstallationId ?? module.memberId}
                                value={module.moduleInstallationId ?? ""}
                            >
                                {module.displayName}
                            </option>
                        ))}
                    </select>
                </label>
                <label className={GROUP_CHAT_NATIVE_FIELD_CLASS_NAME} htmlFor="collab-filter-status">
                    <Text size="sm" weight="semibold">
                        {labels.tasks.filterStatus}
                    </Text>
                    <select
                        className={GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME}
                        id="collab-filter-status"
                        name="filter-status"
                        value={view.tasks.filter.status ?? ""}
                        onChange={(event) =>
                            selectFilter({
                                status:
                                    event.currentTarget.value === ""
                                        ? undefined
                                        : (event.currentTarget.value as CollabTaskStatus),
                            })
                        }
                    >
                        <option value="">{labels.tasks.filterAll}</option>
                        {Object.keys(labels.statuses).map((status) => (
                            <option key={status} value={status}>
                                {labels.statuses[status as CollabTaskStatus]}
                            </option>
                        ))}
                    </select>
                </label>
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
