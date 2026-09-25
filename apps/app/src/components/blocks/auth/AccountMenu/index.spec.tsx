import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { EndPrincipalSessionsAnswer, EndPrincipalSessionsInput } from "@/modules/api/auth"
import type { Result } from "@/modules/api/graphql"
import type { SessionEndReport } from "@/modules/auth/session"

/** An everywhere ending the identity authority confirmed. */
const APPLIED: SessionEndReport = { localCleared: true, remoteRevocation: "observed", authorityEnding: "confirmed" }
/** An everywhere ending nobody confirmed, which is never an applied scope. */
const UNCONFIRMED: SessionEndReport = { localCleared: true, remoteRevocation: "unknown", authorityEnding: "unconfirmed" }

/** The scope the connected half may ask an ending for, held here so the spy is typed as the session's. */
type EndingCall = (scope?: "thisBrowser" | "everywhere") => Promise<SessionEndReport>

const end = vi.fn<EndingCall>(() => Promise.resolve(APPLIED))
const replace = vi.fn()
vi.mock("@/modules/auth/session", () => ({
    useSession: () => ({ state: { status: "signed-in", accessToken: "token" }, end }),
}))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Readonly<Record<string, unknown>>) =>
        values === undefined ? key : `${key}(${Object.entries(values).map(([name, value]) => `${name}=${String(value)}`).join(",")})`,
}))
vi.mock("@/i18n/navigation", () => ({
    Link: "a",
    redirect: vi.fn(),
    usePathname: () => "/",
    useRouter: () => ({ push: vi.fn(), replace }),
}))

/** The route and the membership answer the connected half reads; each test sets what it needs. */
const scope = vi.hoisted(() => ({
    params: { locale: "vi", workspaceId: "workspace-1" } as Record<string, string>,
    role: "owner" as string | null,
    /** The address the landing's notice reads; empty on every ordinary landing. */
    search: "",
}))
vi.mock("next/navigation", () => ({
    useParams: () => scope.params,
    useSearchParams: () => new URLSearchParams(scope.search),
}))
vi.mock("@/hooks", async () => {
    const { useMutateEndPrincipalSessionsSwr } = await import("@/hooks/swr/mutations/useMutateEndPrincipalSessionsSwr")
    return {
        useMutateEndPrincipalSessionsSwr,
        useQueryCollabOfficeSwr: (workspaceId: string | null) =>
            workspaceId === null || scope.role === null
                ? { data: undefined }
                : {
                    data: {
                        ok: true,
                        data: { viewer: { memberId: "member-1", role: scope.role } },
                    },
                },
    }
})

/** One scoped administrator ending answer, and the request the transport was handed. */
type AdministratorEndingCall = (input: EndPrincipalSessionsInput) => Promise<Result<EndPrincipalSessionsAnswer>>
const APPLIED_SCOPE: EndPrincipalSessionsAnswer = { kind: "scopeApplied", authorityEndingConfirmed: true }
const endPrincipalSessions = vi.fn<AdministratorEndingCall>(() => Promise.resolve({ ok: true, data: APPLIED_SCOPE }))
vi.mock("@/modules/api/auth", () => ({
    endPrincipalSessions: (input: EndPrincipalSessionsInput) => endPrincipalSessions(input),
}))

import { AccountMenu } from "."

/** An ending request that stays unanswered until the test releases it. */
const unansweredEnding = () => {
    let release: (report: SessionEndReport) => void = () => {}
    const promise = new Promise<SessionEndReport>((resolve) => { release = resolve })
    return { promise, release }
}

/** Open the account menu and choose sign out everywhere, answering with the confirmation. */
const openEveryBrowserConfirmation = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<AccountMenu />)
    fireEvent.click(screen.getByRole("button", { name: "account.label" }))
    await user.click(await screen.findByRole("menuitem", { name: "account.signOutEverywhere" }))
    return screen.findByRole("dialog")
}

/** Open the account menu, name a target and confirm it, answering with the sent confirmation. */
const openNamedAdministratorEnding = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<AccountMenu />)
    fireEvent.click(screen.getByRole("button", { name: "account.label" }))
    await user.click(await screen.findByRole("menuitem", { name: "account.endSessionsForPerson" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("account.administratorEnding.targetLabel"), "linh@nivo.vn")
    await user.click(screen.getByRole("button", { name: "account.administratorEnding.confirm" }))
    return screen.findByRole("dialog")
}

describe("AccountMenu", () => {
    afterEach(() => {
        cleanup()
        end.mockClear()
        end.mockImplementation(() => Promise.resolve(APPLIED))
        replace.mockClear()
        endPrincipalSessions.mockClear()
        endPrincipalSessions.mockImplementation(() => Promise.resolve({ ok: true, data: APPLIED_SCOPE }))
        scope.params = { locale: "vi", workspaceId: "workspace-1" }
        scope.role = "owner"
    })

    it("ends the real session from the account action", async () => {
        const user = userEvent.setup()
        render(<AccountMenu />)

        fireEvent.click(screen.getByRole("button", { name: "account.label" }))
        await user.click(await screen.findByRole("menuitem", { name: "account.signOut" }))
        expect(end).toHaveBeenCalledOnce()
        expect(end).toHaveBeenCalledWith()
    })

    it("asks the every-browser scope in the console's own words, ends every session once, and leaves for Login", async () => {
        const user = userEvent.setup()
        const dialog = await openEveryBrowserConfirmation(user)

        expect(dialog).toHaveAccessibleName("account.sessionEnding.title")
        expect(within(dialog).getByText("account.sessionEnding.description")).toBeInTheDocument()
        expect(within(dialog).getByText("account.sessionEnding.scopeNote")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "account.sessionEnding.confirm" }))
        expect(end).toHaveBeenCalledOnce()
        expect(end).toHaveBeenCalledWith("everywhere")
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?sessionEnding=applied"))
    })

    it("applies no ending when the every-browser confirmation is cancelled", async () => {
        const user = userEvent.setup()
        await openEveryBrowserConfirmation(user)

        await user.click(screen.getByRole("button", { name: "account.sessionEnding.cancel" }))
        expect(end).not.toHaveBeenCalled()
        expect(replace).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    })

    it("carries an unconfirmed authority-side ending on as unconfirmed, never as applied", async () => {
        end.mockResolvedValueOnce(UNCONFIRMED)
        const user = userEvent.setup()
        await openEveryBrowserConfirmation(user)

        await user.click(screen.getByRole("button", { name: "account.sessionEnding.confirm" }))
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?sessionEnding=unconfirmed"))
        expect(replace).not.toHaveBeenCalledWith("/authentication?sessionEnding=applied")
    })

    it("sends one ending when the confirmation is pressed twice in quick succession", async () => {
        const { promise, release } = unansweredEnding()
        end.mockReturnValueOnce(promise)
        const user = userEvent.setup()
        await openEveryBrowserConfirmation(user)
        const confirm = screen.getByRole("button", { name: "account.sessionEnding.confirm" })

        await user.click(confirm)
        await user.click(confirm)
        expect(end).toHaveBeenCalledOnce()

        await act(async () => { release(APPLIED) })
        await waitFor(() => expect(replace).toHaveBeenCalledOnce())
    })

    it("offers the administrator ending to a current workspace Owner or Manager, and to nobody else", async () => {
        const user = userEvent.setup()
        scope.role = "staff"
        render(<AccountMenu />)

        fireEvent.click(screen.getByRole("button", { name: "account.label" }))
        await screen.findByRole("menu")
        expect(screen.queryByRole("menuitem", { name: "account.endSessionsForPerson" })).not.toBeInTheDocument()

        await user.keyboard("{Escape}")
        cleanup()
        scope.role = "manager"
        render(<AccountMenu />)
        fireEvent.click(screen.getByRole("button", { name: "account.label" }))
        expect(await screen.findByRole("menuitem", { name: "account.endSessionsForPerson" })).toBeInTheDocument()
    })

    it("offers no administrator ending off a workspace route, whatever the membership answers", async () => {
        scope.params = { locale: "vi" }
        render(<AccountMenu />)

        fireEvent.click(screen.getByRole("button", { name: "account.label" }))
        await screen.findByRole("menu")
        expect(screen.queryByRole("menuitem", { name: "account.endSessionsForPerson" })).not.toBeInTheDocument()
        expect(endPrincipalSessions).not.toHaveBeenCalled()
    })

    it("names the target and the workspace scope, sends one request identity, and reports the applied scope in one sentence", async () => {
        const user = userEvent.setup()
        const dialog = await openNamedAdministratorEnding(user)

        expect(dialog).toHaveAccessibleName("account.administratorEnding.title(target=linh@nivo.vn)")
        await user.click(screen.getByRole("button", { name: "account.administratorEnding.confirm" }))
        await waitFor(() => expect(endPrincipalSessions).toHaveBeenCalledOnce())
        expect(endPrincipalSessions.mock.calls[0][0]).toMatchObject({
            targetPrincipal: "linh@nivo.vn",
            workspaceId: "workspace-1",
        })
        expect(typeof endPrincipalSessions.mock.calls[0][0].requestId).toBe("string")

        const applied = await screen.findByText("account.administratorEnding.applied")
        expect(applied).toBeInTheDocument()
        expect(applied.textContent).not.toMatch(/\d/)
    })

    it("draws the applied scope with the same one sentence whether or not the authority confirmed its own side", async () => {
        const user = userEvent.setup()
        await openNamedAdministratorEnding(user)

        await user.click(screen.getByRole("button", { name: "account.administratorEnding.confirm" }))
        const confirmed = await screen.findByText("account.administratorEnding.applied")
        expect(confirmed).toBeInTheDocument()

        cleanup()
        endPrincipalSessions.mockImplementation(() => Promise.resolve({
            ok: true,
            data: { kind: "scopeApplied", authorityEndingConfirmed: null },
        }))
        await openNamedAdministratorEnding(user)
        await user.click(screen.getByRole("button", { name: "account.administratorEnding.confirm" }))
        const silent = await screen.findByText("account.administratorEnding.applied")
        expect(silent.textContent).toBe(confirmed.textContent)
    })

    it("draws an unauthorized, unknown-principal or nothing-current answer as the one generic refusal, with no retry", async () => {
        const user = userEvent.setup()
        endPrincipalSessions.mockResolvedValueOnce({
            ok: true,
            data: { kind: "refused", authorityEndingConfirmed: null },
        })
        const dialog = await openNamedAdministratorEnding(user)

        await user.click(screen.getByRole("button", { name: "account.administratorEnding.confirm" }))
        const refused = await within(dialog).findByText("account.administratorEnding.refused")
        expect(refused).toBeInTheDocument()
        expect(within(dialog).queryByText("account.administratorEnding.applied")).not.toBeInTheDocument()
        expect(within(dialog).queryByText("account.administratorEnding.undecided")).not.toBeInTheDocument()
        expect(within(dialog).queryByRole("button", { name: "account.administratorEnding.retry" })).not.toBeInTheDocument()
    })

    it("reports an authority that never answered as undecided and resends the same request identity on retry", async () => {
        const user = userEvent.setup()
        endPrincipalSessions.mockResolvedValueOnce({ ok: false, reason: "network", code: "NETWORK" })
        const dialog = await openNamedAdministratorEnding(user)

        await user.click(screen.getByRole("button", { name: "account.administratorEnding.confirm" }))
        expect(await within(dialog).findByText("account.administratorEnding.undecided")).toBeInTheDocument()
        expect(within(dialog).queryByText("account.administratorEnding.refused")).not.toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "account.administratorEnding.retry" }))
        await waitFor(() => expect(endPrincipalSessions).toHaveBeenCalledTimes(2))
        expect(endPrincipalSessions.mock.calls[1][0]).toEqual(endPrincipalSessions.mock.calls[0][0])
    })
})