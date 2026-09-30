import { Heading, Text } from "@starci/grammar/common"

/** Raw Markdown subset accepted by the safe renderer. */
export type MarkdownComponentProps = { readonly markdown: string }
type MarkdownBlock =
    | { readonly kind: "heading"; readonly level: 2 | 3 | 4; readonly content: string }
    | { readonly kind: "text"; readonly content: string }
type KeyedMarkdownBlock = { readonly key: string; readonly block: MarkdownBlock }
const blocks = (markdown: string): ReadonlyArray<MarkdownBlock> =>
    markdown
        .trim()
        .split(/\n\s*\n/gu)
        .filter(Boolean)
        .flatMap((value): ReadonlyArray<MarkdownBlock> => {
            if (value.startsWith("### ")) return [{ kind: "heading", level: 4, content: value.slice(4) }]
            if (value.startsWith("## ")) return [{ kind: "heading", level: 3, content: value.slice(3) }]
            if (value.startsWith("# ")) return [{ kind: "heading", level: 2, content: value.slice(2) }]
            return [
                { kind: "text", content: value.replace(/^\x60\x60\x60[^\n]*\n?/u, "").replace(/\x60\x60\x60$/u, "") },
            ]
        })

/** Give each block a key built once from its kind, its content and how many equal blocks came before it. */
const keyedBlocks = (markdown: string): ReadonlyArray<KeyedMarkdownBlock> => {
    const seen = new Map<string, number>()
    return blocks(markdown).map((block) => {
        const value = `${block.kind}:${block.content}`
        const occurrence = seen.get(value) ?? 0
        seen.set(value, occurrence + 1)
        return { key: `${value}:${String(occurrence)}`, block }
    })
}

/** Render the trusted Markdown subset without an HTML escape hatch. */
export const MarkdownComponent = (props: MarkdownComponentProps) => (
    <div>
        {keyedBlocks(props.markdown).map(({ key, block }) =>
            block.kind === "heading" ? (
                <Heading key={key} level={block.level}>
                    {block.content}
                </Heading>
            ) : (
                <Text key={key} size="sm">
                    {block.content}
                </Text>
            ),
        )}
    </div>
)
