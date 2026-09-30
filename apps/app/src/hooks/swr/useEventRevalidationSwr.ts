import { settle } from "@nivo/api"
import useSWR from "swr"

type EventRevalidationKey = readonly (string | number | boolean | null)[]

/** Revalidate a keyed SWR resource when its realtime signal changes. */
export const useEventRevalidationSwr = (
    key: EventRevalidationKey | null,
    revalidate: () => Promise<unknown>,
): void => {
    useSWR(
        key,
        async () => {
            await settle(revalidate)
            return true
        },
        {
            dedupingInterval: 0,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateIfStale: true,
            shouldRetryOnError: false,
        },
    )
}
