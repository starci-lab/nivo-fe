import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import type { AcademyStudentCrmActions, AcademyStudentCrmLabels } from "../../../../modules/academy/student-crm"
import { AcademyStudentCrmCreateStudent } from "./index"

const labels: AcademyStudentCrmLabels = {
    section: "Students", empty: "No students", open: "Open", active: "Active", banned: "Banned", detail: "Detail",
    create: "Create", name: "Name", email: "Email", password: "Password", saveStudent: "Save", courseSlug: "Course",
    grant: "Grant", revoke: "Revoke", ban: "Ban", activate: "Activate", loadingDetail: "Loading",
}

const createActions = (): AcademyStudentCrmActions => ({
    openStudent: vi.fn(),
    changeName: vi.fn(),
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    createStudent: vi.fn(),
    changeCourseSlug: vi.fn(),
    setStatus: vi.fn(),
    grantAccess: vi.fn(),
    revokeAccess: vi.fn(),
})

describe("AcademyStudentCrmCreateStudent", () => {
    it("renders fields and pending save state", () => {
        const on = createActions()
        const html = renderToStaticMarkup(<AcademyStudentCrmCreateStudent pendingAction="create" labels={labels} on={on} />)
        expect(html).toContain("academy-student-name")
        expect(html).toContain("Save")
    })

    it("has no accessibility violations in the real form", async () => {
        const { container } = render(
            <AcademyStudentCrmCreateStudent pendingAction="create" labels={labels} on={createActions()} />,
        )
        await expectNoA11yViolations(container)
    })
})
