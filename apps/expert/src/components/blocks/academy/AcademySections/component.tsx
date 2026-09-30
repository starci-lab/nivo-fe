import { Fragment, useMemo } from "react"
import type { AcademySectionsBaseProps } from "../../../../modules/academy/academy-sections"
import { AcademySectionRenderer } from "../AcademySectionRenderer"

export type {
    AcademySection,
    AcademySectionsActions,
    AcademySectionsBaseProps,
    LeadStatus,
    LeadSubmit,
} from "../../../../modules/academy/academy-sections"

/** The lead form's two answers, as the section renderer hands them up. */
type LeadInput = { readonly name: string; readonly contact: string }

type AcademySectionsProps = AcademySectionsBaseProps

/** Draw the settled Academy page while forwarding image and lead events to its owner. */
export const AcademySectionsBase = (props: AcademySectionsProps) => {
    const { props: data, on } = props
    const { failImage, submitLead } = on
    const sectionState = useMemo(
        () => ({
            failedImageSources: data.failedImageSources,
            failImage,
            leadStatus: data.leadStatus,
            submitLead: (input: LeadInput) => {
                void submitLead(input)
            },
        }),
        [data.failedImageSources, data.leadStatus, failImage, submitLead],
    )
    return (
        <>
            {data.sections.map((section) => (
                <Fragment key={section.id}>
                    <AcademySectionRenderer
                        section={section}
                        state={sectionState}
                    />
                </Fragment>
            ))}
        </>
    )
}
