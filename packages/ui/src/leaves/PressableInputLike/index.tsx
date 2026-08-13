import { Button, Kbd } from "@heroui/react"
import { Icon } from "../Icon"
import type { LeafProps } from "../../contracts/props"

/** Copy shown by the navbar's input-looking press target. */
export type PressableInputLikeData = {
    readonly placeholder: string
    readonly label: string
    readonly shortcut?: string
}

/** What pressing the input-looking control reports. */
export type PressableInputLikeActions = {
    readonly press?: () => void
}

/** Fixed props for the navbar search trigger. */
export type PressableInputLikeProps = LeafProps<PressableInputLikeData, PressableInputLikeActions>

/**
 * Draw a button with the exact field appearance used by the legacy navbar.
 * It never accepts text: the whole field is one press target that opens search.
 */
export const PressableInputLike = ({ props, on }: PressableInputLikeProps) => (
    <Button
        data-tier="leaf"
        data-component="PressableInputLike"
        variant="outline"
        aria-label={props.label}
        onPress={on?.press}
        className="h-9 min-h-9 w-64 justify-between gap-2 rounded-field border-[var(--field-border)] bg-field px-3 font-normal text-field-foreground shadow-[var(--field-shadow)] hover:bg-field"
    >
        <span className="inline-flex min-w-0 items-center gap-2">
            <Icon props={{ name: "search", role: "leading" }} />
            <span className="truncate text-sm text-field-placeholder">{props.placeholder}</span>
        </span>
        {props.shortcut === undefined ? null : <Kbd>{props.shortcut}</Kbd>}
    </Button>
)

/** Source-level tier marker for the input-looking control. */
export const meta = { shape: "leaf", world: "pure" } as const
