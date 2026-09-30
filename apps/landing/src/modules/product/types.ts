import type { ReactNode } from "react"
import type { useTranslations } from "next-intl"

/** The four product pages, by the camelCase id that is also their catalog key under `product`. */
export type ProductPageId = "nivoOs" | "systemOfResponsibility" | "applications" | "pricing"

/** A destination: a site path, a fragment, or (activation) the destination that is published later. */
type ActionStructure = {
    readonly key: string
    readonly appearance: "primary" | "secondary" | "tertiary" | "link"
    readonly href?: string
    readonly activation?: true
}

/** One card of a cards block: its catalog key, an optional in-page anchor and its emphasis. */
type CardStructure = {
    readonly key: string
    readonly anchor?: string
    readonly labelled?: true
    readonly strong?: true
}

/** One next-path card: its catalog key and where it leads (a site path, or the activation destination). */
type PathStructure = { readonly key: string; readonly href?: string; readonly activation?: true }

/** One commercial offer card: its catalog key, its bullet ids and its call to action. */
type OfferStructure = {
    readonly key: string
    readonly featured?: true
    readonly bullets: ReadonlyArray<string>
    readonly action: ActionStructure
}

/** One block of a section, by kind; the text of each block is read from the catalog under the block key. */
export type BlockStructure =
    | {
          readonly kind: "cards"
          readonly key: string
          readonly columns: number
          readonly items: ReadonlyArray<CardStructure>
      }
    | { readonly kind: "flow"; readonly key: string; readonly steps: ReadonlyArray<string> }
    | { readonly kind: "status"; readonly key: string; readonly tone: string }
    | { readonly kind: "note"; readonly key: string }
    | { readonly kind: "actions"; readonly key: string; readonly items: ReadonlyArray<ActionStructure> }
    | {
          readonly kind: "selector"
          readonly key: string
          readonly items: ReadonlyArray<{ readonly key: string; readonly href: string }>
      }
    | {
          readonly kind: "table"
          readonly key: string
          readonly headers: ReadonlyArray<string>
          readonly rows: ReadonlyArray<string>
      }
    | { readonly kind: "paths"; readonly key: string; readonly items: ReadonlyArray<PathStructure> }
    | { readonly kind: "offers"; readonly key: string; readonly items: ReadonlyArray<OfferStructure> }
    | { readonly kind: "faq"; readonly key: string; readonly items: ReadonlyArray<string> }

/** One section of a page: its DOM id, its catalog key, its surface tone and its blocks in order. */
export type SectionStructure = {
    /** The DOM id and `data-product-section` value. */
    readonly id: string
    /** The catalog key of the section under `product.<page>.sections`. */
    readonly key: string
    readonly tone: string
    readonly description: boolean
    readonly blocks: ReadonlyArray<BlockStructure>
}

/** The structure of one product page: where it lives, its hero actions and its sections in order. */
export type ProductPageStructure = {
    /** The `data-product-page` value. */
    readonly slug: string
    /** The site path of the page. */
    readonly path: string
    readonly hero: {
        readonly descriptor: boolean
        readonly philosophy: boolean
        readonly actions: ReadonlyArray<ActionStructure>
    }
    readonly sections: ReadonlyArray<SectionStructure>
}

/** Translation lookup scoped to the product message catalog. */
export type ProductTranslate = ReturnType<typeof useTranslations>
/** Site URL resolver that applies the active locale to a product destination. */
export type ProductHref = (href: string) => string

/** Translation and routing context shared by a section's rendering blocks. */
export type ProductBlockContext = {
    readonly t: ProductTranslate
    readonly href: ProductHref
    readonly page: ProductPageId
    readonly section: SectionStructure
}

/** The route feature supplies product-specific actions while blocks preserve their visual ownership. */
export type ProductActionRenderer = (action: ActionStructure, label: string, href: ProductHref) => ReactNode
