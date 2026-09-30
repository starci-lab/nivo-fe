import { useFormatter } from "next-intl"
import { type AccountingResultDetailInput, type AccountingSummaryQueryInput } from "@/modules/api/accounting"
import {
    parseAccountingCorrectionReading,
    parseAccountingEvidenceReading,
    parseAccountingResultDetailReading,
    parseAccountingRoutineReading,
    parseAccountingSummaryReading,
} from "@/modules/api/accounting/payload.guards"
import {
    accountingMonthPeriod,
    accountingUtcMonth,
    type AccountingTranslation,
} from "@/modules/accounting/accounting-workbench"
import { useAccountingWorkbenchCommands } from "./useAccountingWorkbenchCommands"
import { useAccountingWorkbenchReads } from "./useAccountingWorkbenchReads"
import { useAccountingWorkbenchForm } from "./useAccountingWorkbenchForm"
import { useWorkbenchScope } from "./useWorkbenchScope"
const PAGE_SIZE = 20

/** Connect Accounting controls to addressed reads and command mutations. */
export const useAccountingWorkbenchContext = (moduleId: string, locale: string, t: AccountingTranslation) => {
    const format = useFormatter()
    const form = useAccountingWorkbenchForm()
    const scope = useWorkbenchScope(moduleId)
    const { asOf, currency, cursor, evidenceId, intentId, itemId, periodMonth, resultId, setCursor, setPeriodMonth } =
        form
    const { addressable, ready } = scope
    /* An unusable month control keeps the last usable period rather than reading a period nobody chose. */
    const period = accountingMonthPeriod(periodMonth) ?? accountingMonthPeriod(accountingUtcMonth(new Date()))
    const chooseMonth = (value: string) => {
        if (accountingMonthPeriod(value) !== null) {
            setPeriodMonth(value)
            setCursor(null)
        }
    }
    const summaryInput: AccountingSummaryQueryInput = {
        periodStart: period?.periodStart ?? "",
        periodEndExclusive: period?.periodEndExclusive ?? "",
        currency,
        pageSize: PAGE_SIZE,
        cursor,
    }
    const detailInput: AccountingResultDetailInput =
        asOf === null ? { action: "current", resultId } : { action: "asOf", itemId, asOf }

    const { summary, evidence, routine, detail } = useAccountingWorkbenchReads({
        addressable,
        summaryInput,
        detailInput,
        ready,
        periodReady: period !== null,
        evidenceId,
        intentId,
        resultId,
        asOf,
        itemId,
    })
    const { admit, routineCommand, exceptionCommand, correction } = useAccountingWorkbenchCommands(addressable, ready)

    const summaryModel = summary.data?.ok === true ? parseAccountingSummaryReading(summary.data.data.payload) : null
    const evidenceModel = evidence.data?.ok === true ? parseAccountingEvidenceReading(evidence.data.data.payload) : null
    const routineModel = routine.data?.ok === true ? parseAccountingRoutineReading(routine.data.data.payload) : null
    const detailModel = detail.data?.ok === true ? parseAccountingResultDetailReading(detail.data.data.payload) : null
    const correctionModel =
        correction.data?.ok === true ? parseAccountingCorrectionReading(correction.data.data.payload) : null

    return {
        ...form,
        ...scope,
        format,
        locale,
        t,
        admit,
        chooseMonth,
        correction,
        correctionModel,
        detail,
        detailInput,
        detailModel,
        evidence,
        evidenceModel,
        exceptionCommand,
        period,
        routine,
        routineCommand,
        routineModel,
        summary,
        summaryInput,
        summaryModel,
    }
}
