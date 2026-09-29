import { Heading, Text } from "@starci/grammar/common"
import { CLASS_NAMES as C } from "./classNames"

type ExploreArticleSectionProps = {
    readonly index: number
    readonly labelledBy: string
    readonly title: string
    readonly body: string
}

/** One evidence-backed section in an Idea article. */
const ExploreArticleSection = ({ index, labelledBy, title, body }: ExploreArticleSectionProps) => (
    <section className={C.section} aria-labelledby={labelledBy}>
        <span className={C.index}>{String(index + 1).padStart(2, "0")}</span>
        <Heading level={2}>
            <span id={labelledBy}>{title}</span>
        </Heading>
        <div className={C.paragraph}>
            <Text as="p" size="md">
                {body}
            </Text>
        </div>
    </section>
)

export default ExploreArticleSection
