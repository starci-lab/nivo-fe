import { type Outcome } from "@nivo/api"
import {
    CreateAcademyStudentDocument,
    GrantAcademyCourseAccessDocument,
    RevokeAcademyCourseAccessDocument,
    SetAcademyStudentStatusDocument,
    UpdateAcademyStudentDocument,
} from "../__generated__/core"
import type {
    AcademyCourseAccessView,
    AcademyStudentView,
    CreateAcademyStudentInput,
    GrantAcademyCourseAccessInput,
    RevokeAcademyCourseAccessInput,
    RevokedAcademyAccessView,
    SetAcademyStudentStatusInput,
    UpdateAcademyStudentInput,
} from "../__generated__/core"
import { graphql } from "../graphql"
import {
    parseAcademyCourseAccess,
    parseAcademyStudent,
    parseRevokedAcademyCourseAccess,
} from "./payload.guards"

/** Create a student in one owned Academy. */
export const createAcademyStudent = (input: CreateAcademyStudentInput): Promise<Outcome<AcademyStudentView>> =>
    graphql(
        CreateAcademyStudentDocument,
        parseAcademyStudent,
        { input },
    )

/** Update one student's identity fields. */
export const updateAcademyStudent = (input: UpdateAcademyStudentInput): Promise<Outcome<AcademyStudentView>> =>
    graphql(
        UpdateAcademyStudentDocument,
        parseAcademyStudent,
        { input },
    )

/** Change one student's active/banned state. */
export const setAcademyStudentStatus = (
    input: SetAcademyStudentStatusInput,
): Promise<Outcome<AcademyStudentView>> =>
    graphql(
        SetAcademyStudentStatusDocument,
        parseAcademyStudent,
        { input },
    )

/** Grant one course to a student. */
export const grantAcademyCourseAccess = (
    input: GrantAcademyCourseAccessInput,
): Promise<Outcome<AcademyCourseAccessView>> =>
    graphql(
        GrantAcademyCourseAccessDocument,
        parseAcademyCourseAccess,
        { input },
    )

/** Revoke gifted course access from a student. */
export const revokeAcademyCourseAccess = (
    input: RevokeAcademyCourseAccessInput,
): Promise<Outcome<RevokedAcademyAccessView>> =>
    graphql(
        RevokeAcademyCourseAccessDocument,
        parseRevokedAcademyCourseAccess,
        { input },
    )
