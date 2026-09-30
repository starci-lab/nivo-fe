import type { IconSourceProps } from "@starci/grammar/common"

/** SVG props supplied by the grammar Icon that renders the glyph. */
type RefusalGlyphProps = IconSourceProps

/** The refusal mark: a current-color circle carrying an exclamation. */
export const RefusalGlyph = (props: RefusalGlyphProps) => (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth={1.5} />
        <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M8 4.75v3.5" />
        <circle cx="8" cy="11.25" r="1" fill="currentColor" />
    </svg>
)
