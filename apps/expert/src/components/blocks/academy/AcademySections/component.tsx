import { Fragment } from "react"
import type { AcademySectionsBaseProps } from "@/modules/academy/academy-sections"
import { AcademySectionRenderer } from "../AcademySectionRenderer"

export type {
    AcademySection,
    AcademySectionsActions,
    AcademySectionsBaseProps,
    LeadStatus,
    LeadSubmit,
} from "@/modules/academy/academy-sections"

type AcademySectionsProps = AcademySectionsBaseProps

/** Draw the settled Academy page while forwarding image and lead events to its owner. */
export const AcademySectionsBase = (props: AcademySectionsProps) => {
    const { props: data, on } = props
    return (
        <>
            {data.sections.map((section) => (
                <Fragment key={section.id}>
                    <AcademySectionRenderer
                        section={section}
                        state={{
                            failedImageSources: data.failedImageSources,
                            failImage: on.failImage,
                            leadStatus: data.leadStatus,
                            submitLead: (input) => {
                                void on.submitLead(input)
                            },
                        }}
                    />
                </Fragment>
            ))}
        </>
    )
}
