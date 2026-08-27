import { Heading } from "../../leaves/Heading"
import { Text } from "../../leaves/Text"
import { Tree } from "../Tree"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"

/** Closed Markdown renderer input; callers cannot supply HTML, JSX or ReactNode slots. */
export type MarkdownComponentProps = {
    readonly markdown: string
}

type MarkdownBlock =
    | { readonly kind: "heading"; readonly level: 2 | 3 | 4; readonly content: string }
    | { readonly kind: "text"; readonly content: string }

const blocks = (markdown: string): ReadonlyArray<MarkdownBlock> => markdown.trim().split(/\n\s*\n/gu)
    .filter(Boolean)
    .flatMap<MarkdownBlock>((value): ReadonlyArray<MarkdownBlock> => {
        if (value.startsWith("### ")) return [{ kind: "heading", level: 4, content: value.slice(4) } as const]
        if (value.startsWith("## ")) return [{ kind: "heading", level: 3, content: value.slice(3) } as const]
        if (value.startsWith("# ")) return [{ kind: "heading", level: 2, content: value.slice(2) } as const]
        const lines = value.split("\n")
        if (lines.every((line) => /^\s*[-*]\s+/u.test(line))) {
            return lines.map((line) => ({ kind: "text", content: `• ${line.replace(/^\s*[-*]\s+/u, "")}` } as const))
        }
        if (lines.every((line) => /^\s*\d+[.)]\s+/u.test(line))) {
            return lines.map((line) => ({ kind: "text", content: line } as const))
        }
        if (lines.every((line) => line.startsWith("> "))) {
            return [{ kind: "text", content: lines.map((line) => `“${line.slice(2)}”`).join("\n") } as const]
        }
        return [{ kind: "text", content: value.replace(/^```[^\n]*\n?/u, "").replace(/```$/u, "") } as const]
    })

/** Render the trusted Markdown subset solely through the Nivo Grammar contract. */
export const MarkdownComponent = ({ markdown }: MarkdownComponentProps) => (
    <Tree contract="agentos-markdown-content" render={defineContractComponent("agentos-markdown-content", {
        block: blocks(markdown).map((item) => item.kind === "heading"
            ? defineLeafComponent("heading", {}, () => <Heading props={{ content: item.content, level: item.level }} />)
            : defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: item.content, size: "sm" }} />)),
    })} />
)

/** Source-level tier marker for the grammar-owned Markdown branch. */
export const meta = { shape: "branch", world: "pure" } as const
