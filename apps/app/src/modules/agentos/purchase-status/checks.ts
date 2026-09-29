import { IconSource } from "@nivo/ui"
import { type BadgeTone, type IconSource as GrammarIconSource } from "@starci/grammar/common"

/** The supported words and matching semantic tones for source checks. */
export type WordTone = {
    readonly word: "done" | "running" | "queued" | "failed" | "unknown"
    readonly tone: "success" | "accent" | "neutral" | "danger" | "warning"
}

/** The header badge variants a purchase phase can raise. */
export type PurchaseStatusBadge = {
    readonly label: string
    readonly tone: "warning" | "accent" | "success" | "danger" | "neutral"
}

/** One source-qualified observation row in the verification rail. */
export type PurchaseStatusCheck = {
    readonly id: string
    readonly label: string
    readonly detail?: string
    readonly at?: string
    readonly word: WordTone["word"]
    readonly tone: BadgeTone
    readonly mark: GrammarIconSource
}

const CHECK_TONES: Readonly<Record<WordTone["word"], WordTone["tone"]>> = {
    done: "success",
    running: "warning",
    queued: "neutral",
    failed: "danger",
    unknown: "warning",
}

/** The circular mark each check word carries, resolved from the app icon registry. */
const CHECK_MARKS: Readonly<Record<WordTone["word"], GrammarIconSource>> = {
    done: IconSource("complete"),
    running: IconSource("retry"),
    queued: IconSource("pending"),
    failed: IconSource("close"),
    unknown: IconSource("pending"),
}

/** Build a source check with its word's paired tone and semantic mark. */
export const check = (
    id: string,
    label: string,
    word: WordTone["word"],
    detail?: string,
    at?: string,
): PurchaseStatusCheck => ({
    id,
    label,
    word,
    tone: CHECK_TONES[word],
    mark: CHECK_MARKS[word],
    detail,
    at,
})
