import { Text } from "@starci/grammar/common"
import type { PublicFlowStep } from "@/resources/homepage"
import { SITE_CLASS_NAMES } from "./classNames"

/** Props for a code-native explanatory flow with an equivalent text sequence. */
export type ProcessFlowProps = {
    readonly label: string
    readonly steps: readonly PublicFlowStep[]
    readonly emphasisId?: string
    readonly inverse?: boolean
}

/** A semantic ordered flow that becomes vertical without changing reading order. */
export const ProcessFlow = (props: ProcessFlowProps) => {
    const { label, steps, emphasisId, inverse = false } = props

    return (
        <ol className={SITE_CLASS_NAMES.processFlow} aria-label={label} data-inverse={inverse ? "true" : undefined}>
            {steps.map((step, index) => (
                <li
                    className={SITE_CLASS_NAMES.processFlowStep}
                    data-emphasis={step.id === emphasisId ? "true" : undefined}
                    key={step.id}
                >
                    <span className={SITE_CLASS_NAMES.processFlowIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span className={SITE_CLASS_NAMES.processFlowNode} aria-hidden="true" />
                    <span className={SITE_CLASS_NAMES.processFlowCopy}>
                        <Text as="span" size="sm" weight="semibold">{step.label}</Text>
                        <Text as="span" size="xs" tone={inverse ? "default" : "muted"}>{step.description}</Text>
                    </span>
                </li>
            ))}
        </ol>
    )
}
