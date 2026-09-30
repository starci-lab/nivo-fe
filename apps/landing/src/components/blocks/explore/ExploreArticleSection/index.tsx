import { Heading, SurfaceCard, Text } from "@starci/grammar/common"
import { CLASS_NAMES as C } from "./classNames"

type ExploreArticleSectionProps = {
    readonly index: number
    readonly labelledBy: string
    readonly title: string
    readonly body: string
}

/** One evidence-backed section in an Idea article. */
const ExploreArticleSection = ({ index, labelledBy, title, body }: ExploreArticleSectionProps) => (
    <SurfaceCard ariaLabel={title}>
        <div className={C.section} aria-labelledby={labelledBy}>
            <Text as="span">{String(index + 1).padStart(2, "0")}</Text>
            <Heading level={2}>
                <Text as="span" id={labelledBy}>
                    {title}
                </Text>
            </Heading>
            <div className={C.paragraph}>
                <Text as="p" size="md">
                    {body}
                </Text>
            </div>
        </div>
    </SurfaceCard>
)

export default ExploreArticleSection
