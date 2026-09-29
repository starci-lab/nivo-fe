import type { BlockStructure, ProductBlockContext } from "../../../../modules/product/types"
import { PRODUCT_TABLE_CLASS_NAMES as styles } from "./classNames"

type ProductTableProps = {
    readonly block: Extract<BlockStructure, { kind: "table" }>
    readonly context: ProductBlockContext
}

/** Product tables render structured comparisons with a horizontally scrollable frame. */
export const ProductTable = (props: ProductTableProps) => {
    const { block, context } = props
    return (
    <div className={styles.frame}>
        <table className={styles.table}>
            <caption className={styles.screenReaderOnly}>
                {context.t(context.page + ".sections." + context.section.key + "." + block.key + ".label")}
            </caption>
            <thead>
                <tr>
                    {block.headers.map((header) => (
                        <th className={styles.headerCell} scope="col" key={header}>
                            {context.t(
                                context.page +
                                    ".sections." +
                                    context.section.key +
                                    "." +
                                    block.key +
                                    ".headers." +
                                    header,
                            )}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {block.rows.map((row) => (
                    <tr className={styles.lastRow} key={row}>
                        {block.headers.map((header, cellIndex) => {
                            const cell = context.t(
                                context.page +
                                    ".sections." +
                                    context.section.key +
                                    "." +
                                    block.key +
                                    ".rows." +
                                    row +
                                    "." +
                                    header,
                            )
                            return cellIndex === 0 && block.headers.length > 2 ? (
                                <th className={styles.cell} scope="row" key={header}>
                                    {cell}
                                </th>
                            ) : (
                                <td className={styles.cell} key={header}>
                                    {cell}
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    )
}
