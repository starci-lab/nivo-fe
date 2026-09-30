import { isNumber, isRecord, isString } from "@nivo/api"
import type { TopUpSession } from "./waypoint"

/** Whether a value parsed from storage carries the payment evidence a top-up round trip keeps. */
export const isTopUpSession = (value: unknown): value is TopUpSession =>
    isRecord(value) && isNumber(value.amountVnd) && isNumber(value.startingBalanceVnd) && isString(value.referenceId)

/** The hidden form fields a provider checkout is posted with: text names mapped to text values. */
export type CheckoutFields = Readonly<Record<string, string>>

/**
 * Parse the provider's serialized checkout fields.
 *
 * @param raw - The serialized object, or null when the provider sent none.
 * @returns The fields (empty when none were sent), or null when the text is not an object of strings.
 */
export const parseCheckoutFields = (raw: string | null): CheckoutFields | null => {
    if (raw === null) return {}
    try {
        const parsed: unknown = JSON.parse(raw)
        if (!isRecord(parsed)) return null
        const fields: Record<string, string> = {}
        for (const [name, value] of Object.entries(parsed)) {
            if (!isString(value)) return null
            fields[name] = value
        }
        return fields
    } catch {
        return null
    }
}
