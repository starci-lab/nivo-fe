import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { TemplateAppProvisioningBase } from "./component"

const steps = [{
    ordinal: "1",
    label: "Request",
    state: "current" as const,
    stateLabel: "Active",
}]
const props = { steps, subject: "Template App", detail: "Ready", statusTitle: "Status", statusText: "Working", slugLabel: "Slug", slugPlaceholder: "academy", slugHint: "Lowercase", submitLabel: "Create", actionLabel: "Retry" }

describe("template app provisioning lifecycle", () => {
    it("shows an editable request and pending submission", () => {
        expect(renderToStaticMarkup(<TemplateAppProvisioningBase state="request" props={props} on={{ changeSlug: vi.fn(), submit: vi.fn() }} />)).toContain("Create")
        expect(renderToStaticMarkup(<TemplateAppProvisioningBase state="submitting" props={props} on={{ submit: vi.fn() }} />)).toContain("Create")
    })

    it("shows action recovery only for unsupported or failed states", () => {
        const failed = renderToStaticMarkup(<TemplateAppProvisioningBase state="failed" props={props} on={{ act: vi.fn() }} />)
        const ready = renderToStaticMarkup(<TemplateAppProvisioningBase state="ready" props={{ ...props, actionLabel: undefined }} />)
        expect(failed).toContain("Retry")
        expect(ready).not.toContain("Retry")
    })
})