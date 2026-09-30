import type { ReactNode } from "react"
import { WorkspaceShell } from "@starci/grammar/common"
import { ThemeToggle, type ThemeToggleProps } from "@nivo/ui"
import { ACADEMY_MAIN_ID, ACADEMY_SKIP_LINK_CLASS_NAME, ACADEMY_TOOLBAR_CLASS_NAME } from "./classNames"

/** The rendered tree the chrome wraps: state, never an atom. */
type AcademyChromeBaseState = {
    /**
     * The routed page to wrap. Opaque on purpose -- this component styles a document, not a tree.
     *
     * A NAMED PROP RATHER THAN `children`, and the difference is not cosmetic. `children` is the one
     * slot every JSX element already has, so a component that takes it accepts markup from anywhere
     * without saying what it expects, and only the three closed vendor shells are allowed that.
     * `content` says the same thing out loud: this layout receives exactly one routed interior, at a
     * name a reader can grep, and a second one cannot be slipped in beside it.
     */
    readonly content: ReactNode
}

/** The atoms the chrome draws: both stylesheets, already rendered as text one file away. */
type AcademyChromeBaseData = {
    /**
     * The academy's theme and ground, already rendered as CSS text by the connected half.
     *
     * A STRING RATHER THAN THE TEMPLATE, and the difference is what makes this half renderable. The
     * words below travel through `inLocale`, which needs the reader's locale, so resolving them is
     * world reading and belongs one file away; what arrives here is the answer.
     */
    readonly themeCss: string
    /** The template's hand-written stylesheet, already gated, or null when it authored none. */
    readonly customCss: string | null
    /** The words of the skip link. */
    readonly skipLabel: string
    /** Resolved copy for the shared appearance control. */
    readonly theme: ThemeToggleProps
}

/** Props for {@link AcademyChromeBase}. */
type AcademyChromeBaseProps = {
    readonly state: AcademyChromeBaseState
    readonly props: AcademyChromeBaseData
}

/**
 * Wrap a page in this academy's theme and its own CSS -- the drawing half.
 *
 * IT OWNS THE PAGE'S ONE MAIN LANDMARK AND THE SKIP LINK THAT TARGETS IT. The skip link is the first
 * focusable element; the routed interior sits inside `main#main-content`, so no route renders a
 * second main.
 *
 * BOTH STYLESHEETS ARE INLINED RATHER THAN LINKED, in that order, so a hand-written rule can
 * override a token rather than losing to one. A stylesheet that arrives after the page has painted
 * shows every visitor an unstyled flash of somebody else's defaults, and the custom CSS has already
 * had its XSS vectors stripped by the backend.
 *
 * @param input - {@link AcademyChromeBaseProps}
 * @returns The themed shell.
 */
export const AcademyChromeBase = (props: AcademyChromeBaseProps) => {
    const { state, props: data } = props
    return (
        <>
            {/*
             * The academy's theme, then the academy's own CSS -- in that order, so a hand-written
             * rule can override a token rather than losing to one.
             */}
            <style>{data.themeCss}</style>
            {data.customCss ? <style>{data.customCss}</style> : null}
            <a className={ACADEMY_SKIP_LINK_CLASS_NAME} href={`#${ACADEMY_MAIN_ID}`}>
                {data.skipLabel}
            </a>
            <div className={ACADEMY_TOOLBAR_CLASS_NAME}>
                <ThemeToggle label={data.theme.label} options={data.theme.options} />
            </div>
            <WorkspaceShell primaryId={ACADEMY_MAIN_ID} primaryLabel={data.skipLabel} primary={state.content} />
        </>
    )
}
