import { myDomains } from "@/modules/api/commerce"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_DOMAINS_SWR_KEY } from "../swr.shared"

/** Read domains owned by the signed-in viewer. */
export const useQueryMyDomainsSwr = () => useNivoQuery(QUERY_DOMAINS_SWR_KEY, myDomains)
