import { Tree, defineContractProjection } from "@nivo/ui"
import { AcademyChrome } from "@/components/layouts/AcademyChrome"
import { AcademySections } from "@/components/blocks/academy/AcademySections"
import type { Course } from "@/modules/api/academy"

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

/** Props for {@link AcademyPageBase}. */
export interface AcademyPageProps {
    /** The catalog this academy sells, already resolved. */
    readonly courses: ReadonlyArray<Course>
}

/**
 * Draw the academy landing screen.
 *
 * @param props - {@link AcademyPageProps}
 * @returns The page.
 */
export const AcademyPageBase = ({ courses }: AcademyPageProps) => (
    <AcademyChrome
        /*
         * `content`, not `children`: the layout names the one routed interior it takes, so nothing
         * else can arrive beside it unannounced. Only the three closed vendor shells may take the
         * anonymous slot.
         *
         * The interior opens the `host` its registry entry names rather than a hand-written `main`.
         * The landmark lets a reader skip the chrome above it, and `academy-band-run` is the key
         * written for exactly this node - its `why` says the node that stacks the bands adds no
         * measure of its own, which is why its class list is empty.
         */
        content={(
            <Tree
                contract="academy-band-run"
                render={defineContractProjection("academy-band-run", () => (
                    <AcademySections courses={[...courses]} />
                ))}
            />
        )}
    />
)
