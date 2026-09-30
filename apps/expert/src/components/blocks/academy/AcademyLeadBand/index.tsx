import { Button, Form, Input } from "@starci/grammar/common"
import type { AcademySection, LeadStatus } from "../../../../modules/academy/academy-sections"
import { AcademySectionBand } from "../AcademySectionBand"

type LeadField = readonly [id: string, label: string, kind: "text" | "tel"]
type AcademyLeadBandProps = {
    readonly section: Extract<AcademySection, { readonly kind: "lead" }>
    readonly status: LeadStatus
    readonly submit: (input: { readonly name: string; readonly contact: string }) => void
}

const leadField = (form: FormData, field: string): string => {
    const value = form.get(field)
    return typeof value === "string" ? value : ""
}

type LeadFieldRowProps = {
    readonly id: string
    readonly label: string
    readonly kind: "text" | "tel"
    readonly locked: boolean
}

const LeadFieldRow = ({ id, label, kind, locked }: LeadFieldRowProps) => (
    <Input id={id} name={id} label={label} kind={kind} placeholder={label} isRequired isDisabled={locked} />
)

const leadForm = (
    fields: ReadonlyArray<LeadField>,
    status: LeadStatus,
    submitLabel: string,
    sendingLabel: string,
    onSubmit: (data: FormData) => void,
) => {
    const locked = status === "sending" || status === "sent"
    return (
        <Form onSubmit={onSubmit}>
            <div>
                {fields.map(([id, label, kind]) => (
                    <LeadFieldRow key={id} id={id} label={label} kind={kind} locked={locked} />
                ))}
                <Button variant="primary" type="submit" isDisabled={locked}>
                    {status === "sending" ? sendingLabel : submitLabel}
                </Button>
            </div>
        </Form>
    )
}

/** Draw the only Academy section that collects and submits a public reader's contact details. */
export const AcademyLeadBand = (props: AcademyLeadBandProps) => {
    const fields: ReadonlyArray<LeadField> = [
        ["lead-name", props.section.nameLabel, "text"],
        ["lead-phone", props.section.phoneLabel, "tel"],
    ]
    const send = (form: FormData) => {
        if (props.status === "sending") return
        props.submit({ name: leadField(form, "lead-name"), contact: leadField(form, "lead-phone") })
    }
    return (
        <AcademySectionBand.Band
            alt
            parts={[
                AcademySectionBand.headingPart(props.section.title),
                AcademySectionBand.textPart(props.section.body),
                leadForm(fields, props.status, props.section.submitLabel, props.section.sendingLabel, send),
                ...(props.status === "failed" ? [AcademySectionBand.textPart(props.section.errorMessage)] : []),
                ...(props.status === "sent" ? [AcademySectionBand.textPart(props.section.sentMessage)] : []),
            ]}
        />
    )
}
