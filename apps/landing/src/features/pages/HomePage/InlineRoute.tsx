import { Text } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import { CLASS_NAMES } from "./classNames"

type InlineRouteProps = { readonly parts: ReadonlyArray<string>; readonly joiner: string }
const NEXT_CHIP_ICON_PROPS = { name: "next", usage: "chip" } as const

/** Render a semantic route with decorative separators and one accessible label. */
export const InlineRoute = (props: InlineRouteProps) => (
    <strong className={CLASS_NAMES.inlineRoute} aria-label={props.parts.join(props.joiner)}>
        {props.parts.map((part, index) => (
            <Text
                as="span"
                key={part}
                startContent={index === 0 ? undefined : <NivoIcon props={NEXT_CHIP_ICON_PROPS} />}
            >
                {part}
            </Text>
        ))}
    </strong>
)
