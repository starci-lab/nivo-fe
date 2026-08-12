import { Text } from "../../leaves/Text"
import { Input, type InputKind } from "../../leaves/Input"
import { Label } from "../../leaves/Label"
import type { CompositeProps } from "../../contracts/props"
import { Tree } from "../../branches/Tree"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"

/**
 * COMPOSITE - `Field`: one labelled box, with its hint or its refusal underneath.
 *
 * The label, input and optional hint remain independently meaningful values. Their arrangement is
 * fixed here, which makes this a reusable composition rather than one intrinsic leaf value.
 *
 * WHY THE LABEL AND THE BOX ARE ONE COMPOSITE. They are tied by `htmlFor`, and a pair held together
 * by an id is a pair that breaks silently when somebody moves one of them. Keeping their fixed
 * arrangement here means there is no seam for a caller to get wrong.
 *
 * THE REVEAL BELONGS TO THE INPUT LEAF. Whether a password is showing is intrinsic control state,
 * not a fact about the product; the composite only supplies the resolved accessible names.
 *
 * `kind` IS THE WHOLE OF IT. Which keyboard a phone offers, whether a password manager fills the
 * box and what a browser autocompletes all follow from the type attribute, so the caller names the
 * KIND and this file maps all three at once.
 */

/** What is being typed. Not the HTML type - that is this file's business. */
export type FieldKind = InputKind

/** What this composite draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type FieldData = {
    /** The id the label points at. Required: a box no label names is a box nobody can reach. */
    readonly id: string
    /** The form field name, for the submitted payload. */
    readonly name: string
    /** The already-resolved name of the box. Copy, so it never rests. */
    readonly label: string
    /** What is being typed. */
    readonly kind?: FieldKind
    /** The already-resolved example shown in an empty box. */
    readonly placeholder?: string
    /** The already-resolved line under the box - a hint, or a refusal. */
    readonly hint?: string
    /** Whether that line is a refusal, so it is announced and the box is marked. */
    readonly isInvalid?: boolean
    /** Blocks typing - a request already on its way. */
    readonly disabled?: boolean
    /** What the reveal control is called when the secret is hidden. */
    readonly revealLabel?: string
    /** What it is called when the secret is showing. */
    readonly hideLabel?: string
}

/** What typing in it does. */
export type FieldActions = {
    /** Called with the current value on every change. */
    readonly change?: (value: string) => void
}

/** Props for {@link Field}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type FieldProps = CompositeProps<FieldData, FieldActions>

/**
 * Draw a labelled box.
 *
 * @param input - {@link FieldProps}
 */
export const Field = ({ props, on, isLoading = false }: FieldProps) => {
    const content = defineContractComponent("label-field-hint", {
        label: defineLeafComponent("label", {}, () => <Label props={{ htmlFor: props.id, content: props.label }} />),
        field: defineLeafComponent("input", {}, () => (
            <Input
                props={{
                    id: props.id,
                    name: props.name,
                    kind: props.kind,
                    placeholder: props.placeholder,
                    disabled: props.disabled,
                    isInvalid: props.isInvalid,
                    describedBy: props.hint === undefined ? undefined : `${props.id}-hint`,
                    revealLabel: props.revealLabel,
                    hideLabel: props.hideLabel,
                }}
                on={{ change: on?.change }}
                isLoading={isLoading}
            />
        )),
        hint: props.hint === undefined ? undefined : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ id: `${props.id}-hint`, content: props.hint, size: "xs", live: props.isInvalid === true ? "assertive" : "off" }} />
        )),
    })
    return <Tree contract="label-field-hint" render={content} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "composite", world: "pure" } as const
