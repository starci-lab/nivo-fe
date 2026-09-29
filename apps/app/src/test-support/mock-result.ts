/** Run an invocation that calls a mock, then read that mock's typed returned fixture. */
type RecordedResult<T> =
    | { readonly type: "return"; readonly value: T }
    | { readonly type: "throw"; readonly value: unknown }
    | { readonly type: "incomplete"; readonly value: undefined }

type MockWithResults<T> = { readonly mock: { readonly results: ReadonlyArray<RecordedResult<T>> } }

export const runAndReadMock = <T>(invoke: () => unknown, mock: MockWithResults<T>): T => {
    invoke()
    const result = mock.mock.results.at(-1)
    if (result?.type !== "return") throw new Error("The mock did not return a value")
    return result.value
}

export type QueryMockCallback = (...args: unknown[]) => unknown

export type QueryMockOptions = {
    readonly refreshInterval?: (data: unknown, error?: unknown) => number
}

export type MutationMockOptions = {
    readonly invalidates?: (input: unknown, answer: unknown) => unknown
    readonly shouldInvalidate?: (answer: unknown) => boolean
}

/** Couple a mocked API answer to the operation whose contract it must satisfy. */
export const apiAnswer = <TArgs extends unknown[], TAnswer>(
    operation: (...args: TArgs) => Promise<TAnswer>,
    answer: TAnswer,
): TAnswer => answer

export type ApiFailure = import("@/modules/api/outcome").Failure

export const unavailableFailure = (reason = "unavailable", code = "UNAVAILABLE"): ApiFailure => ({
    ok: false,
    kind: "unavailable",
    status: null,
    code,
    reason,
    retryable: true,
})

export type SessionState = import("@/modules/auth/session").SessionState
export type Session = import("@/modules/auth/session").Session
export type CollabTaskView = import("@/modules/api/collab").CollabTaskView
export type CollabTaskQuestionView = import("@/modules/api/collab").CollabTaskQuestionView
export type CollabMessageView = import("@/modules/api/collab").CollabMessageView
export type CollabBindingView = import("@/modules/api/collab").CollabBindingView
export type CollabRouteOutcome = import("@/modules/api/collab").CollabRouteOutcome
export type AgentosModuleTestRun = import("@/modules/api/agentos-module-tests").AgentosModuleTestRun
export type AgentosModuleTestSurface = import("@/modules/api/agentos-module-tests").AgentosModuleTestSurface

export const sessionFixture = (state: SessionState): Session => ({
    state,
    adopt: () => undefined,
    end: async () => ({ localCleared: true, remoteRevocation: "unknown", authorityEnding: "notAsked" }),
    discard: () => undefined,
})

export const matchMediaFixture = (matches: boolean | ((media: string) => boolean)): typeof window.matchMedia =>
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

export const collabMessageFixture = (overrides: Partial<CollabMessageView> = {}): CollabMessageView => ({
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
