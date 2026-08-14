import theme from "@/modules/academy/theme.data.json"

/**
 * LAYOUT - paints this academy's palette onto the document root.
 *
 * PORTED IN BEHAVIOUR from `apps/expert`'s chrome of the same name, and reduced
 * to the one thing these states are under review for: the mounted template
 * repainting the vendor's colours. The production version also reads identity
 * and layout out of the same file; the candidate hard-codes neither, because it
 * carries a FIXTURE template rather than a provisioned one.
 *
 * A STYLE BLOCK, NOT AN INLINE `style` ATTRIBUTE. Inline properties land on one
 * element and cannot express a second colour scheme -- there is no way to say
 * "these values, but only under `.dark`". Every leaf here names a semantic token
 * (`bg-surface`, `text-muted`) that HeroUI resolves against these base
 * variables, so repainting them repaints every component without one of them
 * naming a shade.
 *
 * UNSAFE VALUES ARE DROPPED RATHER THAN ESCAPED. This text is interpolated into
 * a `<style>` element, whose contents React does not escape -- so a value
 * carrying `}` or `</style>` would stop being CSS and start being markup. A
 * theme value that needed escaping is not a colour, so it is not rendered at
 * all.
 */

/** A theme value may name a colour or a length, and nothing that could close a rule. */
const isSafeThemeValue = (value: string): boolean =>
    typeof value === "string"
    && value.length > 0
    && value.length <= 120
    && !/[;{}<>]/.test(value)
    && !/@import|url\s*\(|expression\s*\(/i.test(value)

/**
 * Renders one scheme's variables as declarations.
 *
 * @param variables - The authored map.
 * @returns The declaration block, or "" when nothing survived.
 */
const declarations = (variables: Record<string, string> | undefined): string =>
    Object.entries(variables ?? {})
        .filter(([name, value]) => /^--[a-z0-9-]+$/i.test(name) && isSafeThemeValue(value))
        .map(([name, value]) => `${name}: ${value};`)
        .join(" ")

/**
 * Paint the academy's palette onto the document.
 *
 * IT WRAPS NOTHING, and that is the canon rule rather than a shortcut: only the
 * three shells may take an uninterpreted interior, because `children` accepts
 * markup already built and its shape can no longer be checked. This component
 * has no interior to check -- it emits a stylesheet and returns. The layout
 * renders it as a SIBLING of the route, so the variables land on `:root` and
 * every component below resolves against them without one of them naming a
 * shade.
 *
 * @returns The style block carrying this academy's palette.
 */
export const AcademyChrome = () => {
    const light = declarations(theme.theme.light)
    const dark = declarations(theme.theme.dark)
    return (
        <style
            // the vendor's own theming hooks: `:root` for light, `.dark` for
            // the class its stylesheet keys off
            dangerouslySetInnerHTML={{
                __html: `:root { ${light} } .dark { ${dark} }`,
            }}
        />
    )
}

/** Source-level tier marker. */
export const meta = { world: "pure", domain: "academy" } as const
