import type {
    AgentosModuleRuntime,
    AgentosRuntimeContextVersion,
    AgentosRuntimeMessage,
    AgentosRuntimeSession,
} from "../modules/api/agentos-module-runtime"
import type { AgentosModuleTestRun, AgentosModuleTestSurface } from "@/modules/api/agentos-module-tests"
import type {
    CollabBindingView,
    CollabMessageView,
    CollabRouteOutcome,
    CollabTaskQuestionView,
    CollabTaskView,
} from "@/modules/api/collab"
import { type Failure } from "@nivo/api"
import type { Session, SessionState } from "@/modules/auth/session"

/** Run an invocation that calls a mock, then read that mock's typed returned fixture. */
type RecordedResult<T> =
    | { readonly type: "return"; readonly value: T }
    | { readonly type: "throw"; readonly value: unknown }
    | { readonly type: "incomplete"; readonly value: undefined }

type MockWithResults<T> = { readonly mock: { readonly results: ReadonlyArray<RecordedResult<T>> } }

/** Invoke code that calls a mock once, then return the value that mock produced, failing if it did not return. */
export const runAndReadMock = <T>(invoke: () => unknown, mock: MockWithResults<T>): T => {
    invoke()
    const result = mock.mock.results.at(-1)
    if (result?.type !== "return") throw new Error("The mock did not return a value")
    return result.value
}

/** The loose call signature a mocked query hook records its arguments with. */
export type QueryMockCallback = (...args: Array<unknown>) => unknown

/** The options a mocked query hook accepts: how it decides when to poll again. */
export type QueryMockOptions = {
    readonly refreshInterval?: (data: unknown, error?: unknown) => number
}

/** The options a mocked mutation hook accepts: what it invalidates and whether an answer should. */
export type MutationMockOptions = {
    readonly invalidates?: (input: unknown, answer: unknown) => unknown
    readonly shouldInvalidate?: (answer: unknown) => boolean
}

/** Couple a mocked API answer to the operation whose contract it must satisfy. */
export const apiAnswer = <TArgs extends Array<unknown>, TAnswer>(
    operation: (...args: TArgs) => Promise<TAnswer>,
    answer: TAnswer,
): TAnswer => answer

/** The failure branch of an API outcome, as spec fixtures build it. */
type ApiFailure = Failure

/** Build a retryable "source unavailable" API failure for specs, with an overridable reason and code. */
export const unavailableFailure = (reason = "unavailable", code = "UNAVAILABLE"): ApiFailure => ({
    ok: false,
    kind: "unavailable",
    status: null,
    code,
    reason,
    retryable: true,
})

/** The session state a fixture session is built over. */
export type { SessionState }
/** The session contract a fixture session satisfies. */
export type { Session }
/** A collab task view, as the fixtures build it. */
export type { CollabTaskView }
/** A collab task question view, as the fixtures build it. */
export type { CollabTaskQuestionView }
/** A collab message view, as the fixtures build it. */
export type { CollabMessageView }
/** A collab command binding view, as the fixtures build it. */
export type { CollabBindingView }
/** The routing outcome of a collab message, as the fixtures build it. */
export type { CollabRouteOutcome }
/** One module test run, as the fixtures build it. */
export type { AgentosModuleTestRun }
/** One module test surface, as the fixtures build it. */
export type { AgentosModuleTestSurface }

/** Build a session over a given state whose operations do nothing, for specs that only read the state. */
export const sessionFixture = (state: SessionState): Session => ({
    state,
    adopt: () => undefined,
    end: async () => ({ localCleared: true, remoteRevocation: "unknown", authorityEnding: "notAsked" }),
    discard: () => undefined,
})

/** Build a `window.matchMedia` stand-in that answers every query with one fixed or computed match. */
export const matchMediaFixture =
    (matches: boolean | ((media: string) => boolean)): typeof window.matchMedia =>
    (media) => {
        const value = typeof matches === "function" ? matches(media) : matches
        return {
            matches: value,
            media,
            onchange: null,
            addListener: () => undefined,
            removeListener: () => undefined,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            dispatchEvent: () => true,
        }
    }

/** Build a collab task view with plain placeholder values, overridable field by field. */
export const collabTaskFixture = (overrides: Partial<CollabTaskView> = {}): CollabTaskView => ({
    taskId: "task-fixture",
    workspaceId: "workspace-fixture",
    groupId: "group-fixture",
    bindingId: null,
    cardMessageId: null,
    intentId: "intent-fixture",
    statement: "Fixture task",
    owningModuleInstallationId: "installation-fixture",
    owningModuleKey: overrides.owningModuleKey ?? "fixture-module",
    owningModuleDisplayName: overrides.owningModuleDisplayName ?? "Fixture module",
    askedByMemberId: "member-fixture",
    askedByDisplayName: null,
    assignedToMemberId: null,
    assignedToDisplayName: null,
    routingRuleId: null,
    status: "created",
    version: 1,
    waiting: null,
    outcome: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
})

/** Build an open collab task question with plain placeholder values, overridable field by field. */
export const collabQuestionFixture = (overrides: Partial<CollabTaskQuestionView> = {}): CollabTaskQuestionView => ({
    questionId: overrides.questionId ?? "question-fixture",
    workspaceId: "workspace-fixture",
    taskId: "task-fixture",
    moduleInstallationId: "installation-fixture",
    body: overrides.body ?? "Fixture question",
    status: "open",
    answerMessageId: null,
    askedAt: "2026-09-01T00:00:00.000Z",
    answeredAt: null,
    ...overrides,
})

/** Build a human-authored collab message with plain placeholder values, overridable field by field. */
const collabMessageFixture = (overrides: Partial<CollabMessageView> = {}): CollabMessageView => ({
    messageId: "message-fixture",
    workspaceId: "workspace-fixture",
    groupId: "group-fixture",
    authorKind: "human",
    authorMemberId: "member-fixture",
    authorModuleInstallationId: null,
    body: "Fixture message",
    intentId: "intent-fixture",
    addressedModuleInstallationId: null,
    addressedModuleKey: null,
    answersQuestionId: null,
    occurredAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
})

/** Build the routing outcome of a message: not addressed to a module, or admitted with its binding. */
export const collabRouteFixture = (kind: "not-addressed" | "admitted"): CollabRouteOutcome =>
    kind === "not-addressed"
        ? { kind, message: collabMessageFixture() }
        : {
              kind,
              message: collabMessageFixture({ messageId: "message-admitted" }),
              binding: {
                  bindingId: "binding-fixture",
                  workspaceId: "workspace-fixture",
                  groupId: "group-fixture",
                  sourceMessageId: "message-admitted",
                  intentId: "intent-fixture",
                  receiverModuleInstallationId: "installation-fixture",
                  receiverModuleKey: "fixture-module",
                  commandName: "fixture.command",
                  commandVersion: "1",
                  askerMemberId: "member-fixture",
                  routingRuleId: null,
                  status: "admitted",
                  receipt: { disposition: "not-yet-reported" },
              },
          }

/** Build a module test surface around one run whose fields the spec overrides, with an empty scenario contract by default. */
export const moduleTestSurfaceFixture = (
    runOverrides: Partial<AgentosModuleTestRun>,
    contract?: AgentosModuleTestSurface["contract"],
): AgentosModuleTestSurface => {
    const run: AgentosModuleTestRun = {
        id: "run-fixture",
        installationId: "installation-fixture",
        moduleDefinitionId: "module-definition-fixture",
        contextVersionId: null,
        setupSessionId: null,
        draftDigest: null,
        requestedByUserId: "user-fixture",
        kindKey: "fixture-kind",
        kindVersion: "1",
        testContractKey: "fixture-contract",
        testContractVersion: "1",
        scenarioKey: "fixture-scenario",
        mode: "exploratory",
        definitionDigest: "definition-fixture",
        targetDigest: "target-fixture",
        authorityGeneration: 0,
        sourceGeneration: 0,
        retrievalGeneration: 0,
        status: "passed",
        scenarioInput: {},
        summary: {},
        completedAt: null,
        createdAt: "2026-09-01T00:00:00.000Z",
        ...runOverrides,
    }
    return {
        contract: contract ?? {
            workbench: { key: "fixture-workbench", version: "1" },
            contract: { key: "fixture-contract", version: "1" },
            sandboxAdapter: { key: "fixture-sandbox", version: "1" },
            evidenceWidget: { key: "fixture-evidence", version: "1" },
            scenarios: [],
        },
        runs: [],
        run,
        assertions: [],
    }
}

/** One module runtime projection as a spec fixture. */
export type { AgentosModuleRuntime }
/** One module runtime session row as a spec fixture. */
export type { AgentosRuntimeSession }
/** One module runtime message row as a spec fixture. */
export type { AgentosRuntimeMessage }
/** One module runtime context version as a spec fixture. */
export type { AgentosRuntimeContextVersion }

/** One applied context version with a frozen digest and generations. */
export const runtimeContextFixture = (
    overrides: Partial<AgentosRuntimeContextVersion> = {},
): AgentosRuntimeContextVersion => ({
    id: "context-fixture",
    installationId: "installation-fixture",
    createdByUserId: "user-fixture",
    version: 1,
    snapshot: {},
    digest: "digest-fixture",
    definitionDigest: "definition-fixture",
    authorityGeneration: 1,
    sourceGeneration: 1,
    retrievalGeneration: 1,
    sourceSetupSessionId: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
})

/** One setup or execute session row; the durable fields default to empty, not null-y noise. */
export const runtimeSessionFixture = (
    overrides: Partial<AgentosRuntimeSession> = {},
): AgentosRuntimeSession => ({
    id: "session-fixture",
    installationId: "installation-fixture",
    createdByUserId: "user-fixture",
    mode: "setup",
    title: "Session fixture",
    isArchived: false,
    setupRevision: null,
    setupStatus: null,
    draftSnapshot: null,
    draftDigest: null,
    gateEvidence: null,
    basedOnContextVersionId: null,
    completedAt: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
})

/** One conversation row bound to a session. */
export const runtimeMessageFixture = (
    overrides: Partial<AgentosRuntimeMessage> = {},
): AgentosRuntimeMessage => ({
    id: "message-fixture",
    sessionId: "session-fixture",
    actorUserId: "user-fixture",
    contextVersionId: null,
    role: "user",
    content: "fixture",
    messageTree: null,
    operationEventId: null,
    taskId: null,
    sequence: 1,
    createdAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
})

/**
 * One settled module runtime projection. `installation` takes partial overrides; every other
 * collection defaults to empty so a spec only states the rows it cares about.
 */
export const moduleRuntimeFixture = (
    overrides: Partial<Omit<AgentosModuleRuntime, "installation">> & {
        readonly installation?: Partial<AgentosModuleRuntime["installation"]>
    } = {},
): AgentosModuleRuntime => {
    const { installation, ...rest } = overrides
    return {
        installation: {
            id: "installation-fixture",
            agentWorkspaceId: "workspace-fixture",
            moduleKey: "fixture-module",
            moduleVersion: "1",
            displayName: "Fixture module",
            status: "ready",
            failureCode: null,
            createdAt: "2026-09-01T00:00:00.000Z",
            updatedAt: "2026-09-01T00:00:00.000Z",
            kindKey: "fixture-kind",
            kindVersion: "1",
            workbenchKey: "fixture-workbench",
            workbenchVersion: "1",
            runtimeManifest: {
                schemaVersion: 1,
                kind: { key: "fixture-kind", version: "1" },
                workbench: { key: "fixture-workbench", version: "1" },
                widgets: [],
                config: {},
            },
            settingsVersion: 1,
            setupAuthorityGeneration: 1,
            setupSourceGeneration: 1,
            setupRetrievalGeneration: 1,
            activeContextVersionId: null,
            liveEnabled: false,
            operatingMode: "assist",
            channelAccountRef: null,
            primaryOpsSessionId: null,
            ...installation,
        },
        setupSession: null,
        setupSessions: [],
        executeSessions: [],
        participants: [],
        messages: [],
        contextVersions: [],
        widgets: [],
        operationEvents: [],
        tasks: [],
        credentials: [],
        settings: null,
        diagnostics: {},
        ...rest,
    }
}
