import { Text } from "@starci/grammar/common"
import type { ProductHeroCopy } from "./copy"
import { PRODUCT_HERO_CLASS_NAMES as styles } from "./classNames"

type ProductHeroSignalProps = { readonly copy: ProductHeroCopy }

/** Draw the illustration's resolved summary and supporting sentence. */
export const ProductHeroSignal = (props: ProductHeroSignalProps) => {
    const { copy } = props
    return (
        <div className={styles.signal}>
            <div className={styles.signalLabel}>
                <Text as="p" size="xs" tone="accent" weight="semibold">
                    {copy.signalLabel}
                </Text>
            </div>
            <div className={styles.signalValue}>
                <Text as="span">{copy.signalValue}</Text>
            </div>
            <div className={styles.signalNote}>
                <Text as="span" size="xs" tone="muted">
                    {copy.signalNote}
                </Text>
            </div>
        </div>
    )
}
