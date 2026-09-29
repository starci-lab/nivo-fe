import type { ReactNode } from "react"
import { PageContainer } from "@starci/grammar/common"
import type { ProductBlockContext, SectionStructure } from "../../../../modules/product/types"
import { PRODUCT_SECTION_CLASS_NAMES as styles, productSectionClassName } from "./classNames"

type ProductSectionProps = {
    readonly section: SectionStructure
    readonly context: ProductBlockContext
    readonly intro: ReactNode
    readonly children: ReactNode
}

/** Product sections combine their heading, content blocks, and tone. */
export const ProductSection = (props: ProductSectionProps) => {
    const { section, context, intro, children } = props
    return (
    <section
        className={productSectionClassName(context)}
        data-product-section={section.id}
        aria-labelledby={section.id}
    >
        <PageContainer>
            {intro}
            <div className={styles.body}>{children}</div>
        </PageContainer>
    </section>
    )
}
