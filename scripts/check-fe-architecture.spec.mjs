import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { analyzeSource } from "./check-fe-architecture.mjs"

const codes = (source, filePath = "/apps/app/src/components/blocks/Example/index.tsx") =>
    analyzeSource(source, filePath).map((finding) => finding.code)

describe("FE architecture boundary", () => {
    it("allows fetch only in the API transport boundary", () => {
        assert.deepEqual(codes(
            "export const request = () => fetch('/graphql')",
            "/apps/app/src/modules/api/graphql.ts",
        ), [])
        assert.deepEqual(codes("export const request = () => fetch('/graphql')"), [
            "fetch-outside-api-transport",
        ])
        assert.deepEqual(codes("export const request = () => globalThis.fetch('/graphql')"), [
            "fetch-outside-api-transport",
        ])
    })

    it("keeps runtime transport imports out of components but permits type-only contracts", () => {
        assert.deepEqual(codes(`
            import { queryWorkspace, type Workspace } from "@/modules/api/console"
            export const Example = () => queryWorkspace()
        `), ["component-runtime-transport-import"])
        assert.deepEqual(codes(`
            import type { Workspace } from "@/modules/api/console"
            export type ExampleProps = { readonly workspace: Workspace }
        `), [])
        assert.deepEqual(codes(`
            import { queryWorkspace } from "@/modules/api/console"
            export const useWorkspace = () => queryWorkspace()
        `, "/apps/app/src/hooks/swr/useWorkspace.ts"), [])
    })

    it("rejects direct and delegated network requests inside component effects", () => {
        assert.deepEqual(codes(`
            import { useEffect } from "react"
            import { queryWorkspace } from "@/modules/api/console"
            export const Example = () => {
                useEffect(() => { void queryWorkspace() }, [])
                return null
            }
        `), ["component-runtime-transport-import", "network-request-in-component-effect"])
        assert.deepEqual(codes(`
            import { useEffect as synchronize } from "react"
            import { queryWorkspace } from "@/modules/api/console"
            const load = async () => queryWorkspace()
            export const Example = () => {
                synchronize(() => { void load() }, [])
                return null
            }
        `), ["component-runtime-transport-import", "network-request-in-component-effect"])
        assert.deepEqual(codes(`
            import * as React from "react"
            import * as api from "@/modules/api/console"
            export const Example = () => {
                React.useEffect(() => { void api.queryWorkspace() }, [])
                return null
            }
        `), ["component-runtime-transport-import", "network-request-in-component-effect"])
    })

    it("allows lifecycle effects and hook-owned refreshes", () => {
        assert.deepEqual(codes(`
            import { useEffect } from "react"
            import { useWorkspace } from "@/hooks"
            export const Example = () => {
                const { refresh } = useWorkspace()
                useEffect(() => {
                    const timer = window.setInterval(() => void refresh(), 2000)
                    return () => window.clearInterval(timer)
                }, [refresh])
                return null
            }
        `), [])
        assert.deepEqual(codes(`
            import { useEffect } from "react"
            export const Example = () => {
                useEffect(() => {
                    const observer = new ResizeObserver(() => undefined)
                    observer.observe(document.body)
                    return () => observer.disconnect()
                }, [])
                return null
            }
        `), [])
    })

    it("does not govern test fixtures", () => {
        assert.deepEqual(codes(
            "export const request = () => fetch('/fixture')",
            "/apps/app/src/components/Example/index.spec.tsx",
        ), [])
    })

    it("keeps pure component twins free of client ownership and world hooks", () => {
        const purePath = "/apps/app/src/components/blocks/Example/component.tsx"
        assert.deepEqual(codes(`
            "use client"
            import { useState } from "react"
            export const ExampleBase = () => { const [value] = useState(0); return value }
        `, purePath), ["pure-component-client-directive", "pure-component-world-hook"])
        assert.deepEqual(codes(`
            import { useRef } from "react"
            export const ExampleBase = (props) => { const ref = useRef(null); return <div ref={ref}>{props.value}</div> }
        `, purePath), [])
    })

    it("enforces the hook barrel and downward component dependencies", () => {
        assert.deepEqual(codes(`
            import { useWorkspace } from "@/hooks/swr/useWorkspace"
            import { ExamplePageBase } from "@/components/pages/ExamplePage/component"
            export const Example = () => <ExamplePageBase value={useWorkspace()} />
        `), ["component-deep-hook-import", "block-imports-page"])
        assert.deepEqual(codes(`
            import { useWorkspace } from "@/hooks"
            import { workspaceProjection } from "@/modules/workspace/projection"
            export const Example = () => workspaceProjection(useWorkspace())
        `), [])
    })
})
