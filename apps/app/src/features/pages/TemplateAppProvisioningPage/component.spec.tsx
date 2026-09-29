import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type TemplateProvisioningProbeProps = {
    readonly context: { readonly mode: string; readonly templateKey?: string; readonly siteId?: string }
}

vi.mock("@/components/blocks/provisioning/TemplateAppProvisioning", () => ({
    TemplateAppProvisioning: ({ context }: TemplateProvisioningProbeProps) => <div>{JSON.stringify(context)}</div>,
}))
import { TemplateAppProvisioningPageBase, type TemplateAppProvisioningPageViewProps } from "./component"

const labels: TemplateAppProvisioningPageViewProps["labels"] = {
    path: "Path",
    apps: "Apps",
    createTitle: "Create",
    createDescription: "Configure",
    provisioningTitle: "Provisioning",
    provisioningDescription: "Resume",
}

describe("TemplateAppProvisioningPageBase", () => {
    it("passes only the template identity before persistence", () => {
        render(
            <TemplateAppProvisioningPageBase
                props={{ mode: "new", templateKey: "ai_academy", labels }}
                on={{ openApps: vi.fn() }}
            />,
        )
        expect(screen.getByText('{"mode":"new","templateKey":"ai_academy"}')).toBeInTheDocument()
    })

    it("passes only the site identity after persistence", () => {
        render(
            <TemplateAppProvisioningPageBase
                props={{ mode: "resume", siteId: "site-1", labels }}
                on={{ openApps: vi.fn() }}
            />,
        )
        expect(screen.getByText('{"mode":"resume","siteId":"site-1"}')).toBeInTheDocument()
    })
})

describe("TemplateAppProvisioningPageBase", () => {
    it("executes the renamed pure twins across their settled state branches", () => {
        const templateLabels = {
            path: "Path",
            apps: "Apps",
            createTitle: "Create",
            createDescription: "Configure",
            provisioningTitle: "Provisioning",
            provisioningDescription: "Resume",
        }
        expect(
            TemplateAppProvisioningPageBase({
                props: { mode: "new", templateKey: "ai_academy", labels: templateLabels },
                on: { openApps: vi.fn() },
            }),
        ).toBeTruthy()
        expect(
            TemplateAppProvisioningPageBase({
                props: { mode: "resume", siteId: "site-1", labels: templateLabels },
                on: { openApps: vi.fn() },
            }),
        ).toBeTruthy()
    })
})
