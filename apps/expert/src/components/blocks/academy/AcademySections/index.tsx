"use client"

import { useAcademySections } from "../../../../hooks/academy/useAcademySections"
import type { Course } from "../../../../modules/api/academy"
import { AcademySectionsBase } from "./component"

/** Catalog supplied by the server-rendered public page. */
export type AcademySectionsProps = {
    readonly courses: ReadonlyArray<Course>
}

export type { AcademySection, LeadSubmit } from "../../../../modules/academy/academy-sections"

/** Connect the Academy section list to translations, lead submission and image fallback state. */
export const AcademySections = (props: AcademySectionsProps) => (
    <AcademySectionsBase {...useAcademySections(props.courses)} />
)
