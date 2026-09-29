import { beforeEach, describe, expect, it, vi } from "vitest";

const { useNivoQuery, myAgentosAiKnowledgeReadiness } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
    myAgentosAiKnowledgeReadiness: vi.fn(),
}));
vi.mock("../useNivoQuery", () => ({ useNivoQuery }));
vi.mock("@/modules/api/commerce", () => ({
    catalogItems: vi.fn(),
    myCatalogOrders: vi.fn(),
    myDomains: vi.fn(),
    myInvoices: vi.fn(),
    myWallet: vi.fn(),
    myWalletTransactions: vi.fn(),
}));
vi.mock("@/modules/api/academy", () => ({
    myAcademyGrowthSnapshot: vi.fn(),
    myAcademyIntegrations: vi.fn(),
    myAcademyStudentDetail: vi.fn(),
    myAcademyStudents: vi.fn(),
    myExpertSiteLeads: vi.fn(),
}));
vi.mock("@/modules/api/agentos-knowledge", () => ({ myAgentosAiKnowledgeReadiness }));
vi.mock("@/modules/api/agentos-module-studio", () => ({ myAgentosCustomModuleStudio: vi.fn() }));
vi.mock("@/modules/api/agentos-modules", () => ({
    myAgentosModuleInstallation: vi.fn(),
    myAgentosModuleInstallations: vi.fn(),
    myAgentosSolutionModules: vi.fn(),
}));
vi.mock("@/modules/api/agentos-module-runtime", () => ({ myAgentosModuleRuntime: vi.fn() }));
vi.mock("@/modules/api/agentos-module-tests", () => ({
    myAgentosModuleTestRun: vi.fn(),
    myAgentosModuleTestSurface: vi.fn(),
}));
vi.mock("@/modules/api/agentos-workspaces", () => ({
    myAgentWorkspace: vi.fn(),
    myAgentWorkspaceControlCenter: vi.fn(),
}));
vi.mock("@/modules/api/expert-sites", () => ({
    myExpertSiteDeployment: vi.fn(),
    myExpertSites: vi.fn(),
}));
vi.mock("@/modules/api/instances", () => ({
    myInstances: vi.fn(),
    myPodOpenclawStatus: vi.fn(),
}));

import { agentosAiKnowledgeQueryKey, useQueryMyAgentosAiKnowledgeReadinessSwr } from "./console";

type ReadinessAnswer = { readonly ok: boolean; readonly data?: { readonly readinessStatus: string } };
type ReadinessHook = {
    readonly key: unknown;
    readonly options: { readonly refreshInterval: (latest?: ReadinessAnswer) => number };
};

describe("useQueryMyAgentosAiKnowledgeReadinessSwr", () => {
    beforeEach(() => vi.clearAllMocks());

    it("mounts no read while the workspace identity is missing", () => {
        const hook = useQueryMyAgentosAiKnowledgeReadinessSwr(undefined) as unknown as ReadinessHook;
        expect(hook.key).toBeNull();
    });

    it("keeps the readiness read on the workspace-scoped cache key", () => {
        const hook = useQueryMyAgentosAiKnowledgeReadinessSwr("ws-1") as unknown as ReadinessHook;
        expect(hook.key).toEqual(agentosAiKnowledgeQueryKey("ws-1"));
    });

    it("polls at two seconds only while a browser operation is in flight or the backend still tests", () => {
        const idle = useQueryMyAgentosAiKnowledgeReadinessSwr("ws-1") as unknown as ReadinessHook;
        expect(idle.options.refreshInterval(undefined)).toBe(0);
        expect(idle.options.refreshInterval({ ok: true, data: { readinessStatus: "ready" } })).toBe(0);
        expect(idle.options.refreshInterval({ ok: false })).toBe(0);
        expect(idle.options.refreshInterval({ ok: true, data: { readinessStatus: "testing" } })).toBe(2_000);

        const inFlight = useQueryMyAgentosAiKnowledgeReadinessSwr("ws-1", true) as unknown as ReadinessHook;
        expect(inFlight.options.refreshInterval(undefined)).toBe(2_000);
        expect(inFlight.options.refreshInterval({ ok: true, data: { readinessStatus: "ready" } })).toBe(2_000);
    });
});
