import { describe, expect, it } from "vitest"
import * as academy from "./index"

describe("academy API", () => {
    it("re-exports the previous runtime operation surface", () => {
        expect(Object.keys(academy).sort()).toEqual([
                  "beginAcademyZaloAuthorization",
                  "createAcademyStudent",
                  "createAcademyWebhook",
                  "disableAcademyWebhook",
                  "disconnectAcademyGoogleOAuth",
                  "draftLeadReply",
                  "grantAcademyCourseAccess",
                  "myAcademyGrowthSnapshot",
                  "myAcademyIntegrations",
                  "myAcademyStudentDetail",
                  "myAcademyStudents",
                  "myExpertSiteLeads",
                  "revokeAcademyCourseAccess",
                  "rotateAcademyWebhookSecret",
                  "saveAcademyAnalytics",
                  "saveAcademyCredential",
                  "saveAcademyGoogleOAuth",
                  "setAcademyCustomDomain",
                  "setAcademyStudentStatus",
                  "updateAcademyStudent",
                  "updateExpertSiteLead"
        ])
    })
})
