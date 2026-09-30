import type { useFormatter } from "next-intl"
import { DEFAULT_LOCALE } from "@/modules/i18n"
import { readStored, TOP_UP_SESSION_KEY } from "@/modules/browser-storage"

type WalletFormatter = ReturnType<typeof useFormatter>

/** Listen for a top-up session written by another tab. */
export const subscribeTopUpSession = (onChange: () => void): (() => void) => {
    window.addEventListener("storage", onChange)
    return () => window.removeEventListener("storage", onChange)
}

/** Read the top-up session from browser storage, with a deterministic server snapshot. */
export const readTopUpSessionRaw = (): string | null => readStored("session", TOP_UP_SESSION_KEY)
/** Provide the deterministic server snapshot required by the external-store subscription. */
export const readTopUpSessionServer = (): string | null => null

/** Format a wallet amount in the account's billing currency. */
export const walletAmount = (format: WalletFormatter, amountVnd: number, currency: string): string =>
    format.number(amountVnd, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    })

/** Format one wallet transaction date. */
export const walletDay = (format: WalletFormatter, iso: string): string =>
    format.dateTime(new Date(iso), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })

/** Resolve a wallet route with the app's default-locale convention. */
export const walletRoute = (path: string, locale: string): string =>
    locale === DEFAULT_LOCALE ? path : `/${locale}${path}`
