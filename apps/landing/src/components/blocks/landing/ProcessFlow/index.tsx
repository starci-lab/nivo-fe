import { Text } from "@starci/grammar/common"
import type { PublicFlowStep } from "../../../../modules/landing/homepage"
import {
    processFlowClassName,
    processFlowCopyClassName,
    processFlowIndexClassName,
    processFlowNodeClassName,
    processFlowStepClassName,
} from "./classNames"

/** Props for a code-native explanatory flow with an equivalent text sequence. */
export type ProcessFlowProps = {
    readonly label: string
    readonly steps: ReadonlyArray<PublicFlowStep>
    readonly emphasisId?: string
    readonly inverse?: boolean
    readonly columns?: 4 | 5
    readonly centered?: boolean
}

/** A semantic ordered flow that becomes vertical without changing reading order. */
export const ProcessFlow = (props: ProcessFlowProps) => {
    const { label, steps, emphasisId, inverse = false, columns = 5, centered = false } = props

    return (
        <ol
            className={processFlowClassName(columns, inverse, centered)}
            aria-label={label}
        >
            {steps.map((step, index) => {
                const emphasized = step.id === emphasisId

                return (
                    <li
                        className={processFlowStepClassName(inverse, centered)}
                        data-emphasis={emphasized ? "true" : undefined}
                        key={step.id}
                    >
                        <span
                            className={processFlowIndexClassName(inverse)}
                            aria-hidden="true"
                        >
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                            className={processFlowNodeClassName(emphasized)}
                            aria-hidden="true"
                        />
                        <span className={processFlowCopyClassName(centered, inverse)}>
                            <Text as="span" size="sm" weight="semibold">
                                {step.label}
                            </Text>
                            <Text
                                as="span"
                                size="xs"
                                tone={inverse ? "default" : "muted"}
                            >
                                {step.description}
                            </Text>
                        </span>
                    </li>
                )
            })}
        </ol>
    )
}
