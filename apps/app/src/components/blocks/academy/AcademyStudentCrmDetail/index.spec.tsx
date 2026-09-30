import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import type { AcademyStudentCrmActions, AcademyStudentCrmLabels } from "../../../../modules/academy/student-crm"
import { AcademyStudentCrmDetail } from "./index"

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

describe("AcademyStudentCrmDetail", () => {
    it("keeps an unselected detail hidden and renders selected course progress", () => {
        const on = createActions()
        expect(renderToStaticMarkup(<AcademyStudentCrmDetail detailState="idle" labels={labels} on={on} />)).not.toContain("Detail")
        const html = renderToStaticMarkup(
            <AcademyStudentCrmDetail detailState="answered" detail={{ member: { id: "s1", name: "Reader", email: "reader@example.test", role: "student", status: "active" }, orders: [], courses: [{ slug: "intro", title: "Intro", completed: 1, total: 2 }] }} labels={labels} on={on} />,
        )
        expect(html).toContain("Intro")
        expect(html).toContain("1/2")
    })

    it("has no accessibility violations in the selected detail", async () => {
        const { container } = render(
            <AcademyStudentCrmDetail
                detailState="answered"
                detail={{
                    member: { id: "s1", name: "Reader", email: "reader@example.test", role: "student", status: "active" },
                    orders: [],
                    courses: [{ slug: "intro", title: "Intro", completed: 1, total: 2 }],
                }}
                labels={labels}
                on={createActions()}
            />,
        )
        await expectNoA11yViolations(container)
    })
})
