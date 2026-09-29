import { Text } from "@starci/grammar/common"
import type { BlockStructure, ProductBlockContext } from "../../../../modules/product/types"
import {
    PRODUCT_FLOW_CLASS_NAMES as styles,
    productFlowClassName,
    productFlowNodeClassName,
    productFlowStepClassName,
} from "./classNames"

type ProductFlowProps = {
    readonly block: Extract<BlockStructure, { kind: "flow" }>
    readonly context: ProductBlockContext
}

/** Product flows show ordered operating steps with a responsive timeline. */
export const ProductFlow = (props: ProductFlowProps) => {
    const { block, context } = props
    const steps = block.steps.map((step) => ({
        key: step,
        label: context.t(
            context.page + ".sections." + context.section.key + "." + block.key + ".steps." + step + ".label",
        ),
        description: context.t(
            context.page +
                ".sections." +
                context.section.key +
                "." +
                block.key +
                ".steps." +
                step +
                ".description",
        ),
    }))
    return (
        <figure>
            <ol
                className={productFlowClassName(context, block.steps.length)}
                aria-label={context.t(
                    context.page + ".sections." + context.section.key + "." + block.key + ".label",
                )}
            >
                {steps.map((step) => (
                    <li className={productFlowStepClassName(context)} key={step.key}>
                        <span className={productFlowNodeClassName(context)} aria-hidden="true" />
                        <span className={styles.copy}>
                            <Text as="span" size="sm" weight="semibold">
                                {step.label}
                            </Text>
                            <Text as="span" size="xs" tone="muted">
                                {step.description}
                            </Text>
                        </span>
                    </li>
                ))}
            </ol>
            <figcaption className={styles.screenReaderOnly}>
                {steps.map((step) => step.label + ": " + step.description).join("; ")}
            </figcaption>
        </figure>
    )
}
