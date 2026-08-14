import {
    Button, Heading, Text, Tree,
    defineContractComponent, defineLeafComponent,
} from "@nivo/ui"

/**
 * PAGE - the member dashboard, direction D-B.
 *
 * ONE BAND, THREE PARTS. `stacked-band-parts` admits a repeating `part` with
 * `restingCount: 3`, so three coordinate siblings is the shape the contract
 * table already rests at, and D-B chose exactly that relationship. The page
 * introduces no new contract entry and no per-band block.
 *
 * EACH PART IS `heading-body-action-stack`, NOT `centred-empty-notice`, and the
 * first attempt got this wrong in a way worth recording: `centred-empty-notice`
 * carries a notice and nothing else, so the three bands rendered with no names
 * at all. D-B is three NAMED coordinate bands - Tri thuc, Danh, Loi - and a key
 * that cannot hold a name silently deletes the thing that makes it this
 * direction rather than a stack of alerts.
 *
 * THE PAGE WRITES NO LAYOUT CLASS. `banded-measure-column-on-surface` owns the
 * surface, the measure, the padding and the separator.
 */

/** One named band: its heading, its line of copy, and at most one action. */
export type DashboardBand = {
    /** The band name, from the owner's own mindmap. */
    readonly heading: string
    /** One line saying where the reader stands in that band. */
    readonly body: string
    /** The action, when the band has somewhere to send them. */
    readonly actionLabel?: string
}

/** Props for {@link MemberDashboardPage}. */
export type MemberDashboardPageProps = {
    /** Tri thuc: what the reader is learning. */
    readonly knowledge: DashboardBand
    /** Danh: what the reader has earned. */
    readonly standing: DashboardBand
    /** Loi: what the reader is owed. */
    readonly earnings: DashboardBand
}

/**
 * Draw one named band.
 *
 * @param band - That band's heading, copy and optional action.
 * @returns The part, as `stacked-band-parts` admits it.
 */
const bandPart = (band: DashboardBand) =>
    defineContractComponent("heading-body-action-stack", {
        heading: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: band.heading, level: 2 }} />
        )),
        body: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: band.body, size: "sm", tone: "muted" }} />
        )),
        // omitted rather than disabled when the band has nowhere to send the
        // reader: a control that presses to nothing is worse than no control
        ...(band.actionLabel === undefined ? {} : {
            action: defineLeafComponent("button", {}, () => (
                <Button props={{ label: band.actionLabel as string, variant: "outline" }} />
            )),
        }),
    })

/**
 * Draw the member dashboard.
 *
 * @param input - {@link MemberDashboardPageProps}
 * @returns The page.
 */
export const MemberDashboardPage = ({ knowledge, standing, earnings }: MemberDashboardPageProps) => (
    <Tree
        contract="banded-measure-column-on-surface"
        render={defineContractComponent("banded-measure-column-on-surface", {
            column: defineContractComponent("stacked-band-parts", {
                // three parts, in the order the owner's mindmap draws them; the
                // even gap between them IS the coordinate relationship
                part: [
                    bandPart(knowledge),
                    bandPart(standing),
                    bandPart(earnings),
                ],
            }),
        })}
    />
)

/** Source-level tier marker. */
export const meta = { world: "pure", domain: "dashboard" } as const
