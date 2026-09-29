import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AcademyStudentCrmLabels } from "@/modules/academy/student-crm"
import { AcademyStudentCrmRoster } from "./index"

const labels: AcademyStudentCrmLabels = {
    section: "Students", empty: "No students", open: "Open", active: "Active", banned: "Banned", detail: "Detail",
    create: "Create", name: "Name", email: "Email", password: "Password", saveStudent: "Save", courseSlug: "Course",
    grant: "Grant", revoke: "Revoke", ban: "Ban", activate: "Activate", loadingDetail: "Loading",
}

describe("AcademyStudentCrmRoster", () => {
    it("shows settled identities and distinct empty and failure content", () => {
        const on = { openStudent: vi.fn() } as never
        expect(renderToStaticMarkup(<AcademyStudentCrmRoster state="empty" students={[]} labels={labels} on={on} />)).toContain("No students")
        expect(renderToStaticMarkup(<AcademyStudentCrmRoster state="failed" students={[]} notice={<b>Unavailable</b>} labels={labels} on={on} />)).toContain("Unavailable")
        expect(renderToStaticMarkup(<AcademyStudentCrmRoster state="answered" students={[{ id: "s1", name: "Reader", email: "reader@example.test", role: "student", status: "active", xp: 0 }]} labels={labels} on={on} />)).toContain("Reader")
    })
})
