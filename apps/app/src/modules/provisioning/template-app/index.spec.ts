import { describe, expect, it } from "vitest"
import {
    deploymentPhase,
    settleDeployment,
    templateFlowFromAnswers,
    templateFlowWithDeploymentEvent,
    templateStepState,
} from "./index"

describe("Template App flow derivations", () => {
    it("maps the deployment owner's status without storing a mirrored phase", () => {
        expect(deploymentPhase("pending")).toBe("preparing")
        expect(deploymentPhase("running")).toBe("ready")
        expect(deploymentPhase("failed")).toBe("failed")
        expect(settleDeployment("site-1", "Academy", null, "failed")).toEqual({
            phase: "accepted",
            siteId: "site-1",
            subject: "Academy",
        })
    })

    it("derives supported and unsupported requests from the catalog answer", () => {
        const catalog = {
            ok: true as const,
            data: [
                { id: "academy", slug: "academy", name: "Academy", tagline: null, templateKey: "ai_academy", tiers: null },
                { id: "other", slug: "other", name: "Other", tagline: null, templateKey: "other", tiers: null },
            ],
        }
        const input = {
            resumeSiteId: null,
            catalog,
            deployment: undefined,
            accessReady: true,
            submitted: null,
            isSubmitting: false,
            failedLoad: "unavailable",
            failedProvision: "failed",
        }
        expect(templateFlowFromAnswers({ ...input, templateKey: "ai_academy" })).toEqual({ phase: "request", name: "Academy" })
        expect(templateFlowFromAnswers({ ...input, templateKey: "other" })).toEqual({ phase: "unsupported", name: "Other" })
    })

    it("derives the four visible step states", () => {
        expect(templateStepState(0, 2)).toBe("done")
        expect(templateStepState(2, 2)).toBe("current")
        expect(templateStepState(3, 2)).toBe("upcoming")
    })

    it("applies only the event for the displayed deployment", () => {
        const preparing = { phase: "preparing" as const, siteId: "site-1", deploymentId: "deployment-1", publicHost: null }
        expect(
            templateFlowWithDeploymentEvent(preparing, { id: "deployment-1", status: "ready", reason: null }, "failed"),
        ).toMatchObject({ phase: "ready", deploymentId: "deployment-1" })
        expect(
            templateFlowWithDeploymentEvent(preparing, { id: "deployment-9", status: "failed", reason: "wrong" }, "failed"),
        ).toBe(preparing)
    })
})
