import type { SalesInstallationScope } from "@/modules/api/sales"
import { useMutateSalesClarifyCommandSwr } from "@/hooks/swr/mutations/useMutateSalesClarifyCommandSwr"
import { useMutateSalesCloseSwr } from "@/hooks/swr/mutations/useMutateSalesCloseSwr"
import { useMutateSalesConfigurePolicySwr } from "@/hooks/swr/mutations/useMutateSalesConfigurePolicySwr"
import { useMutateSalesRecoverActionSwr } from "@/hooks/swr/mutations/useMutateSalesRecoverActionSwr"
import { useMutateSalesSubmitCommandSwr } from "@/hooks/swr/mutations/useMutateSalesSubmitCommandSwr"

/** Connect the Sales workbench commands to its resolved installation scope. */
export const useSalesWorkbenchCommands = (addressable: SalesInstallationScope, ready: boolean) => ({
    configurePolicy: useMutateSalesConfigurePolicySwr(addressable, ready),
    submitCommand: useMutateSalesSubmitCommandSwr(addressable, ready),
    clarifyCommand: useMutateSalesClarifyCommandSwr(addressable, ready),
    closeOpportunity: useMutateSalesCloseSwr(addressable, ready),
    recoverAction: useMutateSalesRecoverActionSwr(addressable, ready),
})
