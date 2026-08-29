import { Input, type InputKind } from "../../leaves/Input"
import { Label } from "../../leaves/Label"
import { Text } from "../../leaves/Text"

/** Input type exposed by the shared field. */
export type FieldKind = InputKind

/** Resolved label, value hints, and validation state for a form field. */
export type FieldData = {
    readonly id: string
    readonly name: string
    readonly label: string
    readonly kind?: FieldKind
    readonly placeholder?: string
    readonly hint?: string
    readonly isInvalid?: boolean
    readonly disabled?: boolean
    readonly revealLabel?: string
    readonly hideLabel?: string
}

/** Change event reported by the field. */
export type FieldActions = { readonly change?: (value: string) => void }

/** Props for the labelled input composition. */
export type FieldProps = { readonly props: FieldData; readonly on?: FieldActions; readonly isLoading?: boolean }

/** Render one accessible labelled input and its optional validation hint. */
export const Field = (props: FieldProps) => {
    const { props: data, on, isLoading = false } = props
    return (
        <div>
            <Label props={{ htmlFor: data.id, content: data.label }} />
            <Input
                props={{
                    id: data.id,
                    name: data.name,
                    kind: data.kind,
                    placeholder: data.placeholder,
                    disabled: data.disabled,
                    isInvalid: data.isInvalid,
                    describedBy: data.hint === undefined ? undefined : `${data.id}-hint`,
                    revealLabel: data.revealLabel,
                    hideLabel: data.hideLabel,
                }}
                on={on}
                isLoading={isLoading}
            />
            {data.hint === undefined ? null : (
                <Text props={{ id: `${data.id}-hint`, content: data.hint, size: "xs", live: data.isInvalid === true ? "assertive" : "off" }} />
            )}
        </div>
    )
}