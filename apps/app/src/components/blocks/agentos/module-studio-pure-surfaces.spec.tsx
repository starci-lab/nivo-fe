import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AgentosModuleStudio } from "@/modules/api/console"
import { AgentOSCustomModuleCollectionBase } from "./AgentOSCustomModuleCollection/component"
import { AgentOSModuleAttachmentsBase } from "./AgentOSModuleAttachments/component"
import { AgentOSModuleIntakeBase } from "./AgentOSModuleIntake/component"
import { AgentOSModuleIntegrationsBase } from "./AgentOSModuleIntegrations/component"
import { AgentOSModuleInterviewBase } from "./AgentOSModuleInterview/component"
import { AgentOSModuleProfileBase } from "./AgentOSModuleProfile/component"
import { AgentOSModuleSpecificationBase } from "./AgentOSModuleSpecification/component"

describe("module studio pure surfaces", () => {
    it("draws the custom-module collection rows and their owned actions", () => {
        const html = renderToStaticMarkup(<AgentOSCustomModuleCollectionBase
            state="ready"
            title="Custom modules"
            refused="Unavailable"
            empty="No modules"
            createLabel="Create module"
            rows={[{ id: "module-1", name: "Lead intake", detail: "80% complete", kind: "Custom", status: "Active", action: "Inspect" }]}
            onOpen={vi.fn()}
            onCreate={vi.fn()}
        />)
        expect(html).toContain("Lead intake")
        expect(html).toContain("80% complete")
        expect(html).toContain("Inspect")
    })

    it("draws upload lifecycle and adaptive intake without source requests", () => {
        const attachments = renderToStaticMarkup(<AgentOSModuleAttachmentsBase
            state="loading"
            pending={false}
            labels={{ title: "Documents", upload: "Upload", remove: "Remove", refused: "Unavailable", empty: "No documents", uploaded: "Uploaded", scanning: "Scanning", extracting: "Extracting", embedding: "Embedding", indexing: "Indexing", indexed: "Indexed", complete: "Complete", current: "Current", upcoming: "Upcoming", chunks: (count) => `${count} chunks`, refusedStatus: "Refused", removed: "Removed" }}
            onChoose={vi.fn()}
            onRemove={vi.fn()}
        />)
        expect(attachments).toContain("Documents")

        const intake = renderToStaticMarkup(<AgentOSModuleIntakeBase
            goal="Collect customer requirements"
            pending={false}
            title="Start a module"
            description="Describe the outcome"
            fieldLabel="Goal"
            placeholder="What should this module learn?"
            note="Saved to this workspace"
            action="Start interview"
            guideTitle="How it works"
            guideSteps={["Set the goal", "Answer follow-ups", "Review the result"]}
            guideNote="The agent asks only for missing facts."
            onGoal={vi.fn()}
            onSubmit={vi.fn()}
        />)
        expect(intake).toContain("Start interview")
        expect(intake).toContain("Answer follow-ups")
    })

    it("draws write-only integration, interview, profile, and specification states", () => {
        const integrations = renderToStaticMarkup(<AgentOSModuleIntegrationsBase
            state="loading"
            secret=""
            pending={false}
            labels={{ title: "Integrations", provider: "Helpdesk", field: "API key", placeholder: "Paste key", save: "Save", remove: "Remove", refused: "Unavailable", writeOnly: "The key cannot be read back.", reveal: "Reveal", hide: "Hide" }}
            onSecret={vi.fn()}
            onSave={vi.fn()}
            onRemove={vi.fn()}
        />)
        expect(integrations).toContain("Integrations")
        expect(integrations).toContain("The key cannot be read back.")

        const interview = renderToStaticMarkup(<AgentOSModuleInterviewBase
            state="loading"
            answer=""
            pending={false}
            labels={{ title: "Interview", saved: "Answers are saved", refused: "Unavailable", field: "Answer", placeholder: "Type an answer", send: "Send", complete: "Complete", agent: "Agent", you: "You" }}
            onAnswer={vi.fn()}
            onSend={vi.fn()}
        />)
        expect(interview).toContain("Interview")

        renderToStaticMarkup(<AgentOSModuleProfileBase
            loading
            refused={false}
            labels={{ title: "Profile", progress: "Completeness", missing: "Missing: {fields}", refused: "Unavailable" }}
        />)

        renderToStaticMarkup(<AgentOSModuleSpecificationBase
            state="loading"
            acknowledged={false}
            pending={false}
            labels={{ title: "Specification", refused: "Unavailable", incomplete: "Finish the interview", version: "Version {version}", acknowledge: "I approve version {version}", publish: "Publish", publishing: "Publishing", published: "Published" }}
            onAcknowledge={vi.fn()}
            onPublish={vi.fn()}
        />)
    })

    it("reports collection, upload, and write-only integration actions", () => {
        const open = vi.fn()
        const create = vi.fn()
        const collection = render(<AgentOSCustomModuleCollectionBase
            state="ready"
            title="Custom modules"
            refused="Unavailable"
            empty="No modules"
            createLabel="Create module"
            rows={[{ id: "module-1", name: "Lead intake", detail: "Ready", kind: "Custom", status: "Active", action: "Inspect" }]}
            onOpen={open}
            onCreate={create}
        />)
        fireEvent.click(screen.getByRole("button", { name: "Lead intake" }))
        fireEvent.click(screen.getByRole("button", { name: "Inspect" }))
        expect(open).toHaveBeenNthCalledWith(1, "module-1")
        expect(open).toHaveBeenNthCalledWith(2, "module-1")
        collection.unmount()

        const choose = vi.fn()
        const remove = vi.fn()
        const studio = { attachments: [{ id: "attachment-1", fileName: "brief.pdf", mediaType: "application/pdf", sizeBytes: 128, status: "refused", ingestionStatus: "refused", chunkCount: 0 }] } as unknown as AgentosModuleStudio
        const attachments = render(<AgentOSModuleAttachmentsBase
            studio={studio}
            state="ready"
            pending={false}
            labels={{ title: "Documents", upload: "Upload", remove: "Remove", refused: "Unavailable", empty: "No documents", uploaded: "Uploaded", scanning: "Scanning", extracting: "Extracting", embedding: "Embedding", indexing: "Indexing", indexed: "Indexed", complete: "Complete", current: "Current", upcoming: "Upcoming", chunks: (count) => `${count} chunks`, refusedStatus: "Refused document", removed: "Removed" }}
            onChoose={choose}
            onRemove={remove}
        />)
        fireEvent.click(screen.getByRole("button", { name: "Remove" }))
        const input = attachments.container.querySelector('input[type="file"]')
        expect(input).not.toBeNull()
        fireEvent.change(input!, { target: { files: [new File(["brief"], "brief.pdf", { type: "application/pdf" })] } })
        expect(remove).toHaveBeenCalledWith("attachment-1")
        expect(choose).toHaveBeenCalledTimes(1)
        attachments.unmount()

        const removeIntegration = vi.fn()
        render(<AgentOSModuleIntegrationsBase
            studio={{ integrations: [{ id: "integration-1", providerKey: "helpdesk-api", maskedHint: "...abcd", status: "configured" }] } as unknown as AgentosModuleStudio}
            state="ready"
            secret="replacement"
            pending={false}
            labels={{ title: "Integrations", provider: "Helpdesk", field: "API key", placeholder: "Paste key", save: "Save", remove: "Remove key", refused: "Unavailable", writeOnly: "Write only", reveal: "Reveal", hide: "Hide" }}
            onSecret={vi.fn()}
            onSave={vi.fn()}
            onRemove={removeIntegration}
        />)
        fireEvent.click(screen.getByRole("button", { name: "Remove key" }))
        expect(removeIntegration).toHaveBeenCalledWith("helpdesk-api")
    })
})
