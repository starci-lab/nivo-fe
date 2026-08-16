import { Link as HeroLink } from "@heroui/react"
import { buttonVariants } from "@heroui/styles"
import type { LeafProps } from "../../contracts/props"
import type { ButtonSize, ButtonVariant } from "../Button"

/** Native navigation rendered with the same visual vocabulary as an action button. */
export type ActionLinkData = {
    readonly label: string
    readonly href: string
    readonly target?: "_blank" | "_self"
    readonly variant?: ButtonVariant
    readonly size?: ButtonSize
}

/** Optional in-page consequence observed before native navigation starts. */
export type ActionLinkActions = { readonly press?: () => void }

/** Props for the native action link leaf. */
export type ActionLinkProps = LeafProps<ActionLinkData, ActionLinkActions>

/** Preserve browser-native new-tab behavior for destinations that must survive popup blocking. */
export const ActionLink = ({ props, on }: ActionLinkProps) => (
    <HeroLink
        data-tier="leaf"
        data-component="ActionLink"
        href={props.href}
        target={props.target}
        rel={props.target === "_blank" ? "noopener" : undefined}
        onPress={on?.press}
        className={buttonVariants({ variant: props.variant ?? "secondary", size: props.size ?? "md" })}
    >
        {props.label}
    </HeroLink>
)

/** Source-level tier marker for one atomic native navigation target. */
export const meta = { shape: "leaf", world: "pure" } as const
