import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { resolveCoreApiCapabilityUrl, uploadAgentosModuleAttachment } from "./agentos-module-studio"

const CAPABILITY = {
    uploadUrl: "/pods/self/module-document-uploads/document-1?signature=signed",
    uploadMethod: "PUT",
} as const

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => vi.unstubAllGlobals())

describe("resolveCoreApiCapabilityUrl", () => {
    it("resolves a backend-issued relative capability against the core origin, never the graphql path", () => {
        expect(resolveCoreApiCapabilityUrl("/pods/self/module-document-uploads/document-1?signature=signed")).toBe(
            "http://localhost:3068/pods/self/module-document-uploads/document-1?signature=signed",
        )
    })
})

describe("uploadAgentosModuleAttachment", () => {
    it("puts the bytes to the capability with the media type and no credential of any kind", async () => {
        fetchMock.mockResolvedValue({
            status: 200,
            json: async () => {
                throw new Error("empty body")
            },
        })
        const body = new Blob(["pdf"])

        expect(await uploadAgentosModuleAttachment(CAPABILITY, "application/pdf", body)).toEqual({
            ok: true,
            data: true,
        })

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
        expect(url).toBe("http://localhost:3068/pods/self/module-document-uploads/document-1?signature=signed")
        expect(init.method).toBe("PUT")
        expect(init.credentials).toBe("omit")
        expect(init.headers).toEqual({ "content-type": "application/pdf" })
        expect(init.body).toBe(body)
    })

    it("keeps the status a refused upload carried as its kind instead of one refusal for all", async () => {
        fetchMock.mockResolvedValue({ status: 403, json: async () => ({}) })
        expect(await uploadAgentosModuleAttachment(CAPABILITY, "application/pdf", new Blob(["pdf"]))).toMatchObject({
            ok: false,
            kind: "forbidden",
            status: 403,
        })

        fetchMock.mockResolvedValue({ status: 413, json: async () => ({}) })
        expect(await uploadAgentosModuleAttachment(CAPABILITY, "application/pdf", new Blob(["pdf"]))).toMatchObject({
            ok: false,
            kind: "invalid",
            status: 413,
        })

        fetchMock.mockResolvedValue({ status: 502, json: async () => ({}) })
        expect(await uploadAgentosModuleAttachment(CAPABILITY, "application/pdf", new Blob(["pdf"]))).toMatchObject({
            ok: false,
            kind: "unavailable",
            status: 502,
        })
    })

    it("reports a dead network as unavailable without a status", async () => {
        fetchMock.mockRejectedValue(new Error("offline"))
        expect(await uploadAgentosModuleAttachment(CAPABILITY, "application/pdf", new Blob(["pdf"]))).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "NETWORK",
            status: null,
        })
    })
})
