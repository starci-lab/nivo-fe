import type { AccountingInstallationScope } from "@/modules/api/accounting"
import { useMutateAccountingAdmitEvidenceSwr } from "@/hooks/swr/mutations/useMutateAccountingAdmitEvidenceSwr"
import { useMutateAccountingCorrectSwr } from "@/hooks/swr/mutations/useMutateAccountingCorrectSwr"
import { useMutateAccountingExceptionSwr } from "@/hooks/swr/mutations/useMutateAccountingExceptionSwr"
import { useMutateAccountingRoutineSwr } from "@/hooks/swr/mutations/useMutateAccountingRoutineSwr"

/** Connect the Accounting workbench commands to its resolved installation scope. */
export const useAccountingWorkbenchCommands = (addressable: AccountingInstallationScope, ready: boolean) => ({
    admit: useMutateAccountingAdmitEvidenceSwr(addressable, ready),
    routineCommand: useMutateAccountingRoutineSwr(addressable, ready),
    exceptionCommand: useMutateAccountingExceptionSwr(addressable, ready),
    correction: useMutateAccountingCorrectSwr(addressable, ready),
})
