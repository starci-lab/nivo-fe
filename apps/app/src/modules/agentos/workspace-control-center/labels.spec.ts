import type { useTranslations } from "next-intl"
import { describe, expect, it } from "vitest"
import { createAgentOSWorkspaceControlCenterLabels } from "./labels"

const makeTranslator = () =>
    Object.assign(
        <Key extends string>(key: Key, ...values: Array<unknown>) => {
            void values
            return key
        },
        {
            rich: <Key extends string>(key: Key, ...values: Array<unknown>) => {
                void values
                return key
            },
            markup: <Key extends string>(key: Key, ...values: Array<unknown>) => {
                void values
                return key
            },
            raw: <Key extends string>(key: Key) => key,
            has: <Key extends string>(key: Key) => key.length >= 0,
        },
    )
const t: ReturnType<typeof useTranslations<"console.agentos.workspace">> = makeTranslator()
const s: ReturnType<typeof useTranslations<"console.agentos.shell">> = makeTranslator()

describe("createAgentOSWorkspaceControlCenterLabels", () => {
    it("resolves workspace and shell copy through their own namespaces", () => {
        const labels = createAgentOSWorkspaceControlCenterLabels(t, s)

        expect(labels.titleFallback).toBe("titleFallback")
        expect(labels.shell.inventorySection).toBe("inventory.section")
        expect(labels.tabs[2]).toEqual({ id: "ai-knowledge", label: "tabs.ai-knowledge" })
    })
})
