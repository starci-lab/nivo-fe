/** One product query key before the signed-in viewer identity is attached. */
export type NivoQueryKey = readonly [name: string, ...parts: ReadonlyArray<string | number | boolean | null>]
