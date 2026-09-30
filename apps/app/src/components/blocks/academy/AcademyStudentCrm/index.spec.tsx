import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type * as AcademyStudentCrmComponent from "./component"
import { expectNoA11yViolations } from "@/testing/axe"
import { AcademyStudentCrm } from "./index"

type StudentFixture = {
    readonly id: string
    readonly name: string
    readonly email: string
    readonly role: string
    readonly status: string
    readonly xp: number
}
const m = vi.hoisted(() => ({
    session: { state: { status: "signed-in", accessToken: "test-token" } },
    students: { ok: true, data: { items: [] as Array<StudentFixture> } },
    detail: { ok: true, data: undefined as unknown },
    calls: { create: vi.fn(), status: vi.fn(), grant: vi.fn(), revoke: vi.fn(), list: vi.fn(), detail: vi.fn() },
}))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => m.session }))
vi.mock("@/modules/api/academy", () => ({
    myAcademyStudents: m.calls.list,
    myAcademyStudentDetail: m.calls.detail,
    createAcademyStudent: m.calls.create,
    setAcademyStudentStatus: m.calls.status,
    grantAcademyCourseAccess: m.calls.grant,
    revokeAcademyCourseAccess: m.calls.revoke,
}))
type StudentView = {
    on: {
        openStudent: (id: string) => void
        changeName: (value: string) => void
        changeEmail: (value: string) => void
        changePassword: (value: string) => void
        createStudent: () => void
        changeCourseSlug: (value: string) => void
        setStatus: (status: string) => void
        grantAccess: () => void
        revokeAccess: () => void
    }
    state: string
    props: { detailState: string }
}
vi.mock("./component", () => ({
    AcademyStudentCrmBase: (input: StudentView) => (
        <>
            <output data-testid="state">
                {input.state}:{input.props.detailState}
            </output>
            <button onClick={() => input.on.openStudent("member-1")}>open</button>
            <button onClick={() => input.on.changeName("Reader")}>name</button>
            <button onClick={() => input.on.changeEmail("reader@example.test")}>email</button>
            <button onClick={() => input.on.changePassword("secret")}>password</button>
            <button onClick={input.on.createStudent}>create</button>
            <button onClick={() => input.on.changeCourseSlug("intro")}>course</button>
            <button onClick={() => input.on.setStatus("banned")}>ban</button>
            <button onClick={input.on.grantAccess}>grant</button>
            <button onClick={input.on.revokeAccess}>revoke</button>
        </>
    ),
}))

let viewerSequence = 0
beforeEach(() => {
    vi.clearAllMocks()
    viewerSequence += 1
    m.session.state.accessToken = `student-crm-${viewerSequence}`
    m.students = {
        ok: true,
        data: {
            items: [
                {
                    id: "member-1",
                    name: "Reader",
                    email: "reader@example.test",
                    role: "student",
                    status: "active",
                    xp: 10,
                },
            ],
        },
    }
    m.detail = { ok: true, data: { member: m.students.data.items[0], orders: [], courses: [] } }
    m.calls.list.mockResolvedValue(m.students)
    m.calls.detail.mockResolvedValue(m.detail)
    m.calls.create.mockResolvedValue({ ok: true })
    m.calls.status.mockResolvedValue({ ok: true })
    m.calls.grant.mockResolvedValue({ ok: true })
    m.calls.revoke.mockResolvedValue({ ok: true })
})

describe("AcademyStudentCrm", () => {
    it("checks accessibility on the real student CRM", async () => {
        const { AcademyStudentCrmBase } = await vi.importActual<typeof AcademyStudentCrmComponent>("./component")
        const { container } = render(
            <AcademyStudentCrmBase
                state="empty"
                props={{
                    students: [],
                    detailState: "idle",
                    labels: {
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
                    },
                }}
                on={{
                    openStudent: vi.fn(),
                    changeName: vi.fn(),
                    changeEmail: vi.fn(),
                    changePassword: vi.fn(),
                    createStudent: vi.fn(),
                    changeCourseSlug: vi.fn(),
                    setStatus: vi.fn(),
                    grantAccess: vi.fn(),
                    revokeAccess: vi.fn(),
                }}
            />,
        )
        await expectNoA11yViolations(container)
    })

    it("loads students, opens detail and dispatches create/access/status actions", async () => {
        render(<AcademyStudentCrm siteId="site-1" />)
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("answered"))
        fireEvent.click(screen.getByText("open"))
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("answered:answered"))
        fireEvent.click(screen.getByText("name"))
        fireEvent.click(screen.getByText("email"))
        fireEvent.click(screen.getByText("password"))
        fireEvent.click(screen.getByText("create"))
        fireEvent.click(screen.getByText("course"))
        fireEvent.click(screen.getByText("ban"))
        fireEvent.click(screen.getByText("grant"))
        fireEvent.click(screen.getByText("revoke"))
        await waitFor(() =>
            expect(m.calls.create).toHaveBeenCalledWith(
                expect.objectContaining({ siteId: "site-1", password: "secret" }),
            ),
        )
        expect(m.calls.status).toHaveBeenCalled()
        expect(m.calls.grant).toHaveBeenCalled()
        expect(m.calls.revoke).toHaveBeenCalled()
    })
    it("keeps failed list and failed detail distinct", async () => {
        m.calls.list.mockResolvedValue({ ok: false, kind: "unavailable", code: "UNAVAILABLE", reason: "down" })
        render(<AcademyStudentCrm siteId="site-1" />)
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("failed:idle"))
        m.calls.detail.mockResolvedValue({ ok: false, kind: "forbidden", code: "FORBIDDEN", reason: "no access" })
        fireEvent.click(screen.getByText("open"))
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("failed:failed"))
    })
})
