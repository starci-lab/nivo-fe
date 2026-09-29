import { describe, expect, it } from "vitest"

import {
    parseAcademyCourseAccess,
    parseAcademyCredentialSaveResult,
    parseAcademyCustomDomainState,
    parseAcademyGrowthSnapshot,
    parseAcademyIntegrations,
    parseAcademyProviderStatus,
    parseAcademyStudent,
    parseAcademyStudentDetail,
    parseAcademyStudentsPage,
    parseAcademyWebhookSecretResult,
    parseAcademyWebhookStatus,
    parseAcademyZaloAuthorization,
    parseDraftedLeadReply,
    parseExpertSiteLead,
    parseExpertSiteLeads,
    parseRevokedAcademyCourseAccess,
} from "./payload.guards"

const student = { id: "s-1", name: "A", email: "a@x", role: "member", status: "active", xp: 0 }

const provider = {
    provider: "google",
    status: "configured",
    clientId: null,
    identifier: null,
    consentMode: null,
    reason: null,
    deliveredAt: null,
    verifiedAt: null,
}

const webhook = {
    id: "w-1",
    endpoint: "https://x",
    events: ["e"],
    enabled: true,
    version: 1,
    lastDeliveryStatus: null,
    lastDeliveredAt: null,
}

const credential = {
    key: "k",
    configured: true,
    hint: null,
    syncedAt: null,
    verification: "ok",
    verificationReason: null,
    verifiedAt: null,
}

describe("parseAcademyGrowthSnapshot", () => {
    it("refuses a snapshot whose counters are not all numbers", () => {
        const snapshot = { revenueVnd: 0, paidOrders: 0, totalMembers: 0, activeMembers: 0, totalCompletions: 0 }
        expect(parseAcademyGrowthSnapshot(snapshot)).toEqual(snapshot)
        expect(parseAcademyGrowthSnapshot({ ...snapshot, activeMembers: "all" })).toBeNull()
    })
})

describe("parseAcademyStudent", () => {
    it("refuses a student missing its experience counter", () => {
        expect(parseAcademyStudent(student)).toEqual(student)
        expect(parseAcademyStudent({ ...student, xp: "none" })).toBeNull()
    })
})

describe("parseAcademyStudentsPage", () => {
    it("refuses a page whose rows are not a list of students", () => {
        expect(parseAcademyStudentsPage({ items: [student], total: 1 })).not.toBeNull()
        expect(parseAcademyStudentsPage({ items: "many", total: 1 })).toBeNull()
        expect(parseAcademyStudentsPage({ items: [student] })).toBeNull()
    })
})

describe("parseAcademyStudentDetail", () => {
    it("refuses a detail whose member or ledger rows are malformed", () => {
        const detail = {
            member: { id: "s-1", name: "A", email: "a@x", role: "member", status: "active" },
            orders: [{ id: "o-1", courseSlug: "c", status: "paid", amountVnd: 1 }],
            courses: [{ slug: "c", title: "C", completed: 1, total: 2 }],
        }
        expect(parseAcademyStudentDetail(detail)).not.toBeNull()
        expect(parseAcademyStudentDetail({ ...detail, orders: [{}] })).toBeNull()
        expect(parseAcademyStudentDetail({ ...detail, member: { ...detail.member, role: 7 } })).toBeNull()
    })
})

describe("parseAcademyProviderStatus", () => {
    it("refuses a provider status missing its provider key", () => {
        expect(parseAcademyProviderStatus(provider)).not.toBeNull()
        expect(parseAcademyProviderStatus({ ...provider, provider: 3 })).toBeNull()
    })
})

describe("parseAcademyWebhookStatus", () => {
    it("refuses a webhook whose events are not a string list", () => {
        expect(parseAcademyWebhookStatus(webhook)).not.toBeNull()
        expect(parseAcademyWebhookStatus({ ...webhook, events: "all" })).toBeNull()
    })
})

describe("parseAcademyWebhookSecretResult", () => {
    it("refuses a revealed-secret answer without the secret handle or a malformed webhook", () => {
        expect(parseAcademyWebhookSecretResult({ ...webhook, signingSecret: "sec" })).not.toBeNull()
        expect(parseAcademyWebhookSecretResult(webhook)).toBeNull()
        expect(parseAcademyWebhookSecretResult({ ...webhook, events: "all", signingSecret: "sec" })).toBeNull()
    })
})

describe("parseAcademyCustomDomainState", () => {
    it("refuses a domain state missing its delivery verdict", () => {
        const state = { domain: null, target: "t", dnsReady: false, delivery: "d", detail: "x" }
        expect(parseAcademyCustomDomainState(state)).toEqual(state)
        expect(parseAcademyCustomDomainState({ ...state, delivery: null })).toBeNull()
    })
})

describe("parseAcademyIntegrations", () => {
    const integrations = {
        credentials: [credential],
        customDomain: null,
        google: provider,
        zalo: provider,
        analytics: [],
        webhooks: [webhook],
    }

    it("refuses a payload whose credential rows or providers are malformed", () => {
        expect(parseAcademyIntegrations(integrations)).not.toBeNull()
        expect(parseAcademyIntegrations({ ...integrations, credentials: [{}] })).toBeNull()
        expect(parseAcademyIntegrations({ ...integrations, google: {} })).toBeNull()
        expect(parseAcademyIntegrations({ ...integrations, customDomain: { domain: null } })).toBeNull()
    })
})

describe("parseExpertSiteLead / parseExpertSiteLeads", () => {
    const lead = { id: "l-1", name: "A", contact: "c", message: null, status: "new", note: null }

    it("refuses a lead missing its contact", () => {
        expect(parseExpertSiteLead(lead)).toEqual(lead)
        expect(parseExpertSiteLeads([lead])).toHaveLength(1)
        expect(parseExpertSiteLeads([{ ...lead, contact: null }])).toBeNull()
    })
})

describe("parseDraftedLeadReply", () => {
    it("refuses a draft answer without a reply", () => {
        expect(parseDraftedLeadReply({ reply: "r" })).toEqual({ reply: "r" })
        expect(parseDraftedLeadReply({ reply: 1 })).toBeNull()
    })
})

describe("parseAcademyCourseAccess", () => {
    it("refuses a grant answer missing its slug", () => {
        const access = { id: "g-1", email: "a@x", courseSlug: "c", status: "granted" }
        expect(parseAcademyCourseAccess(access)).toEqual(access)
        expect(parseAcademyCourseAccess({ ...access, courseSlug: null })).toBeNull()
    })
})

describe("parseRevokedAcademyCourseAccess", () => {
    it("refuses a revocation count that is not a number", () => {
        expect(parseRevokedAcademyCourseAccess({ revoked: 1, keptPaidPurchase: true })).not.toBeNull()
        expect(parseRevokedAcademyCourseAccess({ revoked: true, keptPaidPurchase: true })).toBeNull()
    })
})

describe("parseAcademyCredentialSaveResult", () => {
    it("refuses a save result whose credential row is malformed", () => {
        const result = { credential, delivery: "d", detail: "x" }
        expect(parseAcademyCredentialSaveResult(result)).not.toBeNull()
        expect(parseAcademyCredentialSaveResult({ ...result, credential: {} })).toBeNull()
        expect(parseAcademyCredentialSaveResult({ ...result, delivery: null })).toBeNull()
    })
})

describe("parseAcademyZaloAuthorization", () => {
    it("refuses an authorization answer without the URL", () => {
        expect(parseAcademyZaloAuthorization({ authorizationUrl: "u", expiresAt: "t" })).not.toBeNull()
        expect(parseAcademyZaloAuthorization({ expiresAt: "t" })).toBeNull()
    })
})
