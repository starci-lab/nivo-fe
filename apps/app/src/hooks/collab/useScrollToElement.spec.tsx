import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useScrollToElement, type CollabScrollRequest } from "./useScrollToElement"

type ScrollProps = { readonly request: CollabScrollRequest | null }

const propsFor = (request: CollabScrollRequest | null): ScrollProps => ({ request })

const renderScroll = (initial: CollabScrollRequest | null = null) =>
    renderHook((props: ScrollProps) => useScrollToElement(props.request), { initialProps: propsFor(initial) })

const mountedNode = (elementId: string) => {
    const node = document.createElement("div")
    node.id = elementId
    node.scrollIntoView = vi.fn()
    document.body.appendChild(node)
    return node
}

describe("useScrollToElement", () => {
    afterEach(() => {
        vi.useRealTimers()
        document.body.innerHTML = ""
    })

    it("scrolls the requested element into view after the commit that named it", () => {
        vi.useFakeTimers()
        const node = mountedNode("collab-task-t-1")
        const { rerender } = renderScroll()
        act(() => {
            vi.advanceTimersByTime(60)
        })
        expect(node.scrollIntoView).not.toHaveBeenCalled()

        rerender(propsFor({ elementId: "collab-task-t-1" }))
        act(() => {
            vi.advanceTimersByTime(60)
        })
        expect(node.scrollIntoView).toHaveBeenCalledWith({ block: "center" })
    })

    it("re-runs for a fresh request naming the same element", () => {
        vi.useFakeTimers()
        const node = mountedNode("collab-approval-ap-1")
        const { rerender } = renderScroll({ elementId: "collab-approval-ap-1" })
        act(() => {
            vi.advanceTimersByTime(60)
        })
        rerender(propsFor({ elementId: "collab-approval-ap-1" }))
        act(() => {
            vi.advanceTimersByTime(60)
        })
        expect(node.scrollIntoView).toHaveBeenCalledTimes(2)
    })

    it("clears a pending scroll when the request leaves and on unmount", () => {
        vi.useFakeTimers()
        const node = mountedNode("collab-msg-m-1")
        const { rerender, unmount } = renderScroll()
        rerender(propsFor({ elementId: "collab-msg-m-1" }))
        rerender(propsFor(null))
        act(() => {
            vi.advanceTimersByTime(60)
        })
        expect(node.scrollIntoView).not.toHaveBeenCalled()

        rerender(propsFor({ elementId: "collab-msg-m-1" }))
        unmount()
        act(() => {
            vi.advanceTimersByTime(60)
        })
        expect(node.scrollIntoView).not.toHaveBeenCalled()
    })
})
