import { NivoIcon } from "@nivo/ui"
import { CLASS_NAMES } from "./classNames"

type InlineRouteProps = { readonly parts: ReadonlyArray<string>; readonly joiner: string }

const NEXT_CHIP_ICON_PROPS = { name: "next", usage: "chip" } as const

/** Render a semantic route whose separators are product icons instead of text glyphs. */
export const InlineRoute = ({ parts, joiner }: InlineRouteProps) => (
    <span className={CLASS_NAMES.inlineRoute} aria-label={parts.join(joiner)}>
        {parts.map((part, index) => (
            <span key={part}>
                {index > 0 ? (
                    <span aria-hidden="true">
                        <NivoIcon props={NEXT_CHIP_ICON_PROPS} />
                    </span>
                ) : null}
                <span>{part}</span>
            </span>
        ))}
    </span>
)
