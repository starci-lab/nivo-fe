"use client"

import { useAcademySections } from "../../../../hooks/academy/useAcademySections"
import type { CoursesQuery } from "../../../../modules/api/__generated__/graphql"
import { AcademySectionsBase } from "./component"

/** Catalog supplied by the server-rendered public page. */
export type AcademySectionsProps = {
    readonly courses: ReadonlyArray<NonNullable<CoursesQuery["courses"]["data"]>[number]>
}

export type { AcademySection, LeadSubmit } from "../../../../modules/academy/academy-sections"

/** Connect the Academy section list to translations, lead submission and image fallback state. */
export const AcademySections = (props: AcademySectionsProps) => (
    <AcademySectionsBase {...useAcademySections(props.courses)} />
)
