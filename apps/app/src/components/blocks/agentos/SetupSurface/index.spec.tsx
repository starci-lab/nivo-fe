import { fireEvent, render, screen } from "@testing-library/react"
import { createTranslator } from "next-intl"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"
import { SetupSurface } from "."
import { buildModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import type { SetupSurfaceProps } from "../../../../modules/agentos/module-page/surface-types"
import { TIME_ZONE } from "@/modules/i18n"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
        onError: (error) => {
            throw error
        },
    }),
)
const setup: SetupSurfaceProps = {
    messages: [],
    revisions: [{ id: "setup-1", revision: 1, status: "completed" }],
    selectedRevisionId: "setup-1",
    canSend: false,
    canStartRevision: true,
    activeVersion: 1,
    draft: null,
    pending: false,
    draftText: "",
    refused: false,
    compactPane: "conversation",
    onSelectRevision: vi.fn(),
    onStartRevision: vi.fn(),
    onSend: vi.fn(),
    onDraft: vi.fn(),
    onApply: vi.fn(),
    onCreateVersion: vi.fn(),
    onConfirmRequirement: vi.fn(),
    onSelectPane: vi.fn(),
}

describe("SetupSurface", () => {
    it("mounts one controlled pane at a time", () => {
        const html = renderToStaticMarkup(<SetupSurface copy={copy} {...setup} />)

        expect((html.match(/role="tabpanel"/g) ?? []).length).toBe(1)
        expect(html).toContain('id="setup-panel-conversation"')
        expect(html).not.toContain('id="setup-panel-context"')
        expect(html).not.toContain('id="setup-panel-versions"')
    })

    it("forwards the selected setup pane", () => {
        const onSelectPane = vi.fn()
        render(<SetupSurface copy={copy} {...setup} onSelectPane={onSelectPane} />)

        fireEvent.click(screen.getByRole("button", { name: copy.setup.openVersions }))
        fireEvent.click(screen.getByRole("button", { name: copy.setup.reviewGates }))

        expect(onSelectPane.mock.calls).toEqual([["versions"], ["context"]])
    })

    it("forwards revision and setup actions while retaining one mounted panel", () => {
        window.matchMedia = vi.fn().mockReturnValue({
            matches: false,
            media: "",
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })
        const onSelectPane = vi.fn()
        const onStartRevision = vi.fn()
        const onSelectRevision = vi.fn()
        const contentProps = {
            ...setup,
            canStartRevision: false,
            onSelectPane,
            onStartRevision,
            onSelectRevision,
            revisions: [...setup.revisions, { id: "setup-raw-2", revision: 2, status: "open" as const }],
        }
        const view = render(<SetupSurface copy={copy} {...contentProps} />)

        fireEvent.click(screen.getByRole("button", { name: copy.setup.openVersions }))
        fireEvent.click(screen.getByRole("button", { name: copy.setup.reviewGates }))
        expect(onSelectPane.mock.calls).toEqual([["versions"], ["context"]])
        fireEvent.click(screen.getByRole("tab", { name: copy.setup.versions }))
        expect(onSelectPane).toHaveBeenLastCalledWith("versions")
        view.rerender(<SetupSurface copy={copy} {...contentProps} compactPane="versions" setupStartRefused />)
        expect(screen.getAllByRole("tabpanel")).toHaveLength(1)
        expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "setup-panel-versions")
        expect(screen.getByText(copy.setup.startRefused)).toBeInTheDocument()
        fireEvent.click(
            screen.getByRole("tab", {
                name: copy.setup.revision({ revision: 2, status: copy.setup.revisionStatus.open }),
            }),
        )
        expect(onSelectRevision).toHaveBeenCalledExactlyOnceWith("setup-raw-2")
        view.rerender(
            <SetupSurface
                copy={copy}
                {...contentProps}
                compactPane="versions"
                canStartRevision
                revisions={contentProps.revisions.map((revision) => ({ ...revision, status: "completed" as const }))}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: copy.setup.newChat }))
        expect(onStartRevision).toHaveBeenCalledTimes(1)
        fireEvent.click(screen.getByRole("button", { name: copy.setup.openChat }))
        expect(onSelectPane).toHaveBeenLastCalledWith("conversation")
        view.unmount()
    })
})
