/**
 * The wire primitives every gateway parser shares.
 *
 * A wire value is `unknown` until a check the compiler can follow proves it. These are the checks:
 * one recognizer per JSON shape, and the combinators a per-document parser composes them with.
 * A parser returns a freshly constructed value or null - never the record it was handed under a
 * borrowed name.
 */

/** A plain object: not null, not an array. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

/** Any string, including the empty one; emptiness is a contract decision, not a shape one. */
export const isString = (value: unknown): value is string => typeof value === "string"

/** A finite JSON number. */
export const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)

/** A JSON boolean. */
export const isBoolean = (value: unknown): value is boolean => typeof value === "boolean"

/** A string or null - the spelling of a nullable text field. */
export const isNullableString = (value: unknown): value is string | null => value === null || isString(value)

/** A number or null - the spelling of a nullable numeric field. */
export const isNullableNumber = (value: unknown): value is number | null => value === null || isNumber(value)

/** A boolean or null - the spelling of a nullable flag. */
export const isNullableBoolean = (value: unknown): value is boolean | null => value === null || isBoolean(value)

/** An array whose every element is a string. */
export const isStringArray = (value: unknown): value is ReadonlyArray<string> =>
    Array.isArray(value) && value.every(isString)

/** Membership in a closed string vocabulary, as a narrowing the compiler can follow. */
export const isOneOf = <Value extends string>(value: unknown, choices: ReadonlyArray<Value>): value is Value =>
    isString(value) && choices.some((choice) => choice === value)

/** Every element of a wire array parsed, or null for the first that is not. */
export const parseEach = <T>(value: unknown, parse: (input: unknown) => T | null): ReadonlyArray<T> | null => {
    if (!Array.isArray(value)) return null
    const parsed: Array<T> = []
    for (const entry of value) {
        const item = parse(entry)
        if (item === null) return null
        parsed.push(item)
    }
    return parsed
}

/** The whole `data` of an operation that answers a bare boolean. */
export const parseBooleanAnswer = (input: unknown): boolean | null => (isBoolean(input) ? input : null)
