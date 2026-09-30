import { myWalletTransactions } from "@/modules/api/commerce"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_WALLET_TRANSACTIONS_SWR_KEY } from "../swr.shared"

/** Read the signed-in viewer's wallet ledger. */
export const useQueryMyWalletTransactionsSwr = () => useNivoQuery(QUERY_WALLET_TRANSACTIONS_SWR_KEY, myWalletTransactions)
