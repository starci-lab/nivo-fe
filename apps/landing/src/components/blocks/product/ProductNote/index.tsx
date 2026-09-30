import { Heading } from "@starci/grammar/common"
import type { BlockStructure, ProductBlockContext } from "../../../../modules/product/types"
import { PRODUCT_NOTE_CLASS_NAMES } from "./classNames"

type ProductNoteProps = {
    readonly block: Extract<BlockStructure, { kind: "note" }>
    readonly context: ProductBlockContext
}

/** Product notes give a section one emphasized supporting statement. */
export const ProductNote = (props: ProductNoteProps) => {
    const { block, context } = props
    const t = context.t
    return (
    <div className={PRODUCT_NOTE_CLASS_NAMES.wrapper}>
        <Heading level={3}>
            {t(`${context.page}.sections.${context.section.key}.${block.key}.text`)}
        </Heading>
    </div>
    )
}
