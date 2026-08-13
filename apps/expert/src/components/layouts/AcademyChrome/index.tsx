"use client"

import type { ReactNode } from "react"
import { useLocale } from "next-intl"
import type { Locale } from "@/i18n/config"
import { ACADEMY, inLocale, isSafeThemeValue, type ThemeVariables } from "@/modules/academy/template"

/**
 * The only place in this app that knows what colour the academy is.
 *
 * It emits HeroUI's OWN theming block -- `:root` for light, `.dark` for dark -- filled from the
 * mounted template. That is the shape the vendor documents, so an academy reaches every variable
 * HeroUI has rather than a subset somebody chose in advance, and a variable added in a future
 * HeroUI release is usable by a template without a code change here.
 *
 * A STYLE BLOCK, NOT AN INLINE `style` ATTRIBUTE. Inline properties land on one element and cannot
 * express a second colour scheme -- there is no way to say "these values, but only under `.dark`".
 * The previous version wrote inline vars and therefore had no dark theme at all, on top of silently
 * dropping every knob the hand-written map had no entry for; `--muted` was the visible one, which
 * left muted text on a warm-brown academy painted in HeroUI's cool grey.
 *
 * EVERY SECTION STILL SAYS `bg-surface` AND NEVER A SHADE. That rule only fails visibly for the
 * SECOND customer -- a component with a colour baked in looks correct for whichever academy was
 * open while it was written, and wrong for every other one -- which is why reading the brand is
 * confined to this file rather than offered as a hook any section could call.
 *
 * IT OPENS NO ELEMENT OF ITS OWN, AND THAT IS THE HONEST SHAPE RATHER THAN A CONCESSION. This
 * component takes `children` as an opaque `ReactNode`: whatever a route hands it, it wraps. A
 * registry key is the opposite promise -- it fixes a node's classes AND names the children that
 * node admits -- so no key can describe a wrapper whose whole point is not to know its interior,
 * and `<Tree contract="…" render={…} />` cannot be reached from here at all because `render` takes
 * a typed contract component and `children` is not one. The old `<div>` was therefore a node with
 * no key by construction, not for want of one being written.
 *
 * WHAT THAT DIV ACTUALLY CARRIED HAS MOVED TO THE STYLESHEET THIS FILE ALREADY OWNS, which is where
 * it belonged: the page's ground is a DOCUMENT fact, not a node in any page's tree. See
 * {@link GROUND_CSS} for why painting the root reaches further than the wrapper ever did.
 */

/**
 * Renders one scheme's overrides as declarations.
 *
 * Unsafe values are DROPPED rather than escaped. A theme value that needed escaping is not a
 * colour somebody mistyped, it is something trying to end the declaration and start a rule, and
 * the honest response to that is to not emit it.
 *
 * @param variables - The template's overrides for one colour scheme.
 * @returns CSS declarations, or "" when nothing survived.
 */
const declarationsFor = (variables: ThemeVariables | undefined): string => {
    if (!variables) {
        return ""
    }
    return Object.entries(variables)
        .filter(([name, value]) => /^--[a-z0-9-]+$/i.test(name) && isSafeThemeValue(value))
        .map(([name, value]) => `  ${name}: ${value};`)
        .join("\n")
}

/**
 * Names the mounted academy on the root, beside the palette that belongs to it.
 *
 * This replaces a `data-academy` attribute, which existed only because there was a wrapper element
 * to hang it on -- nothing in the app, the styles or the tests ever read it. As a custom property
 * it survives the wrapper's removal and lands somewhere strictly more useful: a reader inspecting
 * the root to find out why the page is this colour now sees WHOSE colour it is in the same list.
 *
 * The name is TENANT TEXT, so it goes through the same gate a theme value does, and for a sharper
 * reason than the colours: this string is interpolated into a `<style>` element, whose contents
 * React does not escape, so a name containing `</style>` would stop being CSS and start being
 * markup. {@link isSafeThemeValue} already refuses `<` and `>`; the two remaining characters that
 * matter inside a quoted CSS string are escaped rather than dropped, because a backslash or a
 * quotation mark in an academy's name is a name, not an attack.
 *
 * AN ABSENT NAME IS ONE OF THE SAFE CASES, not a special one. `inLocale` returns `undefined` for a
 * template that authored the name in no language at all, and the same gate that refuses a dangerous
 * name refuses a missing one: no declaration is emitted, and the root simply says nothing about
 * whose academy this is.
 *
 * @param name - The academy's name in the reader's locale, if the template authored one.
 * @returns The declaration, or "" when the name cannot be emitted safely.
 */
const identityDeclarationFor = (name: string | undefined): string => {
    if (name === undefined || !isSafeThemeValue(name)) {
        return ""
    }
    return `  --academy: "${name.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}";`
}

/**
 * The page's ground.
 *
 * THE WRAPPER USED TO DO THIS WITH `min-h-dvh bg-background text-foreground`, and it did it less
 * well. A background on the body propagates to the CANVAS whenever the root paints none -- which is
 * the case here -- so it covers the whole viewport however short the page is and however far a
 * reader over-scrolls. That is what `min-h-dvh` was approximating on an element that could only
 * ever paint as far as its own box; the body already carries `min-h-dvh` from the document shell,
 * so nothing is lost by dropping it.
 *
 * THE BODY RATHER THAN `:root`, AND THE DIFFERENCE IS THE DARK BLOCK. The theme above scopes the
 * dark palette to `.dark`, and nothing in this app has decided yet whether that class lands on the
 * html element or on the body -- no route sets it at all today. Painting `:root` would read
 * `--background` only from the root's own scope, so a `.dark` on the BODY would leave the page's
 * ground light under dark content. Custom properties inherit, so the body resolves whichever
 * element above it the class ends up on, and both placements paint correctly.
 *
 * IT NAMES THE SAME TWO TOKENS THE UTILITIES DID, not two colours: `--background` and `--foreground`
 * are HeroUI's own base variables, and they are exactly the ones the block above lets a template
 * repaint. An academy that overrides neither gets the vendor's defaults, which is the whole reason
 * an unprovisioned instance still looks deliberate.
 *
 * It is emitted unconditionally, unlike the theme block: a template that overrides nothing still
 * needs its page painted, and before this the ground came from a class that was always present.
 */
const GROUND_CSS = "body {\n  background-color: var(--background);\n  color: var(--foreground);\n}"

/**
 * Builds the vendor's theming block for this academy, plus the ground it is painted on.
 *
 * The selectors match the ones HeroUI's own documentation uses, so the block behaves the same way
 * whether the app switches themes by class or by `data-theme`.
 *
 * @param name - The academy's name in the reader's locale, recorded on the root when there is one.
 * @returns The stylesheet text.
 */
const themeCss = (name: string | undefined): string => {
    const light = [declarationsFor(ACADEMY.theme.light), identityDeclarationFor(name)]
        .filter(Boolean)
        .join("\n")
    const dark = declarationsFor(ACADEMY.theme.dark)
    const blocks: Array<string> = [GROUND_CSS]
    if (light) {
        blocks.push(`:root,\n.light,\n[data-theme="light"] {\n${light}\n}`)
    }
    if (dark) {
        blocks.push(`.dark,\n[data-theme="dark"] {\n${dark}\n}`)
    }
    return blocks.join("\n")
}

/** Props for {@link AcademyChrome}. */
interface AcademyChromeProps {
    /**
     * The page to wrap. Opaque on purpose -- this component styles a document, not a tree.
     *
     * A NAMED PROP RATHER THAN `children`, and the difference is not cosmetic. `children` is the one
     * slot every JSX element already has, so a component that takes it accepts markup from anywhere
     * without saying what it expects, and only the three closed vendor shells are allowed that.
     * `content` says the same thing out loud: this layout receives exactly one routed interior, at a
     * name a reader can grep, and a second one cannot be slipped in beside it.
     */
    readonly content: ReactNode
}

/**
 * Wrap a page in this academy's theme and its own CSS.
 *
 * @param input - {@link AcademyChromeProps}
 * @returns The themed shell.
 */
export const AcademyChrome = ({ content }: AcademyChromeProps) => {
    const locale = useLocale() as Locale
    const theme = themeCss(inLocale(ACADEMY.identity.name, locale))
    return (
        <>
            {/*
              * The academy's theme, then the academy's own CSS -- in that order, so a hand-written
              * rule can override a token rather than losing to one.
              *
              * Both are inlined rather than linked. A stylesheet that arrives after the page has
              * painted shows every visitor an unstyled flash of somebody else's defaults, and the
              * custom CSS has already had its XSS vectors stripped by the backend.
              */}
            <style>{theme}</style>
            {ACADEMY.customCss ? <style>{ACADEMY.customCss}</style> : null}
            {content}
        </>
    )
}
