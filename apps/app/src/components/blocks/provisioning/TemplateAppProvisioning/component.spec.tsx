import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { TemplateAppProvisioningBase, TemplateAppProvisioningPageBase } from "./component"

const steps = [
    {
        ordinal: "1",
        label: "Request",
        state: "current" as const,
        stateLabel: "Active",
    },
]
const props = {
    steps,
    subject: "Template App",
    detail: "Ready",
    statusTitle: "Status",
    statusText: "Working",
    slugLabel: "Slug",
    slugPlaceholder: "academy",
    slugHint: "Lowercase",
    submitLabel: "Create",
    actionLabel: "Retry",
}

describe("TemplateAppProvisioningBase", () => {
    it("shows an editable request and pending submission", () => {
        expect(
            renderToStaticMarkup(
                <TemplateAppProvisioningBase
                    state="request"
                    props={props}
                    on={{ changeSlug: vi.fn(), submit: vi.fn() }}
                />,
            ),
        ).toContain("Create")
        expect(
            renderToStaticMarkup(
                <TemplateAppProvisioningBase state="submitting" props={props} on={{ submit: vi.fn() }} />,
            ),
        ).toContain("Create")
    })

    it("shows action recovery only for unsupported or failed states", () => {
        const failed = renderToStaticMarkup(
            <TemplateAppProvisioningBase state="failed" props={props} on={{ act: vi.fn() }} />,
        )
        const ready = renderToStaticMarkup(
            <TemplateAppProvisioningBase state="ready" props={{ ...props, actionLabel: undefined }} />,
        )
        expect(failed).toContain("Retry")
        expect(ready).not.toContain("Retry")
    })
})

describe("TemplateAppProvisioningPageBase", () => {
    const labels = {
        path: "Path",
        apps: "Apps",
        createTitle: "Create",
        createDescription: "Configure",
        provisioningTitle: "Provisioning",
        provisioningDescription: "Resume",
    }

    it("draws new and resumed route identity around the lifecycle screen", () => {
        const created = renderToStaticMarkup(
            <TemplateAppProvisioningPageBase
                props={{ mode: "new", templateKey: "ai_academy", labels }}
                on={{ openApps: vi.fn() }}
            >
                <div>New lifecycle</div>
            </TemplateAppProvisioningPageBase>,
        )
        const resumed = renderToStaticMarkup(
            <TemplateAppProvisioningPageBase
                props={{ mode: "resume", siteId: "site-1", labels }}
                on={{ openApps: vi.fn() }}
            >
                <div>Resumed lifecycle</div>
            </TemplateAppProvisioningPageBase>,
        )

        expect(created).toContain("Create")
        expect(created).toContain("New lifecycle")
        expect(resumed).toContain("Provisioning")
        expect(resumed).toContain("Resumed lifecycle")
    })
})
