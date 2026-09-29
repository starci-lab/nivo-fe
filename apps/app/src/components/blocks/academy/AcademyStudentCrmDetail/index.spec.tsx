import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AcademyStudentCrmActions, AcademyStudentCrmLabels } from "../../../../modules/academy/student-crm"
import { AcademyStudentCrmDetail } from "./index"

const labels: AcademyStudentCrmLabels = {
    section: "Students", empty: "No students", open: "Open", active: "Active", banned: "Banned", detail: "Detail",
    create: "Create", name: "Name", email: "Email", password: "Password", saveStudent: "Save", courseSlug: "Course",
    grant: "Grant", revoke: "Revoke", ban: "Ban", activate: "Activate", loadingDetail: "Loading",
}

describe("AcademyStudentCrmDetail", () => {
    it("keeps an unselected detail hidden and renders selected course progress", () => {
        const on = { changeCourseSlug: vi.fn(), grantAccess: vi.fn(), setStatus: vi.fn(), revokeAccess: vi.fn() } as unknown as AcademyStudentCrmActions
        expect(renderToStaticMarkup(<AcademyStudentCrmDetail detailState="idle" labels={labels} on={on} />)).not.toContain("Detail")
        const html = renderToStaticMarkup(
            <AcademyStudentCrmDetail detailState="answered" detail={{ member: { id: "s1", name: "Reader", email: "reader@example.test", role: "student", status: "active" }, orders: [], courses: [{ slug: "intro", title: "Intro", completed: 1, total: 2 }] }} labels={labels} on={on} />,
        )
        expect(html).toContain("Intro")
        expect(html).toContain("1/2")
    })
})
