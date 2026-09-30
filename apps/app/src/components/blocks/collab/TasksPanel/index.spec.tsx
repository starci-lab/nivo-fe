import { expectNoA11yViolations } from "@/testing/axe"
import { TasksPanel } from "./index"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import type { CollabTaskView } from "../../../../modules/api/collab"
import {
    TASK_WAITING_APPROVAL,
    labels,
    baseView,
    actions,
    WORKING_TASK,
} from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("TasksPanel", () => {
    it("renders the Tasks tab with named roster filters and Office-bound rows", async () => {
        const user = userEvent.setup()
        const on = actions()
        const view = baseView({ tab: "tasks", tasks: { state: "ready", rows: [TASK_WAITING_APPROVAL], filter: {} } })
        const { container } = render(<TasksPanel view={view} labels={labels} on={on} />)
        const person = screen.getByRole("combobox", { name: labels.tasks.filterPerson })
        const moduleSelect = screen.getByRole("combobox", { name: labels.tasks.filterModule })
        const statusSelect = screen.getByRole("combobox", { name: labels.tasks.filterStatus })
        expect(person).toBeInTheDocument()
        expect(moduleSelect).toBeInTheDocument()
        expect(statusSelect).toBeInTheDocument()
        await user.click(person)
        await user.click(await screen.findByRole("option", { name: "Minh" }))
        expect(on.changeTasksFilter).toHaveBeenCalledWith({ personMemberId: "mem-minh" })
        await user.click(moduleSelect)
        await user.click(await screen.findByRole("option", { name: "Sales" }))
        expect(on.changeTasksFilter).toHaveBeenCalledWith({ moduleInstallationId: "mi-sales" })
        expect(screen.getByText("T-550E")).toBeInTheDocument()
        expect(screen.getByText("Summarise this week's sales")).toBeInTheDocument()
        expect(screen.getAllByText("Chờ phê duyệt").length).toBeGreaterThan(0)
        fireEvent.click(screen.getByRole("button", { name: "Mở trong Office" }))
        expect(on.openTaskCard).toHaveBeenCalledWith(TASK_WAITING_APPROVAL.taskId)
        await expectNoA11yViolations(container)
    })
    it("explains an invalid filter against the current roster instead of leaking another workspace", () => {
        const on = actions()
        const view = baseView({
            tab: "tasks",
            tasks: { state: "ready", rows: [], filter: { personMemberId: "mem-gone" } },
        })
        render(<TasksPanel view={view} labels={labels} on={on} />)
        expect(screen.getByText("Giá trị lọc không còn hợp lệ trong workspace này.")).toBeInTheDocument()
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
    it("clears each Tasks filter back to all and opens a sparse row in Office", async () => {
        const user = userEvent.setup()
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
            await user.click(screen.getByRole("combobox", { name }))
            await user.click(await screen.findByRole("option", { name: labels.tasks.filterAll }))
        }
        expect(on.changeTasksFilter).toHaveBeenCalledWith(expect.objectContaining({ personMemberId: undefined }))
        expect(on.changeTasksFilter).toHaveBeenCalledWith(expect.objectContaining({ moduleInstallationId: undefined }))
        expect(on.changeTasksFilter).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }))
        await user.click(screen.getByRole("button", { name: labels.tasks.openInOffice }))
        expect(on.openTaskCard).toHaveBeenCalledWith("task-w")
    })
})
