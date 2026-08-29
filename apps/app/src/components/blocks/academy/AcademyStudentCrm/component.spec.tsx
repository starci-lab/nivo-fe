import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyStudentCrmBase } from "./component"

const labels = { section: "Students", empty: "No students", refused: "Unavailable", open: "Open", active: "Active", banned: "Banned", detail: "Detail", create: "Create", name: "Name", email: "Email", password: "Password", saveStudent: "Save", courseSlug: "Course", grant: "Grant", revoke: "Revoke", ban: "Ban", activate: "Activate", loadingDetail: "Loading", actionFailed: "Failed" }
const student = { id: "member-1", name: "Reader", email: "reader@example.test", role: "student", status: "active", xp: 10 }
const handlers = { openStudent: vi.fn(), changeName: vi.fn(), changeEmail: vi.fn(), changePassword: vi.fn(), createStudent: vi.fn(), changeCourseSlug: vi.fn(), setStatus: vi.fn(), grantAccess: vi.fn(), revokeAccess: vi.fn() }

describe("academy student CRM states", () => {
    it("renders list empty/refused states and student identity", () => {
        expect(renderToStaticMarkup(<AcademyStudentCrmBase state="empty" students={[]} detailState="idle" labels={labels} on={handlers} />)).toContain("No students")
        expect(renderToStaticMarkup(<AcademyStudentCrmBase state="refused" students={[]} detailState="idle" labels={labels} on={handlers} />)).toContain("Unavailable")
        expect(renderToStaticMarkup(<AcademyStudentCrmBase state="answered" students={[student]} detailState="idle" labels={labels} on={handlers} />)).toContain("Reader")
    })

    it("renders detail progress and zero-course fallback", () => {
        const detail = { member: student, orders: [], courses: [{ slug: "intro", title: "Intro", completed: 2, total: 4 }] }
        const html = renderToStaticMarkup(<AcademyStudentCrmBase state="answered" students={[student]} detailState="answered" detail={detail} labels={labels} on={handlers} />)
        expect(html).toContain("Intro")
        expect(html).toContain("2/4")
        const empty = renderToStaticMarkup(<AcademyStudentCrmBase state="answered" students={[student]} detailState="answered" detail={{ ...detail, courses: [] }} labels={labels} on={handlers} />)
        expect(empty).toContain("Course")
    })
})