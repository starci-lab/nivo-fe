import type { AgentWorkspaceControlCenter } from "@/modules/api/console";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentOSWorkspaceRuntime } from "./index";
const labels = { section: "Runtime", cpu: "CPU", memory: "Memory", requests: "Requests", limits: "Limits", restarts: "Restarts", health: "Health", fresh: "Fresh", stale: "Stale", unavailable: "Unavailable" };
const base = { workspace: { id: "workspace-1", name: "Support", status: "active", externalWorkspaceRef: null }, instance: { id: "instance-1", name: "Support", hostname: "support.test", status: "active", chartVersion: "1", ramMb: 512, vcpu: 1, planCode: null, planRamGb: null, planVcpu: null }, apps: [] };
describe("AgentOS workspace runtime metrics", () => {
    it("renders measured CPU, memory and stale freshness", () => {
        const data = { ...base, runtime: { instanceId: "instance-1", appKey: "agentos", status: "active", releaseName: null, chartName: null, chartVersion: null, components: [], storage: [], totals: { cpuUsageMillicores: 250, cpuRequestMillicores: 100, cpuLimitMillicores: 500, memoryUsageBytes: 4 * 1024 * 1024, memoryRequestBytes: 2 * 1024 * 1024, memoryLimitBytes: 8 * 1024 * 1024, restartCount: 2, oomKilled: false, throttled: false }, probeStatus: "available" as const, fingerprint: "fp", lastError: null, observedAt: "2026-01-01T00:00:00Z", stale: true } } as AgentWorkspaceControlCenter;
        const html = renderToStaticMarkup(<AgentOSWorkspaceRuntime data={data} labels={labels} formatDate={(value) => `date:${value}`}/>);
        expect(html).toContain("250m / 500m");
        expect(html).toContain("4 MiB / 8 MiB");
        expect(html).toContain("100m · 2 MiB");
        expect(html).toContain("500m · 8 MiB");
        expect(html).toContain("available");
        expect(html).toContain("Stale · date:2026-01-01T00:00:00Z");
    });
    it("shows unavailable metrics when no runtime snapshot exists", () => {
        const data = { ...base, runtime: null } as AgentWorkspaceControlCenter;
        expect(renderToStaticMarkup(<AgentOSWorkspaceRuntime data={data} labels={labels} formatDate={() => "never"}/>)).toContain("Unavailable");
    });
});
it("does not report zero utilization when a present snapshot has unknown usage", () => {
    const data = { ...base, runtime: { instanceId: "instance-1", appKey: "agentos", status: "active", releaseName: null, chartName: null, chartVersion: null, components: [], storage: [], totals: { cpuUsageMillicores: null, cpuRequestMillicores: 100, cpuLimitMillicores: 500, memoryUsageBytes: null, memoryRequestBytes: 1024, memoryLimitBytes: 2048, restartCount: 0, oomKilled: false, throttled: false }, probeStatus: "available", fingerprint: "unknown", lastError: null, observedAt: "2026-01-01T00:00:00Z", stale: false } } as AgentWorkspaceControlCenter;
    const html = renderToStaticMarkup(<AgentOSWorkspaceRuntime data={data} labels={labels} formatDate={value => value}/>);
    expect(html).toContain("Unavailable");
    expect(html).not.toContain('role="progressbar"');
    expect(html).not.toContain("0m / 500m");
});
