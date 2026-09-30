import { type Outcome } from "@nivo/api"
import {
    MyAcademyGrowthSnapshotDocument,
    MyAcademyIntegrationsDocument,
    MyAcademyStudentDetailDocument,
    MyAcademyStudentsDocument,
    MyExpertSiteLeadsDocument,
} from "../__generated__/core"
import type {
    AcademyGrowthSnapshot,
    AcademyStudentDetail,
    AcademyStudentsPage,
    ExpertSiteLeadFieldsFragment,
    MyAcademyIntegrations,
    MyAcademyStudentsInput,
} from "../__generated__/core"
import { graphql } from "../graphql"
import {
    parseAcademyGrowthSnapshot,
    parseAcademyIntegrations,
    parseAcademyStudentDetail,
    parseAcademyStudentsPage,
    parseExpertSiteLeads,
} from "./payload.guards"

/** Read Academy growth through the owner-scoped Nivo bridge. */
export const myAcademyGrowthSnapshot = (siteId: string): Promise<Outcome<AcademyGrowthSnapshot>> =>
    graphql(
        MyAcademyGrowthSnapshotDocument,
        parseAcademyGrowthSnapshot,
        { request: { siteId } },
    )

/** Read one bounded student page through the owner-scoped Nivo bridge. */
export const myAcademyStudents = (input: MyAcademyStudentsInput): Promise<Outcome<AcademyStudentsPage>> =>
    graphql(
        MyAcademyStudentsDocument,
        parseAcademyStudentsPage,
        { input },
    )

/** Read one student detail after ownership is checked by Core. */
export const myAcademyStudentDetail = (
    siteId: string,
    memberId: string,
): Promise<Outcome<AcademyStudentDetail>> =>
    graphql(
        MyAcademyStudentDetailDocument,
        parseAcademyStudentDetail,
        { request: { siteId, memberId } },
    )

/** Read all safe provider states for one owned Academy. */
export const myAcademyIntegrations = (siteId: string): Promise<Outcome<MyAcademyIntegrations>> =>
    graphql(
        MyAcademyIntegrationsDocument,
        parseAcademyIntegrations,
        { request: { siteId } },
    )

/** Read leads received by one owned Academy. */
export const myExpertSiteLeads = (
    siteId: string,
    limit = 20,
    offset = 0,
): Promise<Outcome<ReadonlyArray<ExpertSiteLeadFieldsFragment>>> =>
    graphql(
        MyExpertSiteLeadsDocument,
        parseExpertSiteLeads,
        { request: { siteId, limit, offset } },
    )
