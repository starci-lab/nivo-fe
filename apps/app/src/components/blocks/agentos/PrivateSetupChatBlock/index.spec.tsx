/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { PrivateSetupChatBlock, type SetupRevision } from "./index"

const revisions: ReadonlyArray<SetupRevision> = [{ id: "setup-1", revision: 1, status: "open" }]

describe("PrivateSetupChatBlock", () => {
    beforeAll(() => {
        window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia
    })
    it("retains a controlled draft when the append is refused", () => {
        const onSend = vi.fn()
        const { rerender } = render(<PrivateSetupChatBlock messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="Keep this policy" onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        fireEvent.submit(screen.getByRole("button", { name: "Send" }).closest("form")!)
        expect(onSend).toHaveBeenCalledWith("Keep this policy")
        rerender(<PrivateSetupChatBlock messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="Keep this policy" refused onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        expect(screen.getByDisplayValue("Keep this policy")).toBeInTheDocument()
        expect(screen.getByText(/was refused/iu)).toBeInTheDocument()
    })

    it("keeps the editable composer visible but disabled during peer work", () => {
        const onSend = vi.fn()
        render(<PrivateSetupChatBlock messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="A policy" ownPending={false} peerDisabled onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        expect(screen.getByRole("textbox", { name: "Message to Nivo" })).toBeDisabled()
        expect(screen.queryByText(/revision is complete/)).toBeNull()
        fireEvent.submit(screen.getByRole("button", { name: "Send" }).closest("form")!)
        expect(onSend).not.toHaveBeenCalled()
    })
    it("prevents duplicate submit while its own append is pending", () => {
        const onSend = vi.fn()
        render(<PrivateSetupChatBlock messages={[]} revisions={revisions} selectedRevisionId="setup-1" canSend canStartRevision={false} draft="A policy" ownPending onDraft={vi.fn()} onSend={onSend} onSelectRevision={vi.fn()} onStartRevision={vi.fn()} />)
        fireEvent.submit(screen.getByRole("button", { name: "Send" }).closest("form")!)
        expect(onSend).not.toHaveBeenCalled()
        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
    })
})
