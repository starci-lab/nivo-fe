import type { ModulePageTranslatorFor } from "./types"

/** Catalog entries used by module diagnostics and raw-field labels. */
export type DiagnosticsModulePageMessageKey =
    | "runtime.diagnostics.accepted"
    | "runtime.diagnostics.ai"
    | "runtime.diagnostics.all"
    | "runtime.diagnostics.boundReplies"
    | "runtime.diagnostics.channel"
    | "runtime.diagnostics.checks"
    | "runtime.diagnostics.compact"
    | "runtime.diagnostics.events"
    | "runtime.diagnostics.filterNotice"
    | "runtime.diagnostics.health"
    | "runtime.diagnostics.healthTab"
    | "runtime.diagnostics.installation"
    | "runtime.diagnostics.kind"
    | "runtime.diagnostics.noEvents"
    | "runtime.diagnostics.safeNotice"
    | "runtime.diagnostics.signals"
    | "runtime.diagnostics.telegramEvents"
    | "runtime.diagnostics.trace"
    | "runtime.diagnostics.traceTab"
    | "runtime.diagnostics.workbench"
    | "runtime.fields.amount"
    | "runtime.fields.approvalState"
    | "runtime.fields.citations"
    | "runtime.fields.confidence"
    | "runtime.fields.conflicts"
    | "runtime.fields.currency"
    | "runtime.fields.dateTime"
    | "runtime.fields.options"
    | "runtime.fields.priority"
    | "runtime.fields.sla"
    | "runtime.fields.status"
    | "runtime.fields.summary"
    | "runtime.fields.timeZone"
    | "runtime.fields.title"
    | "runtime.labels.action"
    | "runtime.labels.field"
    | "runtime.labels.policy"
    | "runtime.labels.priority"

type RuntimeDiagnosticsAcceptedValues = { readonly count: number }

type RuntimeDiagnosticsBoundRepliesValues = { readonly count: number }

type RuntimeDiagnosticsChecksValues = { readonly count: number }

type RuntimeDiagnosticsEventsValues = { readonly count: number }

type RuntimeDiagnosticsTelegramEventsValues = { readonly count: number }

type RuntimeLabelsActionValues = { readonly key: string }

type RuntimeLabelsFieldValues = { readonly key: string }

type RuntimeLabelsPolicyValues = { readonly policy: string }

type RuntimeLabelsPriorityValues = { readonly priority: string }

/** Build the diagnostic copy branches from the connected translation namespace. */
export const buildDiagnosticsCopy = (t: ModulePageTranslatorFor<DiagnosticsModulePageMessageKey>) => ({
    diagnostics: {
        accepted: (values: RuntimeDiagnosticsAcceptedValues) => t("runtime.diagnostics.accepted", values),
        ai: t("runtime.diagnostics.ai"),
        all: t("runtime.diagnostics.all"),
        boundReplies: (values: RuntimeDiagnosticsBoundRepliesValues) => t("runtime.diagnostics.boundReplies", values),
        channel: t("runtime.diagnostics.channel"),
        checks: (values: RuntimeDiagnosticsChecksValues) => t("runtime.diagnostics.checks", values),
        compact: t("runtime.diagnostics.compact"),
        events: (values: RuntimeDiagnosticsEventsValues) => t("runtime.diagnostics.events", values),
        filterNotice: t("runtime.diagnostics.filterNotice"),
        health: t("runtime.diagnostics.health"),
        healthTab: t("runtime.diagnostics.healthTab"),
        installation: t("runtime.diagnostics.installation"),
        kind: t("runtime.diagnostics.kind"),
        noEvents: t("runtime.diagnostics.noEvents"),
        safeNotice: t("runtime.diagnostics.safeNotice"),
        signals: t("runtime.diagnostics.signals"),
        telegramEvents: (values: RuntimeDiagnosticsTelegramEventsValues) =>
            t("runtime.diagnostics.telegramEvents", values),
        trace: t("runtime.diagnostics.trace"),
        traceTab: t("runtime.diagnostics.traceTab"),
        workbench: t("runtime.diagnostics.workbench"),
    },
    fields: {
        amount: t("runtime.fields.amount"),
        approvalState: t("runtime.fields.approvalState"),
        citations: t("runtime.fields.citations"),
        confidence: t("runtime.fields.confidence"),
        conflicts: t("runtime.fields.conflicts"),
        currency: t("runtime.fields.currency"),
        dateTime: t("runtime.fields.dateTime"),
        options: t("runtime.fields.options"),
        priority: t("runtime.fields.priority"),
        sla: t("runtime.fields.sla"),
        status: t("runtime.fields.status"),
        summary: t("runtime.fields.summary"),
        timeZone: t("runtime.fields.timeZone"),
        title: t("runtime.fields.title"),
    },
    labels: {
        action: (values: RuntimeLabelsActionValues) => t("runtime.labels.action", values),
        field: (values: RuntimeLabelsFieldValues) => t("runtime.labels.field", values),
        policy: (values: RuntimeLabelsPolicyValues) => t("runtime.labels.policy", values),
        priority: (values: RuntimeLabelsPriorityValues) => t("runtime.labels.priority", values),
    },
})
