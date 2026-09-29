import { describe, expect, it } from "vitest"

import {
    parseCreatedExpertSite,
    parseExpertDeploymentSnapshot,
    parseExpertSiteRows,
    parseProvisionedExpertSite,
    parsePublishedExpertSite,
} from "./expert-sites.guards"

const site = {
    id: "s-1",
    slug: "alpha",
    customDomain: null,
    provisionStatus: "ready",
    status: "live",
}

describe("expert-sites payload parsers", () => {
    it("parseExpertSiteRows refuses a malformed row and an unknown enum member", () => {
        expect(parseExpertSiteRows([site])).toHaveLength(1)
        expect(parseExpertSiteRows("sites")).toBeNull()
        expect(parseExpertSiteRows([{ ...site, provisionStatus: "halfway" }])).toBeNull()
    })

    it("parseCreatedExpertSite refuses a payload missing the slug", () => {
        expect(parseCreatedExpertSite({ id: "s-1", slug: "alpha" })).toEqual({ id: "s-1", slug: "alpha" })
        expect(parseCreatedExpertSite({ id: "s-1" })).toBeNull()
    })

    it("parsePublishedExpertSite refuses a status outside the closed set", () => {
        expect(parsePublishedExpertSite({ id: "s-1", slug: "alpha", status: "draft" })).not.toBeNull()
        expect(parsePublishedExpertSite({ id: "s-1", slug: "alpha", status: "hidden" })).toBeNull()
    })

    it("parseProvisionedExpertSite refuses a missing handle", () => {
        expect(
            parseProvisionedExpertSite({ jobId: "j", expertDeploymentId: "d", publicHost: "a.vn" }),
        ).not.toBeNull()
        expect(parseProvisionedExpertSite({ jobId: "j", publicHost: "a.vn" })).toBeNull()
    })

    it("parseExpertDeploymentSnapshot refuses a non-string status", () => {
        expect(parseExpertDeploymentSnapshot({ id: "d", status: "running", publicHost: null })).not.toBeNull()
        expect(parseExpertDeploymentSnapshot({ id: "d", status: 3, publicHost: null })).toBeNull()
    })
})
