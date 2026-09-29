/**
 * The academy an expert runs: growth, students and their course access, leads, and the provider integrations.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */
export {
    myAcademyGrowthSnapshot,
    myAcademyIntegrations,
    myAcademyStudentDetail,
    myAcademyStudents,
    myExpertSiteLeads,
} from "./reads"
export {
    createAcademyStudent,
    grantAcademyCourseAccess,
    revokeAcademyCourseAccess,
    setAcademyStudentStatus,
    updateAcademyStudent,
} from "./student-commands"
export { draftLeadReply, updateExpertSiteLead } from "./lead-commands"
export {
    beginAcademyZaloAuthorization,
    createAcademyWebhook,
    disableAcademyWebhook,
    disconnectAcademyGoogleOAuth,
    rotateAcademyWebhookSecret,
    saveAcademyAnalytics,
    saveAcademyCredential,
    saveAcademyGoogleOAuth,
    setAcademyCustomDomain,
} from "./provider-commands"
export type {
    AcademyCredentialSaveResult,
    AcademyCourseAccess,
    AcademyCourseAccessInput,
    AcademyGrowthSnapshot,
    AcademyIntegrations,
    AcademyProviderStatus,
    AcademyStudent,
    AcademyStudentCourseProgress,
    AcademyStudentDetail,
    AcademyStudentOrder,
    AcademyStudentsPage,
    AcademyWebhookSecretResult,
    AcademyWebhookStatus,
    AcademyZaloAuthorization,
    CreateAcademyStudentInput,
    CreateAcademyWebhookInput,
    DraftLeadReplyInput,
    DraftedLeadReply,
    ExpertSiteLead,
    MyAcademyStudentsInput,
    RevokeAcademyCourseAccessInput,
    RevokedAcademyCourseAccess,
    RotateAcademyWebhookSecretInput,
    SaveAcademyAnalyticsInput,
    SaveAcademyCredentialInput,
    SaveAcademyGoogleOAuthInput,
    SetAcademyCustomDomainInput,
    SetAcademyStudentStatusInput,
    UpdateAcademyStudentInput,
    UpdateExpertSiteLeadInput,
} from "./types"
