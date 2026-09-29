import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyStudentCrmBase } from "./component"

const labels = {
    section: "Students",
    empty: "No students",
    open: "Open",
    active: "Active",
    banned: "Banned",
    detail: "Detail",
    create: "Create",
    name: "Name",
    email: "Email",
    password: "Password",
    saveStudent: "Save",
    courseSlug: "Course",
    grant: "Grant",
    revoke: "Revoke",
    ban: "Ban",
    activate: "Activate",
    loadingDetail: "Loading",
    actionFailed: "Failed",
}
const student = {
    id: "member-1",
    name: "Reader",
    email: "reader@example.test",
    role: "student",
    status: "active",
    xp: 10,
}
const handlers = {
    openStudent: vi.fn(),
    changeName: vi.fn(),
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    createStudent: vi.fn(),
    changeCourseSlug: vi.fn(),
    setStatus: vi.fn(),
    grantAccess: vi.fn(),
    revokeAccess: vi.fn(),
    retryNotice: vi.fn(),
    retryDetailNotice: vi.fn(),
}

describe("AcademyStudentCrmBase", () => {
    it("renders list empty/failed states and student identity", () => {
        expect(
            renderToStaticMarkup(
                <AcademyStudentCrmBase
                    state="empty"
                    props={{ students: [], detailState: "idle", labels }}
                    on={handlers}
                />,
            ),
        ).toContain("No students")
        expect(
            renderToStaticMarkup(
                <AcademyStudentCrmBase
                    state="failed"
                    props={{ students: [], detailState: "idle", notice: { message: "Unavailable" }, labels }}
                    on={handlers}
                />,
            ),
        ).toContain("Unavailable")
        expect(
            renderToStaticMarkup(
                <AcademyStudentCrmBase
                    state="answered"
                    props={{ students: [student], detailState: "idle", labels }}
                    on={handlers}
                />,
            ),
        ).toContain("Reader")
    })

    it("renders detail progress and zero-course fallback", () => {
        const detail = {
            member: student,
            orders: [],
            courses: [{ slug: "intro", title: "Intro", completed: 2, total: 4 }],
        }
        const html = renderToStaticMarkup(
            <AcademyStudentCrmBase
                state="answered"
                props={{ students: [student], detailState: "answered", detail, labels }}
                on={handlers}
            />,
        )
        expect(html).toContain("Intro")
        expect(html).toContain("2/4")
        const empty = renderToStaticMarkup(
            <AcademyStudentCrmBase
                state="answered"
                props={{ students: [student], detailState: "answered", detail: { ...detail, courses: [] }, labels }}
                on={handlers}
            />,
        )
        expect(empty).toContain("Course")
    })
})

describe("AcademyStudentCrmBase", () => {
    it("fires integration, lead, student, and solution actions", () => {
        const actions = {
            openStudent: vi.fn(),
            changeName: vi.fn(),
            changeEmail: vi.fn(),
            changePassword: vi.fn(),
            createStudent: vi.fn(),
            changeCourseSlug: vi.fn(),
            setStatus: vi.fn(),
            grantAccess: vi.fn(),
            revokeAccess: vi.fn(),
            retryNotice: vi.fn(),
            retryDetailNotice: vi.fn(),
        }
        const student = {
            id: "member-1",
            name: "Student",
            email: "student@example.test",
            role: "student",
            status: "active",
            xp: 1,
        }
        const detail = {
            member: student,
            orders: [],
            courses: [{ slug: "intro", title: "Intro", completed: 1, total: 2 }],
        }
        render(
            <AcademyStudentCrmBase
                state="answered"
                props={{ students: [student], detailState: "answered", detail, labels }}
                on={actions}
            />,
        )
        fireEvent.click(screen.getAllByRole("button", { name: "Open" }).at(-1)!)
        fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New" } })
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.test" } })
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } })
        fireEvent.change(screen.getByLabelText("Course"), { target: { value: "advanced" } })
        fireEvent.click(screen.getByRole("button", { name: "Save" }))
        fireEvent.click(screen.getByRole("button", { name: "Grant" }))
        expect(actions.openStudent).toHaveBeenCalled()
        expect(actions.createStudent).toHaveBeenCalled()
        expect(actions.grantAccess).toHaveBeenCalled()
        cleanup()
        renderToStaticMarkup(
            <AcademyStudentCrmBase
                state="resting"
                props={{ students: [], detailState: "resting", labels }}
                on={actions}
            />,
        )
        renderToStaticMarkup(
            <AcademyStudentCrmBase
                state="answered"
                props={{
                    students: [{ ...student, status: "banned" }],
                    detailState: "failed",
                    detailNotice: { message: "Unavailable" },
                    actionMessage: "Failed",
                    detail: {
                        member: student,
                        orders: [],
                        courses: [{ slug: "zero", title: "Zero", completed: 0, total: 0 }],
                    },
                    labels,
                }}
                on={actions}
            />,
        )
    })
})
