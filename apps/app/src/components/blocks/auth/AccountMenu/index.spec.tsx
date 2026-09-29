import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AdministratorRevocationDialog } from "@/components/blocks/auth/AdministratorRevocationDialog"
import type { EndPrincipalSessionsAnswer, EndPrincipalSessionsInput } from "@/modules/api/auth"
import type { Outcome } from "@/modules/api/outcome"
import type { SessionEndReport } from "@/modules/auth/session"

/** An everywhere ending the identity authority confirmed. */
const APPLIED: SessionEndReport = { localCleared: true, remoteRevocation: "observed", authorityEnding: "confirmed" }
/** An everywhere ending nobody confirmed, which is never an applied scope. */
const UNCONFIRMED: SessionEndReport = {
    localCleared: true,
    remoteRevocation: "unknown",
    authorityEnding: "unconfirmed",
}

/** The scope the connected half may ask an ending for, held here so the spy is typed as the session's. */
type EndingCall = (scope?: "thisBrowser" | "everywhere") => Promise<SessionEndReport>

const end = vi.fn<EndingCall>(() => Promise.resolve(APPLIED))
const replace = vi.fn()
vi.mock("@/modules/i18n/navigation", () => ({
    Link: "a",
    redirect: vi.fn(),
    navigation: {
        usePathname: () => "/",
        useRouter: () => ({ push: vi.fn(), replace }),
    },
}))

/** The route, the membership answer and the roster the connected half reads; each test sets what it needs. */
const scope = vi.hoisted(() => ({
    params: { locale: "vi", workspaceId: "workspace-1" } as Record<string, string>,
    role: "owner" as string | null,
    /** The address the landing's notice reads; empty on every ordinary landing. */
    search: "",
    /** The workspace display name the route layout's own control-center read exposes. */
    workspaceName: "Support",
    /** How the authorized roster answers: arriving, read, refused, or with nobody else on it. */
    roster: "ready" as "ready" | "loading" | "unavailable" | "empty",
    /** Every human member of the roster except the viewer. */
    members: [
        { memberId: "member-2", displayName: "Binh Tran" },
        { memberId: "member-3", displayName: "Chi Le" },
    ] as ReadonlyArray<{ readonly memberId: string; readonly displayName: string }>,
}))
vi.mock("next/navigation", () => ({
    useParams: () => scope.params,
    useSearchParams: () => new URLSearchParams(scope.search),
}))
vi.mock("@/hooks", async () => {
    const { useMutateEndPrincipalSessionsSwr } = await import("@/hooks/swr/mutations/useMutateEndPrincipalSessionsSwr")
    return {
        useMutateEndPrincipalSessionsSwr,
        useSession: () => ({ state: { status: "signed-in", accessToken: "token" }, end }),
        useRouter: () => ({ push: vi.fn(), replace }),
        usePathname: () => "/",
        useQueryMyAgentWorkspaceControlCenterSwr: (workspaceId: string, enabled = true) =>
            enabled
                ? { data: { ok: true, data: { workspace: { id: workspaceId, name: scope.workspaceName } } } }
                : { data: undefined },
        useQueryCollabOfficeSwr: (workspaceId: string | null) => {
            if (workspaceId === null || scope.role === null || scope.roster === "loading") return { data: undefined }
            if (scope.roster === "unavailable") return { data: { ok: false, kind: "denied" } }
            return {
                data: {
                    ok: true,
                    data: {
                        viewer: { memberId: "member-1", role: scope.role },
                        participants: [
                            {
                                memberId: "member-1",
                                kind: "human",
                                displayName: "An Nguyen",
                                role: "owner",
                                status: "active",
                                moduleInstallationId: null,
                            },
                            ...(scope.roster === "empty" ? [] : scope.members).map((member) => ({
                                ...member,
                                kind: "human",
                                role: "staff",
                                status: "active",
                                moduleInstallationId: null,
                            })),
                            {
                                memberId: "module-1",
                                kind: "module",
                                displayName: "Agent",
                                role: "module",
                                status: "active",
                                moduleInstallationId: "inst-1",
                            },
                        ],
                    },
                },
            }
        },
    }
})

/** One scoped administrator ending answer, and the request the transport was handed. */
type AdministratorEndingCall = (input: EndPrincipalSessionsInput) => Promise<Outcome<EndPrincipalSessionsAnswer>>
const APPLIED_SCOPE: EndPrincipalSessionsAnswer = { kind: "scopeApplied", authorityEndingConfirmed: true }
const endPrincipalSessions = vi.fn<AdministratorEndingCall>(() => Promise.resolve({ ok: true, data: APPLIED_SCOPE }))
vi.mock("@/modules/api/auth", () => ({
    endPrincipalSessions: (input: EndPrincipalSessionsInput) => endPrincipalSessions(input),
}))

import { AccountMenu } from "."

/** An ending request that stays unanswered until the test releases it. */
const unansweredEnding = () => {
    let release: (report: SessionEndReport) => void = () => {}
    const promise = new Promise<SessionEndReport>((resolve) => {
        release = resolve
    })
    return { promise, release }
}

/** Open the account menu and choose sign out everywhere, answering with the confirmation. */
const openEveryBrowserConfirmation = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<AccountMenu />)
    fireEvent.click(screen.getByRole("button", { name: "Account" }))
    await user.click(await screen.findByRole("menuitem", { name: "Sign out everywhere" }))
    return screen.findByRole("dialog")
}

/** Open the account menu and the administrator ending, answering with the dialog it mounts. */
const openMemberEndingDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<AccountMenu />)
    fireEvent.click(screen.getByRole("button", { name: "Account" }))
    await user.click(await screen.findByRole("menuitem", { name: "End the sign-ins of a person" }))
    return screen.findByRole("dialog")
}

/** The picker's trigger inside the drawn dialog, named by the field label the connected half resolved. */
const memberPicker = (dialog: HTMLElement): HTMLElement => within(dialog).getByRole("button", { name: /Member/ })

/** Open the administrator ending, choose a roster member by display name and continue, answering with the confirmation. */
const openMemberEnding = async (user: ReturnType<typeof userEvent.setup>) => {
    const dialog = await openMemberEndingDialog(user)
    await user.click(memberPicker(dialog))
    await user.click(await screen.findByRole("option", { name: "Binh Tran" }))
    await user.click(screen.getByRole("button", { name: "Continue" }))
    return screen.findByRole("dialog")
}

/**
 * The confirmation mounted on its own, for the roster answers the entry itself cannot be offered
 * under: the menu row and the roster come from one read, so a roster that is still arriving or that
 * answered with a failure also withholds the row. The dialog still has to draw both states, and this
 * mounts the connected half directly to prove it.
 */
const mountMemberEnding = () => {
    render(<AdministratorRevocationDialog isOpen onOpenChange={() => undefined} />)
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
        scope.workspaceName = "Support"
        scope.roster = "ready"
        scope.members = [
            { memberId: "member-2", displayName: "Binh Tran" },
            { memberId: "member-3", displayName: "Chi Le" },
        ]
    })

    it("ends the real session from the account action", async () => {
        const user = userEvent.setup()
        render(<AccountMenu />)

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        await user.click(await screen.findByRole("menuitem", { name: "Sign out" }))
        expect(end).toHaveBeenCalledOnce()
        expect(end).toHaveBeenCalledWith()
    })

    it("asks the every-browser scope in the console's own words, ends every session once, and leaves for Login", async () => {
        const user = userEvent.setup()
        const dialog = await openEveryBrowserConfirmation(user)

        expect(dialog).toHaveAccessibleName("Sign out everywhere")
        expect(
            within(dialog).getByText(
                "End your current Nivo sessions on every browser. Your login stays available for a fresh sign-in.",
            ),
        ).toBeInTheDocument()
        expect(within(dialog).getByText("This includes this browser.")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Sign out everywhere" }))
        expect(end).toHaveBeenCalledOnce()
        expect(end).toHaveBeenCalledWith("everywhere")
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?sessionEnding=applied"))
    })

    it("applies no ending when the every-browser confirmation is cancelled", async () => {
        const user = userEvent.setup()
        await openEveryBrowserConfirmation(user)

        await user.click(screen.getByRole("button", { name: "Cancel" }))
        expect(end).not.toHaveBeenCalled()
        expect(replace).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    })

    it("carries an unconfirmed authority-side ending on as unconfirmed, never as applied", async () => {
        end.mockResolvedValueOnce(UNCONFIRMED)
        const user = userEvent.setup()
        await openEveryBrowserConfirmation(user)

        await user.click(screen.getByRole("button", { name: "Sign out everywhere" }))
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?sessionEnding=unconfirmed"))
        expect(replace).not.toHaveBeenCalledWith("/authentication?sessionEnding=applied")
    })

    it("sends one ending when the confirmation is pressed twice in quick succession", async () => {
        const { promise, release } = unansweredEnding()
        end.mockReturnValueOnce(promise)
        const user = userEvent.setup()
        await openEveryBrowserConfirmation(user)
        const confirm = screen.getByRole("button", { name: "Sign out everywhere" })

        await user.click(confirm)
        await user.click(confirm)
        expect(end).toHaveBeenCalledOnce()

        await act(async () => {
            release(APPLIED)
        })
        await waitFor(() => expect(replace).toHaveBeenCalledOnce())
    })

    it("offers the administrator ending to a current workspace Owner or Manager, and to nobody else", async () => {
        const user = userEvent.setup()
        scope.role = "staff"
        render(<AccountMenu />)

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        await screen.findByRole("menu")
        expect(screen.queryByRole("menuitem", { name: "End the sign-ins of a person" })).not.toBeInTheDocument()

        await user.keyboard("{Escape}")
        cleanup()
        scope.role = "manager"
        render(<AccountMenu />)
        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        expect(await screen.findByRole("menuitem", { name: "End the sign-ins of a person" })).toBeInTheDocument()
    })

    it("offers no administrator ending off a workspace route, whatever the membership answers", async () => {
        scope.params = { locale: "vi" }
        render(<AccountMenu />)

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        await screen.findByRole("menu")
        expect(screen.queryByRole("menuitem", { name: "End the sign-ins of a person" })).not.toBeInTheDocument()
        expect(endPrincipalSessions).not.toHaveBeenCalled()
    })

    it("never offers the viewer's own member row or a hired module, and never names a raw identity", async () => {
        const user = userEvent.setup()
        const dialog = await openMemberEndingDialog(user)

        expect(within(dialog).getByText("Workspace")).toBeInTheDocument()
        expect(within(dialog).getByText("Support")).toBeInTheDocument()
        await user.click(memberPicker(dialog))
        const options = await screen.findAllByRole("option")
        expect(options.map((option) => option.textContent)).toEqual(["Binh Tran", "Chi Le"])
        expect(document.body.textContent).not.toContain("member-1")
        expect(document.body.textContent).not.toContain("member-2")
    })

    it("keeps the continuation disabled while the roster is still arriving, and sends nothing", async () => {
        scope.roster = "loading"
        await mountMemberEnding()

        expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled()
        expect(endPrincipalSessions).not.toHaveBeenCalled()
    })

    it("says the roster could not be read rather than drawing an empty picker", async () => {
        scope.roster = "unavailable"
        const dialog = await mountMemberEnding()

        expect(within(dialog).getByText("The member list could not be loaded. Please try again.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled()
    })

    it("says nobody else can be chosen rather than drawing an empty picker", async () => {
        scope.roster = "empty"
        const user = userEvent.setup()
        const dialog = await openMemberEndingDialog(user)

        expect(within(dialog).getByText("This workspace has no other members to choose.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled()
    })

    it("names the chosen member and the workspace scope, sends one request identity, and reports the applied scope in one sentence", async () => {
        const user = userEvent.setup()
        const dialog = await openMemberEnding(user)

        expect(dialog).toHaveAccessibleName("End Binh Tran's sign-ins?")
        await user.click(screen.getByRole("button", { name: "End all sign-ins" }))
        await waitFor(() => expect(endPrincipalSessions).toHaveBeenCalledOnce())
        /*
         * The chosen roster member travels as the workspace memberId; a Login principal or email
         * never crosses this wire - the authority owner resolves the member's principal from it.
         */
        expect(endPrincipalSessions.mock.calls[0]![0]).toMatchObject({
            memberId: "member-2",
            workspaceId: "workspace-1",
        })
        expect(endPrincipalSessions.mock.calls[0]![0]).not.toHaveProperty("targetPrincipal")
        expect(typeof endPrincipalSessions.mock.calls[0]![0].requestId).toBe("string")

        const applied = await screen.findByText("Sign-ins in the scope you act in have been ended for this person.")
        expect(applied).toBeInTheDocument()
        expect(applied.textContent).not.toMatch(/\d/)
    })

    it("draws the applied scope with the same one sentence whether or not the authority confirmed its own side", async () => {
        const user = userEvent.setup()
        await openMemberEnding(user)

        await user.click(screen.getByRole("button", { name: "End all sign-ins" }))
        const confirmed = await screen.findByText("Sign-ins in the scope you act in have been ended for this person.")
        expect(confirmed).toBeInTheDocument()

        cleanup()
        endPrincipalSessions.mockImplementation(() =>
            Promise.resolve({
                ok: true,
                data: { kind: "scopeApplied", authorityEndingConfirmed: null },
            }),
        )
        await openMemberEnding(user)
        await user.click(screen.getByRole("button", { name: "End all sign-ins" }))
        const silent = await screen.findByText("Sign-ins in the scope you act in have been ended for this person.")
        expect(silent.textContent).toBe(confirmed.textContent)
    })

    it("draws an unauthorized, unknown-principal or nothing-current answer as the one generic refusal, with no retry", async () => {
        const user = userEvent.setup()
        endPrincipalSessions.mockResolvedValueOnce({
            ok: true,
            data: { kind: "refused", authorityEndingConfirmed: null },
        })
        const dialog = await openMemberEnding(user)

        await user.click(screen.getByRole("button", { name: "End all sign-ins" }))
        const refused = await within(dialog).findByText("This action cannot be carried out.")
        expect(refused).toBeInTheDocument()
        expect(
            within(dialog).queryByText("Sign-ins in the scope you act in have been ended for this person."),
        ).not.toBeInTheDocument()
        expect(
            within(dialog).queryByText("This action could not be completed. Please try again."),
        ).not.toBeInTheDocument()
        expect(within(dialog).queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
    })

    it("reports an authority that never answered as undecided and resends the same request identity on retry", async () => {
        const user = userEvent.setup()
        endPrincipalSessions.mockResolvedValueOnce({
            ok: false,
            kind: "unavailable",
            status: null,
            reason: "network",
            code: "NETWORK",
            retryable: true,
        })
        const dialog = await openMemberEnding(user)

        await user.click(screen.getByRole("button", { name: "End all sign-ins" }))
        expect(
            await within(dialog).findByText("This action could not be completed. Please try again."),
        ).toBeInTheDocument()
        expect(within(dialog).queryByText("This action cannot be carried out.")).not.toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Try again" }))
        await waitFor(() => expect(endPrincipalSessions).toHaveBeenCalledTimes(2))
        expect(endPrincipalSessions.mock.calls[1]![0]).toEqual(endPrincipalSessions.mock.calls[0]![0])
    })

    it("steps back to the picker when the confirmation is cancelled, and sends nothing", async () => {
        const user = userEvent.setup()
        await openMemberEnding(user)

        await user.click(screen.getByRole("button", { name: "Cancel" }))
        expect(endPrincipalSessions).not.toHaveBeenCalled()
        expect(await screen.findByRole("dialog")).toBeInTheDocument()
        expect(memberPicker(screen.getByRole("dialog"))).toBeInTheDocument()
    })
})
