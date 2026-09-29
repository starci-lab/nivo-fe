import { describe, expect, it } from "vitest"

import {
    readAccountingEvidence
} from "./index"
import { accountingSpec } from "./spec-helpers"
const { TOKEN, INTENT, SCOPE, answerWith } = accountingSpec

describe("accounting", () => {
    it("sends nothing at all without an access token", async () => {
        expect(await readAccountingEvidence(null, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "UNAUTHENTICATED",
            requestId: null,
        })
        expect(accountingSpec.fetchMock).not.toHaveBeenCalled()
    })

    it("refuses an intent identity the route itself would reject, before any request", async () => {
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, "")).toMatchObject({
            ok: false,
            code: "BAD_REQUEST",
        })
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, "x".repeat(513))).toMatchObject(
            { ok: false, code: "BAD_REQUEST" },
        )
        expect(accountingSpec.fetchMock).not.toHaveBeenCalled()
    })

    it("reports a refused bearer token as UNAUTHENTICATED rather than as a served answer", async () => {
        answerWith(401, { kind: "UNAUTHENTICATED" })
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "UNAUTHENTICATED",
        })
    })

    it("fails closed when the transport or the body is not an answer at all", async () => {
        accountingSpec.fetchMock.mockRejectedValueOnce(new Error("socket closed"))
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "UNREACHABLE",
        })
        accountingSpec.fetchMock.mockResolvedValueOnce({
            status: 200,
            json: async () => {
                throw new Error("not json")
            },
        })
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
        answerWith(200, "not an envelope")
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
    })

})
