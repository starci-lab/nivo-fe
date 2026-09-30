import { type Formatter } from "@/modules/i18n/formatter"
type LocalizedDigits = {
    readonly toAscii: ReadonlyMap<string, string>
    readonly fromAscii: ReadonlyMap<string, string>
}

const localizedDigits = (format: Formatter): LocalizedDigits => {
    const toAscii = new Map<string, string>()
    const fromAscii = new Map<string, string>()
    for (let digit = 0; digit <= 9; digit += 1) {
        const ascii = String(digit)
        const localized = format.number(digit, { useGrouping: false, maximumFractionDigits: 0 })
        toAscii.set(localized, ascii)
        fromAscii.set(ascii, localized)
    }
    return { toAscii, fromAscii }
}

const replaceDigits = (value: string, mapping: ReadonlyMap<string, string>): string =>
    [...value].map((character) => mapping.get(character) ?? character).join("")

const decimalSeparator = (format: Formatter, digits: LocalizedDigits): string => {
    const sample = replaceDigits(
        format.number(1.1, { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        digits.toAscii,
    )
    const firstDigit = sample.indexOf("1")
    const lastDigit = sample.lastIndexOf("1")
    return lastDigit > firstDigit ? sample.slice(firstDigit + 1, lastDigit) : "."
}

const groupingSeparator = (format: Formatter, digits: LocalizedDigits): string | undefined => {
    const sample = replaceDigits(format.number(1000, { useGrouping: true, maximumFractionDigits: 0 }), digits.toAscii)
    return /[0-9]([^0-9]+)[0-9]/u.exec(sample)?.[1]
}

const fractionDigits = (currency: string, format: Formatter, digits: LocalizedDigits): number => {
    const sample = replaceDigits(format.number(1, { style: "currency", currency }), digits.toAscii)
    const decimal = decimalSeparator(format, digits)
    const decimalIndex = sample.indexOf(decimal)
    if (decimalIndex === -1) return 0
    return /^[0-9]*/u.exec(sample.slice(decimalIndex + decimal.length))?.[0].length ?? 0
}

/** Convert a locale-entered major-unit amount into the backend's exact signed minor-unit string. */
export const currencyAmountToMinor = (value: string, currency: string, format: Formatter): string | null => {
    const digits = localizedDigits(format)
    const group = groupingSeparator(format, digits)
    const decimal = decimalSeparator(format, digits)
    let normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "")
    if (group !== undefined) normalized = normalized.split(group).join("")
    normalized = normalized.split(decimal).join(".")
    const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(normalized)
    if (match === null) return null
    const fractionDigitCount = fractionDigits(currency, format, digits)
    const fraction = match[3] ?? ""
    if (fraction.length > fractionDigitCount) return null
    const absolute =
        `${match[2]}${(fraction + "0".repeat(fractionDigitCount)).slice(0, fractionDigitCount)}`.replace(
            /^0+(?=\d)/,
            "",
        ) || "0"
    if (absolute === "0") return "0"
    return `${match[1]}${absolute}`
}
/** Format a backend minor-unit string as exact localized business currency. */
export const formatMinorCurrency = (value: string, currency: string, format: Formatter): string => {
    try {
        const match = /^(-?)(\d+)$/.exec(value)
        const rawDigits = match?.[2]
        if (match === null || rawDigits === undefined) throw new Error("amount")
        const negative = match[1] === "-" && !/^0+$/.test(rawDigits)
        const absolute = rawDigits.replace(/^0+(?=\d)/, "") || "0"
        const localized = localizedDigits(format)
        const fractionDigitCount = fractionDigits(currency, format, localized)
        const padded = absolute.padStart(fractionDigitCount + 1, "0")
        const whole = fractionDigitCount === 0 ? padded : padded.slice(0, -fractionDigitCount)
        const fraction = fractionDigitCount === 0 ? "" : padded.slice(-fractionDigitCount)
        const template = replaceDigits(
            format.number(negative ? -1 : 1, {
                style: "currency",
                currency,
                minimumFractionDigits: fractionDigitCount,
                maximumFractionDigits: fractionDigitCount,
            }),
            localized.toAscii,
        )
        const firstDigit = template.search(/[0-9]/u)
        let lastDigit = template.length - 1
        while (lastDigit >= 0 && !/[0-9]/u.test(template[lastDigit] ?? "")) lastDigit -= 1
        if (firstDigit === -1 || lastDigit < firstDigit) throw new Error("amount")
        const prefix = template.slice(0, firstDigit)
        const suffix = template.slice(lastDigit + 1)
        const group = groupingSeparator(format, localized) ?? ","
        const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group)
        const decimal = decimalSeparator(format, localized)
        const formattedWhole = replaceDigits(groupedWhole, localized.fromAscii)
        const formattedFraction = replaceDigits(fraction, localized.fromAscii)
        return `${prefix}${formattedWhole}${fractionDigitCount === 0 ? "" : `${decimal}${formattedFraction}`}${suffix}`
    } catch {
        return `${value} ${currency}`
    }
}
