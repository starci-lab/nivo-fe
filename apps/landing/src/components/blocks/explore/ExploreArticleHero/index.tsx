import { DescriptionList, PageContainer, Text } from "@starci/grammar/common"
import type { ReactNode } from "react"
import { CLASS_NAMES as C } from "./classNames"

type ExploreArticleMeta = { readonly label: string; readonly value: string }
type ExploreArticleHeroProps = {
    readonly children: ReactNode
    readonly thesis: string
    readonly metadata: ReadonlyArray<ExploreArticleMeta>
    readonly dateNote: string
}

/** Editorial header surface for one approved Idea. */
const ExploreArticleHero = ({ children, thesis, metadata, dateNote }: ExploreArticleHeroProps) => (
    <header className={C.header}>
        <Text as="span" aria-hidden="true" />
        <PageContainer>
            <div className={C.inner}>
                {children}
                <Text as="p">{thesis}</Text>
                <DescriptionList
                    className={C.metadata}
                    items={metadata.map(({ label, value }) => ({ id: label, term: label, description: value }))}
                />
                <Text as="p" size="sm" tone="muted">
                    {dateNote}
                </Text>
            </div>
        </PageContainer>
    </header>
)

export default ExploreArticleHero
