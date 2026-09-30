import { AgentChannelProvider, type ConfigureAgentWorkspaceChannelMutationVariables, type ManageAgentosModuleRuntimeMutationVariables, type MyAgentosModuleRuntimeQuery } from "@/modules/api/__generated__/core"
import type { AgentWorkspaceChannelSettingView } from "@/modules/api/agentos-module-runtime"
import { type Outcome } from "@nivo/api"

export { createShellObservationStore, runShellReads } from "@/modules/agentos/shell-read-pipeline"

/*
 * The module page's shared command machinery (the connected AgentOSSolutionModulePage hooks).
 *
 * SETTLE POLLS ARE SWR POLLS, NOT LOOPS. A settle wait registers a predicate on the runtime query
 * and the query's `refreshInterval` re-reads while one is outstanding; unmounting the page cancels
 * the interval outright, and a newer wait resolves the abandoned one with null.
 */

/** One command attempt's dedupe identity: a fresh key per press, never reused. */
export const idempotencyKey = (): string => globalThis.crypto.randomUUID()

/** How often a settle poll re-reads the runtime projection. */
export const MODULE_SETTLE_INTERVAL_MS = 1000
/** Maximum settle reads for one wait; controller AI turns may use the provider's full request budget. */
export const MODULE_SETTLE_ATTEMPTS = 90

/** The lowercase hex SHA-256 of one value, for evidence digests the backend compares verbatim. */
export const sha256 = async (value: string): Promise<string> =>
    Array.from(new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")

/** The Telegram bot account id a bot token encodes, or null when the token is not shaped like one. */
const telegramAccountIdFromToken = (token: string): string | null => {
    const separator = token.indexOf(":")
    const accountId = separator > 0 ? token.slice(0, separator) : ""
    return /^\d{5,20}$/u.test(accountId) ? accountId : null
}

/** One source attachment the owner indexed for citation, by id and content hash only. */
export interface IndexedSourceAttachment {
    readonly attachmentId: string
    readonly sha256: string
}

/**
 * The citations and evidence digest one owner confirmation submits for a requirement.
 * An attachment-content policy attaches every indexed source under its owner-approved locator;
 * a `none` policy sends no citations at all.
 */
export const confirmationEvidence = async (
    draftDigest: string,
    requirementKey: string,
    citationPolicy: "none" | "attachment-content",
    attachments: ReadonlyArray<IndexedSourceAttachment>,
): Promise<{
    readonly citations: ReadonlyArray<IndexedSourceAttachment & { readonly locator: string }>
    readonly evidenceDigest: string
}> => {
    const citations =
        citationPolicy === "attachment-content"
            ? attachments.map((attachment) => ({ ...attachment, locator: "owner-approved-source" }))
            : []
    return {
        citations,
        evidenceDigest: await sha256(JSON.stringify({ draftDigest, requirementKey, passed: true, citations })),
    }
}

/** The command surface a module credential save needs from its owning page. */
interface ModuleCredentialEnvironment {
    readonly workspaceId: string
    readonly installationId: string
    readonly displayName: string
    readonly configureChannel: (
        input: ConfigureAgentWorkspaceChannelMutationVariables["input"],
    ) => Promise<Outcome<AgentWorkspaceChannelSettingView>>
    readonly perform: ModuleRuntimeControls["perform"]
    readonly setPending: (pending: boolean) => void
    readonly setActionRefused: (refused: boolean) => void
}

/**
 * Persist one module credential. The telegram bot token is a workspace channel, so it is applied
 * to the controller first and only then stored on the module; every other key is stored directly.
 * A refusal at either hop marks the shared refused surface and writes nothing further.
 */
export const saveModuleCredential = async (
    environment: ModuleCredentialEnvironment,
    credentialKey: string,
    credentialValue: string,
): Promise<void> => {
    const { workspaceId, installationId, displayName, configureChannel, perform, setPending, setActionRefused } =
        environment
    if (credentialKey === "telegram-bot-token") {
        const accountId = telegramAccountIdFromToken(credentialValue)
        if (accountId === null) {
            setActionRefused(true)
            return
        }
        setPending(true)
        setActionRefused(false)
        const channel = await configureChannel({
            agentWorkspaceId: workspaceId,
            provider: AgentChannelProvider.Telegram,
            accountId,
            displayName,
            credentials: [{ key: "TELEGRAM_BOT_TOKEN", value: credentialValue }],
        })
        setPending(false)
        if (!channel.ok || channel.data.state !== "APPLIED") {
            setActionRefused(true)
            return
        }
        const saved = await perform({
            action: "SAVE_MODULE_CREDENTIAL",
            installationId,
            idempotencyKey: idempotencyKey(),
            credentialKey,
            credentialValue,
        })
        if (saved === null) return
        await perform({
            action: "UPDATE_SETTINGS",
            installationId,
            idempotencyKey: idempotencyKey(),
            settings: saved.settings ?? {},
            operatingMode: saved.installation.operatingMode,
            channelAccountRef: `TELEGRAM:${accountId}`,
        })
        return
    }
    await perform({
        action: "SAVE_MODULE_CREDENTIAL",
        installationId,
        idempotencyKey: idempotencyKey(),
        credentialKey,
        credentialValue,
    })
}

/**
 * The pending/refused surface and the runtime-scoped commands sibling hooks share. One page owns
 * one pending flag across setup, operate, test and settings actions, exactly as the connected
 * state machine did before it was split.
 */
export interface ModuleRuntimeControls {
    readonly pending: boolean
    readonly setPending: (pending: boolean) => void
    readonly setActionRefused: (refused: boolean) => void
    readonly perform: (
        input: ManageAgentosModuleRuntimeMutationVariables["input"],
        markRefused?: boolean,
    ) => Promise<NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]> | null>
    readonly settleRuntime: (
        settled: (candidate: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>) => boolean,
        markRefused?: boolean,
    ) => Promise<NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]> | null>
}
