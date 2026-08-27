import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
    const api = {
        catalogItems: vi.fn(),
        createExpertSite: vi.fn(),
        myExpertSiteDeployment: vi.fn(),
        publishExpertSite: vi.fn(),
    }
    return {
        api,
        replace: vi.fn(),
        push: vi.fn(),
        session: { state: { status: "signed-in", accessToken: "token" } },
        realtime: { status: "disconnected" as string, event: undefined as { kind: string, id: string, status?: string, reason?: string } | undefined },
        t: (key: string) => key,
    }
})

type TemplateProbeProps = {
    state: string
    props: { subject: string, detail: string, statusText: string }
    on?: { changeSlug?: (value: string) => void, submit?: () => void, act?: () => void }
}

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, push: mocks.push }) }))
vi.mock("next-intl", () => ({ useTranslations: () => mocks.t, useLocale: () => "en" }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => mocks.api)
vi.mock("@/modules/realtime/provisioning", () => ({ default: () => mocks.realtime }))
vi.mock("./component", () => ({
    TemplateAppProvisioningBase: (props: TemplateProbeProps) => (
        <div>
            <output data-testid="template-flow">{JSON.stringify({ state: props.state, subject: props.props.subject, detail: props.props.detail, text: props.props.statusText })}</output>
            <input data-testid="slug" onChange={(event) => props.on?.changeSlug?.(event.target.value)} />
            <button data-testid="submit" onClick={props.on?.submit}>submit</button>
            <button data-testid="act" onClick={props.on?.act}>act</button>
        </div>
    ),
}))

import { TemplateAppProvisioning } from "./"

const item = { id: "item", name: "Academy", templateKey: "ai_academy" }
const flow = () => screen.getByTestId("template-flow").textContent ?? ""
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}

describe("TemplateAppProvisioning connected flow", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.realtime.status = "disconnected"
        mocks.realtime.event = undefined
        mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [item] })
        mocks.api.createExpertSite.mockResolvedValue({ ok: true, data: { id: "site", slug: "alpha" } })
        mocks.api.publishExpertSite.mockResolvedValue({ ok: true, data: { slug: "alpha" } })
        mocks.api.myExpertSiteDeployment.mockResolvedValue({ ok: true, data: null })
    })

    it("supports the new request, slug submission and accepted state", async () => {
        render(<TemplateAppProvisioning context={{ mode: "new", templateKey: "ai_academy" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        fireEvent.change(screen.getByTestId("slug"), { target: { value: " alpha " } })
        fireEvent.click(screen.getByTestId("submit"))
        await waitFor(() => expect(flow()).toContain('"state":"accepted"'))
        expect(mocks.api.createExpertSite).toHaveBeenCalledWith("alpha")
        expect(mocks.replace).toHaveBeenCalledWith("/apps/site/provisioning")
    })

    it("reports unsupported catalogue entries and failed create or publish", async () => {
        mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [{ id: "other", name: "Other", templateKey: "other" }] })
        render(<TemplateAppProvisioning context={{ mode: "new", templateKey: "other" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"unsupported"'))
        fireEvent.click(screen.getByTestId("act"))
        expect(mocks.push).toHaveBeenCalledWith("/apps")

        cleanup()
        resetQueryCache()
        mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [item] })
        mocks.api.createExpertSite.mockResolvedValue({ ok: false, reason: "create-failed" })
        render(<TemplateAppProvisioning context={{ mode: "new", templateKey: "ai_academy" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        fireEvent.change(screen.getByTestId("slug"), { target: { value: "alpha" } })
        fireEvent.click(screen.getByTestId("submit"))
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
    })

    it("settles deployment snapshots into accepted, preparing, ready and failed", async () => {
        const resume = (value: unknown) => mocks.api.myExpertSiteDeployment.mockResolvedValue(value)
        resume({ ok: true, data: null })
        const accepted = render(<TemplateAppProvisioning context={{ mode: "resume", siteId: "site" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"accepted"'))
        accepted.unmount()
        resetQueryCache()

        resume({ ok: true, data: { id: "deployment", status: "pending", publicHost: null } })
        const preparing = render(<TemplateAppProvisioning context={{ mode: "resume", siteId: "site" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"preparing"'))
        preparing.unmount()
        resetQueryCache()

        resume({ ok: true, data: { id: "deployment", status: "running", publicHost: "alpha.vn" } })
        const ready = render(<TemplateAppProvisioning context={{ mode: "resume", siteId: "site" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        ready.unmount()
        resetQueryCache()

        resume({ ok: true, data: { id: "deployment", status: "failed", publicHost: null } })
        render(<TemplateAppProvisioning context={{ mode: "resume", siteId: "site" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
    })

    it("maps deployment realtime events to ready and failed", async () => {
        mocks.api.myExpertSiteDeployment.mockResolvedValue({ ok: true, data: { id: "deployment", status: "pending", publicHost: null } })
        const view = render(<TemplateAppProvisioning context={{ mode: "resume", siteId: "site" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"preparing"'))
        mocks.realtime = { status: "event", event: { kind: "deployment", id: "deployment", status: "ready" } }
        view.rerender(<TemplateAppProvisioning context={{ mode: "resume", siteId: "site" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        mocks.realtime = { status: "event", event: { kind: "deployment", id: "deployment", status: "failed", reason: "deploy-broken" } }
        view.rerender(<TemplateAppProvisioning context={{ mode: "resume", siteId: "site" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
    })

    it("routes ready and failed deployment actions back to apps", async () => {
        mocks.api.myExpertSiteDeployment.mockResolvedValue({ ok: true, data: { id: "deployment", status: "running", publicHost: "alpha.vn" } })
        render(<TemplateAppProvisioning context={{ mode: "resume", siteId: "site" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("act"))
        expect(mocks.push).toHaveBeenCalledWith("/apps/site")

        cleanup()
        resetQueryCache()
        mocks.api.myExpertSiteDeployment.mockResolvedValue({ ok: false, reason: "snapshot-down" })
        render(<TemplateAppProvisioning context={{ mode: "resume", siteId: "site" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        fireEvent.click(screen.getByTestId("act"))
        expect(mocks.push).toHaveBeenCalledWith("/apps")
    })
})
