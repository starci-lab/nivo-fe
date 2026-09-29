"use client"

import { useAcademyStudentCrm } from "../../../../hooks/academy/useAcademyStudentCrm"
import { AcademyStudentCrmBase } from "./component"

/** Owner-scoped identity consumed by the student CRM. */
export type AcademyStudentCrmProps = {
    readonly siteId: string
}

/** Connect the pure student CRM to its owner-scoped query and action hook. */
export const AcademyStudentCrm = (props: AcademyStudentCrmProps) => {
    const { siteId } = props
    return <AcademyStudentCrmBase {...useAcademyStudentCrm(siteId)} />
}
