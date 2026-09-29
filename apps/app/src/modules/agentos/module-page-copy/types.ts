/** Internal typed translator boundary for one module-page copy surface. */
export type ModulePageTranslatorFor<Key extends string> = (
    key: Key,
    values?: Readonly<Record<string, string | number>>,
) => string
