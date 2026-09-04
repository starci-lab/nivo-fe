import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AgentOSWorkspaceAiKnowledgeBase } from "./component";
const labels = { sectionHeading: "AI operations", title: "AI & Knowledge", description: "Workspace readiness", ready: "AI ready", testing: "Testing", refused: "Needs attention", provider: "Provider", model: "Model", embedding: "Embedding", qdrant: "Qdrant", credential: "Credential", testedAt: "Tested", runTest: "Run test", recover: "Recover", origins: "Origins", components: "Components", evidence: "Verdict", documents: (count: number) => `${count} documents`, current: "Current", unknownVersion: "Pending", readinessStages: ["Credential", "Model", "Knowledge", "Qdrant", "Readiness test"], complete: "Verified", upcoming: "Upcoming", failureTitle: "Needs attention", formatTestedAt: (value: string) => value };
const readiness = { provider: "OpenRouter", chatModel: "deepseek/deepseek-chat", embeddingProfile: "nivo-embedding-v1", embeddingDimension: 1024, credentialStatus: "configured", credentialMaskedHint: "or-…7a", qdrantHealth: "healthy", readinessStatus: "ready", aiReady: true, readinessOperationId: null, knowledgeRecoveryOperationId: null, components: [{ component: "provider", verdict: "ready" }], origins: [{ origin: "Nivo module", version: "v1", digest: "abc123abc123abc123", documentCount: 3, lastUpdatedAt: null }], failureCode: null, testedAt: "2026-08-23T00:00:00.000Z" };
describe("AgentOSWorkspaceAiKnowledgeBase", () => {
    it("renders the ready verdict, provenance, evidence and both bounded actions", () => {
        const html = renderToStaticMarkup(<AgentOSWorkspaceAiKnowledgeBase state="ready" readiness={readiness} labels={labels} onTest={vi.fn()} onRecover={vi.fn()}/>);
        expect(html).toContain("OpenRouter");
        expect(html).toContain("deepseek/deepseek-chat");
        expect(html).toContain("Nivo module");
        expect(html).toContain("Run test");
        expect(html).toContain("Recover");
        expect(html).toContain("Readiness test");
    });
    it("preserves evidence and exposes a local recovery when readiness is refused", () => {
        const html = renderToStaticMarkup(<AgentOSWorkspaceAiKnowledgeBase state="refused" readiness={{ ...readiness, aiReady: false, readinessStatus: "refused", failureCode: "OPENCLAW_RUNTIME_UNAVAILABLE" }} labels={labels} onTest={vi.fn()} onRecover={vi.fn()}/>);
        expect(html).toContain("OPENCLAW_RUNTIME_UNAVAILABLE");
        expect(html).toContain("Recover");
        expect(html).toContain("Nivo module");
    });
});
it("keeps recovery focus and refuses duplicate and competing actions until settlement", () => {
    const onTest = vi.fn();
    const onRecover = vi.fn();
    const { rerender } = render(<AgentOSWorkspaceAiKnowledgeBase state="refused" readiness={readiness} labels={labels} onTest={onTest} onRecover={onRecover}/>);
    const recovery = screen.getByRole("button", { name: "Recover" });
    recovery.focus();
    rerender(<AgentOSWorkspaceAiKnowledgeBase state="recovering" pendingAction="recovering" recoveryFromRefused readiness={readiness} labels={labels} onTest={onTest} onRecover={onRecover}/>);
    expect(screen.getByRole("button", { name: "Recover" })).toBe(recovery);
    expect(recovery).toHaveFocus();
    fireEvent.click(recovery);
    fireEvent.click(screen.getByRole("button", { name: "Run test" }));
    expect(onRecover).not.toHaveBeenCalled();
    expect(onTest).not.toHaveBeenCalled();
    rerender(<AgentOSWorkspaceAiKnowledgeBase state="success" readiness={readiness} labels={labels} onTest={onTest} onRecover={onRecover}/>);
    expect(screen.getByRole("button", { name: "Recover" })).toBe(recovery);
    expect(recovery).toHaveFocus();
});
it("does not mark a remote readiness test as a locally pending action", () => {
    render(<AgentOSWorkspaceAiKnowledgeBase state="testing" readiness={readiness} labels={labels} onTest={vi.fn()} onRecover={vi.fn()}/>);
    const action = screen.getByRole("button", { name: "Run test" });
    expect(action).toBeDisabled();
    expect(action).not.toHaveAttribute("aria-busy", "true");
});
