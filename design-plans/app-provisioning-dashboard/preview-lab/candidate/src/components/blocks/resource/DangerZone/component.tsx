"use client"

import { Button, Heading, Text, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"

/**
 * BLOCK - the lifecycle actions that destroy work, drawing half.
 *
 * TARGET PATH: `apps/app/src/components/blocks/resource/DangerZone/component.tsx`.
 *
 * IT RECEIVES FINISHED WORDS AND ASKS FOR NOTHING. No catalogue lookup, no request: this file is
 * renderable from a fixture, which is what makes the warning above the presses testable without
 * standing up the translation runtime first.
 *
 * THE WEIGHT IS STRUCTURAL, BECAUSE THE CONTROL CANNOT CARRY IT. `Button` offers primary, secondary,
 * outline and ghost - there is no danger variant, and the leaf is outside this phase's write
 * boundary. Revision 1.0 drew this as an ordinary `label-row-over-card` and the result was exactly
 * what that predicts: two presses that destroy data looked as harmless as a save, with the warning
 * trailing the heading on a shared baseline where it reads as a subtitle nobody finishes.
 *
 * `warned-action-panel` answers it without a colour. Its own bounded ground separates the region from
 * the facts above, and the warning takes a full line of its own. A danger VARIANT on the button
 * remains the better answer and stays recorded as a vocabulary proposal - this is what the registry
 * could do about it, not a claim that the question is closed.
 *
 * IT SAYS NO PIXELS (BLOCK-3): the panel and the row of presses are both nodes with stated reasons.
 */

/** What the block draws, once every word is settled. */
export type DangerZoneData = {
    /** The section's heading. */
    readonly title: string
    /** What these actions cost, in one sentence. */
    readonly description: string
    /** The press that destroys the container and builds it again. */
    readonly rebuildLabel: string
    /** The press that destroys the data too. */
    readonly reprovisionLabel: string
}

/** What the block reports upward. */
export type DangerZoneActions = {
    /** Rebuild was pressed. */
    readonly rebuild?: () => void
    /** Reprovision was pressed. */
    readonly reprovision?: () => void
}

/** Props for {@link _DangerZone}. */
export interface DangerZoneViewProps {
    /** The settled words. */
    readonly props: DangerZoneData
    /** What the presses report. */
    readonly on?: DangerZoneActions
}

/**
 * Draw the destructive lifecycle actions.
 *
 * @param input - {@link DangerZoneViewProps}
 * @returns The block node.
 */
export const _DangerZone = ({ props, on }: DangerZoneViewProps) => (
    <Tree
        contract="warned-action-panel"
        render={defineContractComponent("warned-action-panel", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: props.title, level: 2 }} />
            )),
            warning: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: props.description, size: "sm" }} />
            )),
            action: defineContractComponent("inline-action-run", {
                action: [
                    defineLeafComponent("button", {}, () => (
                        <Button props={{ label: props.rebuildLabel, size: "sm", variant: "secondary" }} on={{ press: on?.rebuild }} />
                    )),
                    defineLeafComponent("button", {}, () => (
                        <Button props={{ label: props.reprovisionLabel, size: "sm", variant: "outline" }} on={{ press: on?.reprovision }} />
                    )),
                ],
            }),
        })}
    />
)

/** Source-level tier marker. */
export const meta = { shape: "block", world: "pure" } as const
