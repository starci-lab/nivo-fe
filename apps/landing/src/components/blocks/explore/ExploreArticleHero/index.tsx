import { PageContainer, Text } from "@starci/grammar/common"
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
        <span className={C.ring} aria-hidden="true" />
        <PageContainer>
            <div className={C.inner}>
                {children}
                <p className={C.thesis}>{thesis}</p>
                <dl className={C.metadata}>
                    {metadata.map(({ label, value }) => (
                        <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
                <Text as="p" size="sm" tone="muted">
                    {dateNote}
                </Text>
            </div>
        </PageContainer>
    </header>
)

export default ExploreArticleHero
