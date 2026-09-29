import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AcademyStudentCrmActions, AcademyStudentCrmLabels } from "../../../../modules/academy/student-crm"
import { AcademyStudentCrmCreateStudent } from "./index"

const labels: AcademyStudentCrmLabels = {
    section: "Students", empty: "No students", open: "Open", active: "Active", banned: "Banned", detail: "Detail",
    create: "Create", name: "Name", email: "Email", password: "Password", saveStudent: "Save", courseSlug: "Course",
    grant: "Grant", revoke: "Revoke", ban: "Ban", activate: "Activate", loadingDetail: "Loading",
}

describe("AcademyStudentCrmCreateStudent", () => {
    it("renders fields and pending save state", () => {
        const on = { changeName: vi.fn(), changeEmail: vi.fn(), changePassword: vi.fn(), createStudent: vi.fn() } as unknown as AcademyStudentCrmActions
        const html = renderToStaticMarkup(<AcademyStudentCrmCreateStudent pendingAction="create" labels={labels} on={on} />)
        expect(html).toContain("academy-student-name")
        expect(html).toContain("Save")
    })
})
