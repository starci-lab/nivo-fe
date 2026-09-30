import type { ContextDraft } from "../../../components/blocks/agentos/ContextVersionBlock"
import type {
    AgentosModuleRuntime,
    AgentosRuntimeManifest,
    AgentosRuntimeSession,
} from "../../api/agentos-module-runtime"
import type { AgentosRuntimeValue } from "../../api/agentos-runtime-tree"
import type { AgentosModuleTestSurface } from "../../api/agentos-module-tests"
import type { ModulePageCopy } from "../module-page-copy"
import { runtimeValueText, stringSetting } from "./runtime-values"

const SETUP_GATE_LABELS: Readonly<Partial<Record<string, keyof ModulePageCopy["setup"]["gateLabels"]>>> = {
    businessIdentity: "businessIdentity",
    productsServices: "productsServices",
    supportScope: "supportScope",
    customerSegments: "customerSegments",
    channels: "channels",
    hoursAndSla: "hoursAndSla",
    escalationAndHandoff: "escalationAndHandoff",
    prohibitedCommitments: "prohibitedCommitments",
    privacyAndSensitiveData: "privacyAndSensitiveData",
    toneAndLanguage: "toneAndLanguage",
    automationPolicy: "automationPolicy",
    readinessOwnership: "readinessOwnership",
    accountingScope: "accountingScope",
    currencyAndLocale: "currencyAndLocale",
    sourceSystems: "sourceSystems",
    approvalPolicy: "approvalPolicy",
    approvalThresholds: "approvalThresholds",
    evidenceRequirements: "evidenceRequirements",
    prohibitedActions: "prohibitedActions",
    schedulingScope: "schedulingScope",
    timeZone: "timeZone",
    calendarSources: "calendarSources",
    participantRules: "participantRules",
    availabilityRules: "availabilityRules",
    conflictPolicy: "conflictPolicy",
    confirmationPolicy: "confirmationPolicy",
    reminderPolicy: "reminderPolicy",
    researchScope: "researchScope",
    sourcePolicy: "sourcePolicy",
    citationPolicy: "citationPolicy",
    confidencePolicy: "confidencePolicy",
    prohibitedClaims: "prohibitedClaims",
    freshnessPolicy: "freshnessPolicy",
}
const readableGate = (key: string, copy: ModulePageCopy): string => {
    const known = Object.hasOwn(SETUP_GATE_LABELS, key) ? SETUP_GATE_LABELS[key] : undefined
    return known === undefined ? copy.setup.unknownGate({ key }) : copy.setup.gateLabels[known]
}
type SetupRequirement = NonNullable<AgentosRuntimeManifest["setup"]>["requirements"][number]
type SetupGenerations = { readonly authority: number; readonly source: number; readonly retrieval: number }

/** The gates one setup session reports: required keys first, legacy fields or evidence keys after. */
const setupGatesFor = (
    session: AgentosModuleRuntime["setupSession"],
    requirements: ReadonlyArray<SetupRequirement>,
    legacyFields: ReadonlyArray<string>,
    generations: SetupGenerations,
    copy: ModulePageCopy,
): ContextDraft["gates"] => {
    const rawGates = session?.gateEvidence?.gates
    const evidence = Array.isArray(rawGates) ? rawGates : []
    const evidenceKeys = evidence.flatMap((candidate) =>
        candidate !== null &&
        typeof candidate === "object" &&
        !Array.isArray(candidate) &&
        typeof candidate.key === "string"
            ? [candidate.key]
            : [],
    )
    const fields =
        requirements.length > 0
            ? requirements.map((requirement) => requirement.key)
            : legacyFields.length > 0
              ? legacyFields
              : evidenceKeys
    return fields.map((key) => {
        const row = evidence.find(
            (candidate) =>
                candidate !== null &&
                typeof candidate === "object" &&
                !Array.isArray(candidate) &&
                candidate.key === key,
        )
        const requirement = requirements.find((candidate) => candidate.key === key)
        const confirmation = row?.confirmation
        const confirmed =
            confirmation !== null &&
            typeof confirmation === "object" &&
            !Array.isArray(confirmation) &&
            confirmation.draftDigest === session?.draftDigest &&
            confirmation.authorityGeneration === generations.authority &&
            confirmation.sourceGeneration === generations.source &&
            confirmation.retrievalGeneration === generations.retrieval
        return {
            key,
            label: requirement?.label ?? readableGate(key, copy),
            passed: row !== undefined && row.passed === true,
            ownerConfirmation: requirement?.ownerConfirmation ?? false,
            confirmed,
            citationPolicy: requirement?.citationPolicy ?? "none",
        }
    })
}

/** The fact lines one draft snapshot carries: explicit facts first, then the first entries. */
export const draftFactsFor = (
    snapshot: Readonly<Record<string, AgentosRuntimeValue>> | null,
): ReadonlyArray<string> => {
    if (snapshot === null) return []
    const rawFacts = snapshot.facts
    if (Array.isArray(rawFacts)) return rawFacts.filter((value): value is string => typeof value === "string")
    return Object.entries(snapshot)
        .filter(([key]) => key !== "summary")
        .slice(0, 4)
        .map(([key, value]) => `${key}: ${runtimeValueText(value)}`)
}

/**
 * Whether the required acceptance scenarios all passed against exactly this draft: the runs must
 * name this context or this session digest, and every generation the draft was built under.
 */
export const exactTestPassedFor = (
    testSurface: AgentosModuleTestSurface | null,
    runtime: AgentosModuleRuntime,
    context: AgentosModuleRuntime["contextVersions"][number] | null,
    sessionId: string,
    digest: string | null,
): boolean => {
    if (digest === null || context === null) return false
    const required =
        runtime.installation.runtimeManifest.setup?.requiredAcceptanceScenarios ??
        runtime.installation.runtimeManifest.test?.scenarios.map((scenario) => scenario.key) ??
        []
    if (required.length === 0) return false
    const passed = new Set(
        (testSurface?.runs ?? [])
            .filter(
                (run) =>
                    run.mode === "acceptance" &&
                    run.status === "passed" &&
                    (run.contextVersionId === context.id ||
                        (run.setupSessionId === sessionId && run.draftDigest === digest)) &&
                    run.definitionDigest === context.definitionDigest &&
                    run.targetDigest === digest &&
                    run.authorityGeneration === runtime.installation.setupAuthorityGeneration &&
                    run.sourceGeneration === runtime.installation.setupSourceGeneration &&
                    run.retrievalGeneration === runtime.installation.setupRetrievalGeneration,
            )
            .map((run) => run.scenarioKey),
    )
    return required.every((scenario) => passed.has(scenario))
}

/** The draft card one selected setup session produces, or null while no revision exists. */
export const contextDraftFor = (
    runtime: AgentosModuleRuntime,
    setup: AgentosModuleRuntime["setupSession"],
    testSurface: AgentosModuleTestSurface | null,
    copy: ModulePageCopy,
): ContextDraft | null => {
    if (setup?.setupRevision === null || setup?.setupRevision === undefined || setup.setupStatus === null)
        return null
    const context = runtime.contextVersions.find((candidate) => candidate.sourceSetupSessionId === setup.id) ?? null
    const snapshot = context?.snapshot ?? setup.draftSnapshot
    const summary =
        snapshot === null
            ? copy.setup.waitingForOwner
            : stringSetting(
                  snapshot.summary,
                  stringSetting(
                      snapshot.businessIdentity,
                      copy.setup.fallbackSummary({ revision: setup.setupRevision }),
                  ),
              )
    return {
        contextId: context?.id ?? null,
        setupSessionId: setup.id,
        revision: setup.setupRevision,
        status: setup.setupStatus,
        version: context?.version ?? null,
        digest: setup.draftDigest,
        summary,
        facts: draftFactsFor(snapshot),
        gates: setupGatesFor(
            setup,
            runtime.installation.runtimeManifest.setup?.requirements ?? [],
            runtime.installation.runtimeManifest.operations?.setupFields ?? [],
            {
                authority: runtime.installation.setupAuthorityGeneration,
                source: runtime.installation.setupSourceGeneration,
                retrieval: runtime.installation.setupRetrievalGeneration,
            },
            copy,
        ),
        exactTestPassed: exactTestPassedFor(testSurface, runtime, context, setup.id, setup.draftDigest),
        definitionDigest: context?.definitionDigest ?? null,
        authorityGeneration: runtime.installation.setupAuthorityGeneration,
        sourceGeneration: runtime.installation.setupSourceGeneration,
        retrievalGeneration: runtime.installation.setupRetrievalGeneration,
        isActive: context?.id === runtime.installation.activeContextVersionId,
    }
}

/**
 * The setup session a stale or absent selection resolves to: the selected session while it still
 * exists, then the session the runtime names, then the most recent one.
 */
export const setupSessionFor = (
    runtime: AgentosModuleRuntime,
    selectedId: string | null,
): AgentosRuntimeSession | null =>
    runtime.setupSessions.find((item) => item.id === selectedId) ??
    runtime.setupSession ??
    runtime.setupSessions.at(-1) ??
    null
