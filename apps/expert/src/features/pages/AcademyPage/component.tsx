import { AcademyChrome } from "@/features/layouts/AcademyChrome"
import { AcademySections } from "@/components/blocks/academy/AcademySections"
import type { CoursesQuery } from "@/modules/api/__generated__/graphql"

/**
 * PAGE - the academy's landing screen, drawing half.
 *
 * IT RECEIVES THE CATALOG AND ASKS FOR NOTHING. No fetch, no locale read, no translation call: every
 * value it renders arrived already decided, which is what makes it renderable from a fixture. A
 * component that cannot be rendered from a fixture cannot be tested, because the test would have to
 * stand the world up first.
 *
 * A FAILED FETCH IS AN EMPTY CATALOG, NOT AN ERROR STATE HERE. The `courses` section already owns
 * the empty state a new academy hits on its first day, so an empty array draws correctly and the
 * connected half never has to describe a failure this file would then have to interpret.
 */

/** The atoms the landing screen draws. */
type AcademyPageBaseData = {
    /** The catalog this academy sells, already resolved. */
    readonly courses: ReadonlyArray<NonNullable<CoursesQuery["courses"]["data"]>[number]>
}

/** Props for {@link AcademyPageBase}. */
type AcademyPageBaseProps = {
    readonly props: AcademyPageBaseData
}
const AcademyRoutedContent = ({ courses }: AcademyPageBaseData) => (
    <div>
        <AcademySections courses={[...courses]} />
    </div>
)

/**
 * Draw the academy landing screen.
 *
 * @param props - {@link AcademyPageBaseProps}
 * @returns The page.
 */
export const AcademyPageBase = ({ props }: AcademyPageBaseProps) => (
    <AcademyChrome
        /*
         * `content`, not `children`: the layout names the one routed interior it takes, so nothing
         * else can arrive beside it unannounced. Only the three closed vendor shells may take the
         * anonymous slot.
         *
         * The chrome seats this interior inside its one main landmark, so a reader can skip the chrome
         * above it. The page keeps the section block responsible for its own internal structure.
         */ content={<AcademyRoutedContent courses={[...props.courses]} />}
    />
)
