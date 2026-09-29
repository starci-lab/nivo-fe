import { TasksPanel } from "./index"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { CollabTaskView } from "@/modules/api/collab"
import {
    TASK_WAITING_APPROVAL,
    labels,
    baseView,
    actions,
    WORKING_TASK,
} from "@/modules/collab/group-chat/test-fixtures.fixture"

describe("TasksPanel", () => {
    it("renders the Tasks tab with roster-keyed filters and Office-bound rows", () => {
        const on = actions()
        const view = baseView({ tab: "tasks", tasks: { state: "ready", rows: [TASK_WAITING_APPROVAL], filter: {} } })
        render(<TasksPanel view={view} labels={labels} on={on} />)
        const person = screen.getByRole("combobox", { name: "Người" })
        const moduleSelect = screen.getByRole("combobox", { name: "Mô-đun" })
        expect(person).toBeInTheDocument()
        fireEvent.change(person, { target: { value: "mem-minh" } })
        expect(on.changeTasksFilter).toHaveBeenCalledWith({ personMemberId: "mem-minh" })
        fireEvent.change(moduleSelect, { target: { value: "mi-sales" } })
        expect(on.changeTasksFilter).toHaveBeenCalledWith({ moduleInstallationId: "mi-sales" })
        expect(screen.getByText("T-550E")).toBeInTheDocument()
        expect(screen.getByText("Tổng hợp doanh số tuần này")).toBeInTheDocument()
        expect(screen.getAllByText("Chờ phê duyệt").length).toBeGreaterThan(0)
        fireEvent.click(screen.getByRole("button", { name: "Mở trong Office" }))
        expect(on.openTaskCard).toHaveBeenCalledWith(TASK_WAITING_APPROVAL.taskId)
    })
    it("explains an invalid filter against the current roster instead of leaking another workspace", () => {
        const on = actions()
        const view = baseView({
            tab: "tasks",
            tasks: { state: "ready", rows: [], filter: { personMemberId: "mem-gone" } },
        })
        render(<TasksPanel view={view} labels={labels} on={on} />)
        expect(screen.getByText("Giá trị lọc không còn hợp lệ trong Workspace này.")).toBeInTheDocument()
    })
    it("holds the Tasks list and its count while the read is loading", () => {
        render(
            <TasksPanel
                view={baseView({ tab: "tasks", tasks: { state: "loading", rows: [], filter: {} } })}
                labels={labels}
                on={actions()}
            />,
        )
        expect(screen.queryByText(labels.tasks.empty)).toBeNull()
        expect(screen.queryByText(labels.tasks.count(0))).toBeNull()
    })
    it("clears each Tasks filter back to all and opens a sparse row in Office", () => {
        const on = actions()
        const row: CollabTaskView = { ...WORKING_TASK, owningModuleDisplayName: null }
        render(
            <TasksPanel
                view={baseView({
                    tab: "tasks",
                    tasks: {
                        state: "ready",
                        rows: [row],
                        filter: { personMemberId: "mem-an", moduleInstallationId: "mi-sales", status: "working" },
                    },
                })}
                labels={labels}
                on={on}
            />,
        )
        expect(screen.getByText("Mô-đun: sales")).toBeInTheDocument()
        for (const name of [labels.tasks.filterPerson, labels.tasks.filterModule, labels.tasks.filterStatus]) {
            fireEvent.change(screen.getByRole("combobox", { name }), { target: { value: "" } })
        }
        expect(on.changeTasksFilter).toHaveBeenCalledWith(expect.objectContaining({ personMemberId: undefined }))
        expect(on.changeTasksFilter).toHaveBeenCalledWith(expect.objectContaining({ moduleInstallationId: undefined }))
        expect(on.changeTasksFilter).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }))
        fireEvent.click(screen.getByRole("button", { name: labels.tasks.openInOffice }))
        expect(on.openTaskCard).toHaveBeenCalledWith("task-w")
    })
})
