import { SectionHeader, Text } from "@starci/grammar/common"
import type { ReactNode } from "react"
import { SITE_CLASS_NAMES } from "./classNames"

/** Copy contract for a route-safe public-site section introduction. */
export type SectionIntroProps = {
    readonly id: string
    readonly eyebrow: string
    readonly title: ReactNode
    readonly description?: string
    readonly action?: ReactNode
    readonly inverse?: boolean
}

/** One semantic section anchor using the installed Common hierarchy. */
export const SectionIntro = (props: SectionIntroProps) => {
    const { id, eyebrow, title, description, action, inverse = false } = props

    return (
        <SectionHeader
            id={id}
            level={2}
            className={inverse ? SITE_CLASS_NAMES.sectionIntroInverse : SITE_CLASS_NAMES.sectionIntro}
            eyebrow={<Text as="span" size="xs" tone={inverse ? "default" : "accent"} weight="semibold">{eyebrow}</Text>}
            title={title}
            description={description === undefined ? undefined : (
                <Text as="p" size="md" tone={inverse ? "default" : "muted"}>{description}</Text>
            )}
            action={action}
        />
    )
}
