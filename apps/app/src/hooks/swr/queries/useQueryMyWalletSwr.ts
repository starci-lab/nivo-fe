"use client"
import { myWallet } from "@/modules/api/commerce"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_WALLET_SWR_KEY } from "../swr.shared"

/** Read the signed-in viewer's wallet projection. */
export const useQueryMyWalletSwr = () => useNivoQuery(QUERY_WALLET_SWR_KEY, myWallet)
