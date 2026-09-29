import type { ModulePageTranslatorFor } from "./types"

/** Catalog entries used by scenario testing and trust evidence. */
export type TestModulePageMessageKey =
    | "runtime.kindTest.accounting"
    | "runtime.kindTest.boundary"
    | "runtime.kindTest.boundaryDetail"
    | "runtime.kindTest.calendar"
    | "runtime.kindTest.citation"
    | "runtime.kindTest.closed"
    | "runtime.kindTest.cockpit"
    | "runtime.kindTest.context"
    | "runtime.kindTest.conversation"
    | "runtime.kindTest.default"
    | "runtime.kindTest.fakeHint"
    | "runtime.kindTest.generic"
    | "runtime.kindTest.local"
    | "runtime.kindTest.noRegistration"
    | "runtime.kindTest.pending"
    | "runtime.kindTest.ready"
    | "runtime.kindTest.refused"
    | "runtime.kindTest.run"
    | "runtime.kindTest.runUnavailable"
    | "runtime.kindTest.safety"
    | "runtime.kindTest.sandbox"
    | "runtime.kindTest.scenario"
    | "runtime.kindTest.state"
    | "runtime.kindTest.unavailable"
    | "runtime.pageTest.closed"
    | "runtime.pageTest.compact"
    | "runtime.pageTest.contractUnavailable"
    | "runtime.pageTest.conversation"
    | "runtime.pageTest.count"
    | "runtime.pageTest.evidence"
    | "runtime.pageTest.exploratory"
    | "runtime.pageTest.acceptance"
    | "runtime.pageTest.mode"
    | "runtime.pageTest.noContract"
    | "runtime.pageTest.notRun"
    | "runtime.pageTest.safety"
    | "runtime.pageTest.scenarios"
    | "runtime.pageTest.state"
    | "runtime.pageTest.suite"
    | "runtime.pageTest.summary"
    | "runtime.pageTest.trust"
    | "runtime.pageTest.unavailable"
    | "runtime.pageTest.unavailableView"
    | "runtime.testStatus.failed"
    | "runtime.testStatus.passed"
    | "runtime.testStatus.running"
    | "runtime.testStatus.warning"
    | "runtime.trust.collect"
    | "runtime.trust.evidence"
    | "runtime.trust.expected"
    | "runtime.trust.fail"
    | "runtime.trust.noRun"
    | "runtime.trust.notRun"
    | "runtime.trust.notice"
    | "runtime.trust.observed"
    | "runtime.trust.pass"
    | "runtime.trust.rejected"
    | "runtime.trust.result"
    | "runtime.trust.title"
    | "runtime.trust.total"
    | "runtime.trust.verdictFail"
    | "runtime.trust.verdictPass"
    | "runtime.trust.verdictWarning"
    | "runtime.trust.warning"

type RuntimeKindTestBoundaryDetailValues = {
    readonly scenario: string
    readonly context: string
    readonly count: number
    readonly picker: string
    readonly commands: string
}

type RuntimeKindTestRunValues = { readonly scenario: string }

type RuntimePageTestCountValues = { readonly count: number }

type RuntimeTrustResultValues = { readonly status: string }

/** Build the test and trust copy branches from the connected translator. */
export const buildTestCopy = (t: ModulePageTranslatorFor<TestModulePageMessageKey>) => ({
    kindTest: {
        accounting: t("runtime.kindTest.accounting"),
        boundary: t("runtime.kindTest.boundary"),
        boundaryDetail: (values: RuntimeKindTestBoundaryDetailValues) => t("runtime.kindTest.boundaryDetail", values),
        calendar: t("runtime.kindTest.calendar"),
        citation: t("runtime.kindTest.citation"),
        closed: t("runtime.kindTest.closed"),
        cockpit: t("runtime.kindTest.cockpit"),
        context: t("runtime.kindTest.context"),
        conversation: t("runtime.kindTest.conversation"),
        default: t("runtime.kindTest.default"),
        fakeHint: t("runtime.kindTest.fakeHint"),
        generic: t("runtime.kindTest.generic"),
        local: t("runtime.kindTest.local"),
        noRegistration: t("runtime.kindTest.noRegistration"),
        pending: t("runtime.kindTest.pending"),
        ready: t("runtime.kindTest.ready"),
        refused: t("runtime.kindTest.refused"),
        run: (values: RuntimeKindTestRunValues) => t("runtime.kindTest.run", values),
        runUnavailable: t("runtime.kindTest.runUnavailable"),
        safety: t("runtime.kindTest.safety"),
        sandbox: t("runtime.kindTest.sandbox"),
        scenario: t("runtime.kindTest.scenario"),
        state: t("runtime.kindTest.state"),
        unavailable: t("runtime.kindTest.unavailable"),
    },
    pageTest: {
        acceptance: t("runtime.pageTest.acceptance"),
        closed: t("runtime.pageTest.closed"),
        compact: t("runtime.pageTest.compact"),
        contractUnavailable: t("runtime.pageTest.contractUnavailable"),
        conversation: t("runtime.pageTest.conversation"),
        count: (values: RuntimePageTestCountValues) => t("runtime.pageTest.count", values),
        evidence: t("runtime.pageTest.evidence"),
        exploratory: t("runtime.pageTest.exploratory"),
        mode: t("runtime.pageTest.mode"),
        noContract: t("runtime.pageTest.noContract"),
        notRun: t("runtime.pageTest.notRun"),
        safety: t("runtime.pageTest.safety"),
        scenarios: t("runtime.pageTest.scenarios"),
        state: t("runtime.pageTest.state"),
        suite: t("runtime.pageTest.suite"),
        summary: t("runtime.pageTest.summary"),
        trust: t("runtime.pageTest.trust"),
        unavailable: t("runtime.pageTest.unavailable"),
        unavailableView: t("runtime.pageTest.unavailableView"),
    },
    testStatus: {
        failed: t("runtime.testStatus.failed"),
        passed: t("runtime.testStatus.passed"),
        running: t("runtime.testStatus.running"),
        warning: t("runtime.testStatus.warning"),
    },
    trust: {
        collect: t("runtime.trust.collect"),
        evidence: t("runtime.trust.evidence"),
        expected: t("runtime.trust.expected"),
        fail: t("runtime.trust.fail"),
        noRun: t("runtime.trust.noRun"),
        notRun: t("runtime.trust.notRun"),
        notice: t("runtime.trust.notice"),
        observed: t("runtime.trust.observed"),
        pass: t("runtime.trust.pass"),
        rejected: t("runtime.trust.rejected"),
        result: (values: RuntimeTrustResultValues) => t("runtime.trust.result", values),
        title: t("runtime.trust.title"),
        total: t("runtime.trust.total"),
        verdictFail: t("runtime.trust.verdictFail"),
        verdictPass: t("runtime.trust.verdictPass"),
        verdictWarning: t("runtime.trust.verdictWarning"),
        warning: t("runtime.trust.warning"),
    },
})
