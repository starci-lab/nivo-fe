import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { HelmStackSnapshot } from "./index"
import type { AgentWorkspaceRuntime } from "@/modules/api/console"

const labels = { section: "Stack", unavailable: "Unavailable", release: "Release", chart: "Chart", storage: "Storage" }
const runtime = { instanceId: "instance-1", appKey: "agentos", status: "active", releaseName: "release-1", chartName: "agentos", chartVersion: "1.0", components: [{ key: "api", kind: "Deployment", status: "ready", desiredReplicas: 1, readyReplicas: 1, image: "image:1", pvcSize: null, storagePolicy: null, cpuUsageMillicores: null, cpuRequestMillicores: null, cpuLimitMillicores: null, memoryUsageBytes: null, memoryRequestBytes: null, memoryLimitBytes: null, restartCount: 0, lastTerminationReason: null, oomKilled: false, throttled: null }], storage: [{ key: "data", kind: "PVC", size: "10Gi", policy: "retain", status: "bound" }], totals: { cpuUsageMillicores: null, cpuRequestMillicores: 0, cpuLimitMillicores: 0, memoryUsageBytes: null, memoryRequestBytes: 0, memoryLimitBytes: 0, restartCount: 0, oomKilled: false, throttled: null }, probeStatus: "available" as const, fingerprint: "fp", lastError: null, observedAt: "2026-01-01", stale: false } as AgentWorkspaceRuntime

describe("Helm stack snapshot", () => {
    it("renders an unavailable notice without runtime", () => {
        expect(renderToStaticMarkup(<HelmStackSnapshot runtime={null} labels={labels} />)).toContain("Unavailable")
    })
    it("renders release, chart and storage details", () => {
        const html = renderToStaticMarkup(<HelmStackSnapshot runtime={runtime} labels={labels} />)
        expect(html).toContain("release-1")
        expect(html).toContain("agentos@1.0")
        expect(html).toContain("data: 10Gi")
    })
})