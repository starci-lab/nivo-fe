import { describe, expect, it } from "vitest"
import {
    MUTATION_AGENTOS_CUSTOM_MODULE_INTAKE_SWR_KEY,
    MUTATION_CHATBOT_BIND_CHANNEL_SWR_KEY,
    MUTATION_INVOICE_PAY_SWR_KEY,
    MUTATION_WORKSPACE_CHECKOUT_START_SWR_KEY,
    QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY,
    QUERY_AGENTOS_MODULE_RUNTIME_SWR_KEY,
    QUERY_CATALOG_ITEMS_SWR_KEY,
    QUERY_COLLAB_COMMANDS_SWR_KEY,
    QUERY_COLLAB_GROUP_SWR_KEY,
    QUERY_COLLAB_NOTICES_SWR_KEY,
    QUERY_COLLAB_OFFICE_SWR_KEY,
    QUERY_COLLAB_RECONCILE_SWR_KEY,
    QUERY_COLLAB_SWR_KEY,
    QUERY_COLLAB_TASKS_SWR_KEY,
    QUERY_COLLAB_TASK_SWR_KEY,
    QUERY_DOMAINS_SWR_KEY,
    QUERY_INSTANCES_SWR_KEY,
    QUERY_POD_OPENCLAW_STATUS_SWR_KEY,
    QUERY_WALLET_SWR_KEY,
    QUERY_WALLET_TRANSACTIONS_SWR_KEY,
    collabDomainKeys,
} from "./swr.shared"

describe("shared SWR identities", () => {
    it("keeps the account query keys stable", () => {
        expect(QUERY_INSTANCES_SWR_KEY).toEqual(["instances"])
        expect(QUERY_DOMAINS_SWR_KEY).toEqual(["domains"])
        expect(QUERY_WALLET_SWR_KEY).toEqual(["wallet"])
        expect(QUERY_WALLET_TRANSACTIONS_SWR_KEY).toEqual(["wallet-transactions"])
        expect(QUERY_POD_OPENCLAW_STATUS_SWR_KEY).toEqual(["pod-openclaw-status"])
        expect(QUERY_CATALOG_ITEMS_SWR_KEY("site_from_template")).toEqual(["catalog-items", "site_from_template"])
    })

    it("keeps parameterized console and Academy projections distinct", () => {
        expect(QUERY_AGENTOS_MODULE_RUNTIME_SWR_KEY("ws-1", "module-1", true)).toEqual([
            "agentos",
            "module-runtime",
            "ws-1",
            "module-1",
            true,
        ])
        expect(QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY("site-1", "member-1")).toEqual([
            "academy",
            "student",
            "site-1",
            "member-1",
        ])
    })

    it("keeps each Collab projection workspace scoped and filter qualified", () => {
        expect(QUERY_COLLAB_SWR_KEY).toEqual(["collab"])
        expect(QUERY_COLLAB_OFFICE_SWR_KEY("ws-1")).toEqual(["collab", "office", "ws-1"])
        expect(QUERY_COLLAB_GROUP_SWR_KEY("ws-1", "c-1")).toEqual(["collab", "group", "ws-1", "c-1"])
        expect(QUERY_COLLAB_TASKS_SWR_KEY("ws-1")).toEqual([
            "collab",
            "tasks",
            "ws-1",
            null,
            null,
            null,
            null,
            null,
        ])
        expect(QUERY_COLLAB_TASKS_SWR_KEY("ws-1", { status: "working" })).not.toEqual(
            QUERY_COLLAB_TASKS_SWR_KEY("ws-1"),
        )
        expect(QUERY_COLLAB_TASK_SWR_KEY("ws-1", "task-1")).toEqual(["collab", "task", "ws-1", "task-1"])
        expect(QUERY_COLLAB_COMMANDS_SWR_KEY("ws-1", "Sales")).toEqual(["collab", "commands", "ws-1", "Sales"])
        expect(QUERY_COLLAB_NOTICES_SWR_KEY("ws-1")).toEqual(["collab", "notices", "ws-1", null])
        expect(QUERY_COLLAB_RECONCILE_SWR_KEY("ws-1", "intent-1")).toEqual([
            "collab",
            "reconcile",
            "ws-1",
            "intent-1",
        ])
        expect(collabDomainKeys("ws-1", ["tasks"])(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-1"])).toBe(
            true,
        )
        expect(collabDomainKeys("ws-1", ["tasks"])(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-2"])).toBe(
            false,
        )
    })

    it("keeps mutation identities separate from the reads they invalidate", () => {
        expect(MUTATION_AGENTOS_CUSTOM_MODULE_INTAKE_SWR_KEY("ws-1")).toEqual([
            "agentos",
            "custom-module-intake",
            "ws-1",
        ])
        expect(MUTATION_CHATBOT_BIND_CHANNEL_SWR_KEY("ws-1", "install-1")).toEqual([
            "chatbot",
            "bind-channel",
            "ws-1",
            "install-1",
        ])
        expect(MUTATION_INVOICE_PAY_SWR_KEY).toEqual(["invoice-pay"])
        expect(MUTATION_WORKSPACE_CHECKOUT_START_SWR_KEY).toEqual(["workspace-checkout", "start"])
    })
})
