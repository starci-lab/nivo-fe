import { describe, expect, it, vi } from "vitest"
import type { AgentOSFlow } from "./index"
import { agentOSProvisioningView } from "./view"

const messages: Readonly<Record<string, string>> = {
    "agentos.progressLabel": "Progress",
    "agentos.continuationLabel": "Continue setup",
    "agentos.productName": "AgentOS",
    "agentos.chooseOffer": "Choose a package",
    "agentos.requestTitle": "Request workspace",
    "agentos.requestText": "Select a package",
    "agentos.submit": "Continue",
    "agentos.selectionLabel": "Packages",
    "agentos.chooseTier": "Choose tier",
    "agentos.selected": "Selected",
}
const translate = Object.assign((key: string) => {
    const message = messages[key]
    if (message === undefined) throw new Error(`Missing test message ${key}`)
    return message
}, { has: (key: string) => key in messages })

describe("agentOSProvisioningView", () => {
    it("binds the current offer and its action to the request card", () => {
        const flow: AgentOSFlow = {
            phase: "request",
            catalogue: [
                {
                    offerId: "offer-1",
                    offerVersion: "v1",
                    displayName: "Workspace",
                    includedOutcome: "Workspace access",
                    amount: "1000",
                    currency: "USD",
                    billingCadence: "monthly",
                    renewalMode: "manual",
                    eligibility: "current",
                },
            ],
            offer: null,
            verdict: "current",
        }
        const view = agentOSProvisioningView({
            flow,
            steps: [],
            t: translate,
            tShared: Object.assign((key: string) => {
                throw new Error(`Unexpected shared copy ${key}`)
            }, { has: () => false }),
            readiness: undefined,
            readinessFailure: null,
            realtimeStatus: "disconnected",
            entryRefusal: null,
            reconciling: false,
            entryPending: false,
            aiRetryPending: false,
            amountOf: () => "USD 1,000",
            actions: {
                submit: vi.fn(),
                selectOffer: vi.fn(),
                statusAction: vi.fn(),
                enterWorkspace: vi.fn(),
                retryAiReadiness: vi.fn(),
                backToAgentOS: vi.fn(),
                watchPurchase: vi.fn(),
            },
        })
        expect(view.state).toBe("request")
        expect(view.props.requestActionDisabled).toBe(true)
        expect(view.props.selection?.offers[0]).toMatchObject({ id: "offer-1", description: "USD 1,000 · Workspace access" })
    })
})
