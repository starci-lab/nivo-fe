import { createWalletTopUpPayLink } from "@/modules/api/commerce"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_WALLET_TOP_UP_PAY_LINK_SWR_KEY } from "../swr.shared"

/** Create a wallet checkout without leaking payment transport into the Wallet component. */
export const useMutateCreateWalletTopUpPayLinkSwr = () =>
    useNivoMutation(MUTATION_WALLET_TOP_UP_PAY_LINK_SWR_KEY, (input: WalletTopUpInput) =>
        createWalletTopUpPayLink(input.amountVnd, input.returnUrl, input.cancelUrl),
    )

type WalletTopUpInput = {
    readonly amountVnd: number
    readonly returnUrl: string
    readonly cancelUrl: string
}
