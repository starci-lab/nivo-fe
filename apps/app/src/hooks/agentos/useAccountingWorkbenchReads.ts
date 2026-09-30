import type {
    AccountingInstallationScope,
    AccountingResultDetailInput,
    AccountingSummaryQueryInput,
} from "@/modules/api/accounting"
import { useQueryAccountingEvidenceSwr } from "@/hooks/swr/queries/useQueryAccountingEvidenceSwr"
import { useQueryAccountingResultDetailSwr } from "@/hooks/swr/queries/useQueryAccountingResultDetailSwr"
import { useQueryAccountingRoutineResultSwr } from "@/hooks/swr/queries/useQueryAccountingRoutineResultSwr"
import { useQueryAccountingSummarySwr } from "@/hooks/swr/queries/useQueryAccountingSummarySwr"

type AccountingWorkbenchReadsInput = {
    readonly addressable: AccountingInstallationScope
    readonly summaryInput: AccountingSummaryQueryInput
    readonly detailInput: AccountingResultDetailInput
    readonly ready: boolean
    readonly periodReady: boolean
    readonly evidenceId: string
    readonly intentId: string
    readonly resultId: string
    readonly asOf: string | null
    readonly itemId: string
}

/** Read the summary, evidence, routine and result detail for one Accounting workbench. */
export const useAccountingWorkbenchReads = ({
    addressable,
    summaryInput,
    detailInput,
    ready,
    periodReady,
    evidenceId,
    intentId,
    resultId,
    asOf,
    itemId,
}: AccountingWorkbenchReadsInput) => {
    const summary = useQueryAccountingSummarySwr(addressable, summaryInput, ready && periodReady)
    const evidence = useQueryAccountingEvidenceSwr(addressable, { evidenceId }, ready && evidenceId.length > 0)
    const routine = useQueryAccountingRoutineResultSwr(addressable, { intentId }, ready && intentId.length > 0)
    const detail = useQueryAccountingResultDetailSwr(
        addressable,
        detailInput,
        ready && (asOf === null ? resultId.length > 0 : itemId.length > 0),
    )

    return { summary, evidence, routine, detail }
}
