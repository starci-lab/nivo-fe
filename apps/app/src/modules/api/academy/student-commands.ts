import { type Outcome } from "@nivo/api"
import { graphql } from "../graphql"
import {
    parseAcademyCourseAccess,
    parseAcademyStudent,
    parseRevokedAcademyCourseAccess,
} from "./payload.guards"
import type {
    AcademyCourseAccess,
    AcademyCourseAccessInput,
    AcademyStudent,
    CreateAcademyStudentInput,
    RevokeAcademyCourseAccessInput,
    RevokedAcademyCourseAccess,
    SetAcademyStudentStatusInput,
    UpdateAcademyStudentInput
} from "./types"

/** Create a student in one owned Academy. */
export const createAcademyStudent = (input: CreateAcademyStudentInput): Promise<Outcome<AcademyStudent>> =>
    graphql(
        `
            mutation CreateAcademyStudent($input: CreateAcademyStudentInput!) {
                createAcademyStudent(request: $input) {
                    data {
                        id
                        name
                        email
                        role
                        status
                        xp
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyStudent,
        {
            input,
        },
    )

/** Update one student's identity fields. */
export const updateAcademyStudent = (input: UpdateAcademyStudentInput): Promise<Outcome<AcademyStudent>> =>
    graphql(
        `
            mutation UpdateAcademyStudent($input: UpdateAcademyStudentInput!) {
                updateAcademyStudent(request: $input) {
                    data {
                        id
                        name
                        email
                        role
                        status
                        xp
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyStudent,
        {
            input,
        },
    )

/** Change one student's active/banned state. */
export const setAcademyStudentStatus = (input: SetAcademyStudentStatusInput): Promise<Outcome<AcademyStudent>> =>
    graphql(
        `
            mutation SetAcademyStudentStatus($input: SetAcademyStudentStatusInput!) {
                setAcademyStudentStatus(request: $input) {
                    data {
                        id
                        name
                        email
                        role
                        status
                        xp
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyStudent,
        {
            input,
        },
    )

/** Grant one course to a student. */
export const grantAcademyCourseAccess = (input: AcademyCourseAccessInput): Promise<Outcome<AcademyCourseAccess>> =>
    graphql(
        `
            mutation GrantAcademyCourseAccess($input: GrantAcademyCourseAccessInput!) {
                grantAcademyCourseAccess(request: $input) {
                    data {
                        id
                        email
                        courseSlug
                        status
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyCourseAccess,
        {
            input,
        },
    )

/** Revoke gifted course access from a student. */
export const revokeAcademyCourseAccess = (
    input: RevokeAcademyCourseAccessInput,
): Promise<Outcome<RevokedAcademyCourseAccess>> =>
    graphql(
        `
            mutation RevokeAcademyCourseAccess($input: RevokeAcademyCourseAccessInput!) {
                revokeAcademyCourseAccess(request: $input) {
                    data {
                        revoked
                        keptPaidPurchase
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseRevokedAcademyCourseAccess,
        {
            input,
        },
    )

/** Update the follow-up state of one Academy lead. */
