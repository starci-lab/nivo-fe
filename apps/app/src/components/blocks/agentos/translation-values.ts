/** Values accepted by the domain translation callbacks before optional entries are removed. */
export type DomainTranslationValues = Readonly<Record<string, string | number | undefined>>

/** Remove absent placeholders before passing values to next-intl's formatter. */
export const translationValuesForNextIntl = (
    values: DomainTranslationValues | undefined,
): Record<string, string | number> | undefined =>
    values === undefined
        ? undefined
        : Object.fromEntries(
              Object.entries(values).filter(
                  (entry): entry is [string, string | number] => entry[1] !== undefined,
              ),
          )
