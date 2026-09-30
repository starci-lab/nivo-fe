import { Heading, PageContainer, SurfaceCard, Text } from "@starci/grammar/common"
import type { ReactNode } from "react"
import type { ProductPageId } from "../../../../modules/product/types"
import type { ProductHeroCopy } from "./copy"
import { PRODUCT_HERO_CLASS_NAMES as styles, productHeroRootClassName } from "./classNames"
import { ProductHeroVisual } from "./visual"

/** Resolved copy and the product page's opaque action slots for the complete hero drawing. */
type ProductHeroBaseProps = {
    readonly props: { readonly page: ProductPageId; readonly copy: ProductHeroCopy }
    readonly state: { readonly actions: ReactNode }
}

/** Product hero unites page copy, actions, and its product-specific visual. */
export const ProductHeroBase = (props: ProductHeroBaseProps) => {
    const { page, copy } = props.props
    return (
        <div className={productHeroRootClassName(page)}>
            <SurfaceCard frame="frameless" ariaLabel={copy.title}>
                <PageContainer className={styles.inner}>
                    <div className={styles.copy}>
                        <div className={styles.eyebrow}>
                            <Text as="p" size="xs" tone="accent" weight="semibold">
                                {copy.eyebrow}
                            </Text>
                        </div>
                        <div className={styles.title}>
                            <Heading level={1} scale="display">
                                <Text as="span" id="product-page-title">
                                    {copy.title}
                                </Text>
                            </Heading>
                        </div>
                        {copy.descriptor !== null ? (
                            <Text as="p" size="sm" weight="semibold">
                                {copy.descriptor}
                            </Text>
                        ) : null}
                        <div className={styles.supporting}>
                            <Text as="p" size="md" tone="muted">
                                {copy.supporting}
                            </Text>
                        </div>
                        {copy.philosophy !== null ? (
                            <Text as="p" size="sm" weight="semibold">
                                {copy.philosophy}
                            </Text>
                        ) : null}
                        <div className={styles.actionRow}>{props.state.actions}</div>
                    </div>
                    <ProductHeroVisual page={page} copy={copy} />
                </PageContainer>
            </SurfaceCard>
        </div>
    )
}
