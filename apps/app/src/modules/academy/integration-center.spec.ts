import { describe, expect, it } from "vitest"
import type { AcademyIntegrations } from "../api/academy"
import {
    academyIntegrationCardFactsOf,
    academyIntegrationCommandOf,
    academyIntegrationFormFieldFactsOf,
    academyIntegrationStatusKeyOf,
    academyIntegrationToneOf,
} from "./integration-center"

const integrations: AcademyIntegrations = {
    credentials: [
        {
            key: "SMTP_HOST",
            configured: true,
            hint: null,
            syncedAt: null,
            verification: "verified",
            verificationReason: null,
            verifiedAt: null,
        },
    ],
    customDomain: { domain: "academy.example", target: "target.example", dnsReady: false, delivery: "pending", detail: "pending" },
    google: {
        provider: "google",
        status: "connected",
        clientId: "client-id",
        identifier: null,
        consentMode: null,
        reason: null,
        deliveredAt: null,
        verifiedAt: null,
    },
    zalo: {
        provider: "zalo",
        status: "pending",
        clientId: null,
        identifier: null,
        consentMode: null,
        reason: "pending",
        deliveredAt: null,
        verifiedAt: null,
    },
    analytics: [],
    webhooks: [],
}

describe("academy Integration Center projections", () => {
    it("keeps statuses closed and projects safe provider facts", () => {
        expect(academyIntegrationStatusKeyOf("unknown-wire-value")).toBe("absent")
        expect(academyIntegrationToneOf("pending")).toBe("warning")
        const cards = academyIntegrationCardFactsOf(integrations)
        expect(cards.find((card) => card.id === "domain")?.status).toBe("pending")
        expect(cards.find((card) => card.id === "smtp")?.status).toBe("verified")
        expect(cards.find((card) => card.id === "google")?.detail).toEqual({ kind: "text", value: "client-id" })
    })

    it("describes provider fields and builds normalized save commands", () => {
        expect(academyIntegrationFormFieldFactsOf("google").map((field) => field.name)).toEqual([
            "clientId",
            "clientSecret",
        ])
        expect(academyIntegrationCommandOf("domain", { domain: " academy.example " })).toEqual({
            kind: "domain",
            domain: "academy.example",
        })
        expect(academyIntegrationCommandOf("ga4", { consentMode: "unknown" })).toEqual({
            kind: "analytics",
            provider: "ga4",
            identifier: null,
            consentMode: "required",
        })
    })
})
