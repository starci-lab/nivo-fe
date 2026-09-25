import { cleanup, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it } from "vitest"

import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { ReturnNoticeBase } from "./component"

/** The one reasonless sentence, in both product locales. */
const NOTICE: ReadonlyArray<string> = [
    viMessages.authentication.unavailableReturnNotice,
    enMessages.authentication.unavailableReturnNotice
]

/** A route, a link or a cause behind the refusal, in either product locale. */
const ROUTE_OR_CAUSE = /\/|https?:|because|\breason\b|\bfailed\b|quyền/i

describe("ReturnNoticeBase", () => {
    afterEach(cleanup)

    it("says the place could not be opened, and names no route and no cause", () => {
        render(<ReturnNoticeBase props={{ message: NOTICE[0] }} />)

        expect(screen.getByText(NOTICE[0])).toBeInTheDocument()
        expect(NOTICE[0]).toContain("trang mặc định")
        expect(NOTICE[1]).toContain("default page")
        for (const line of NOTICE) expect(line).not.toMatch(ROUTE_OR_CAUSE)
    })

    it("announces the notice politely rather than interrupting", () => {
        render(<ReturnNoticeBase props={{ message: NOTICE[0] }} />)

        expect(screen.getByRole("status")).toHaveTextContent(NOTICE[0])
    })

    it("draws nothing on a landing that has nothing to report", () => {
        const markup = renderToStaticMarkup(<ReturnNoticeBase props={{ message: null }} />)

        expect(markup).toBe("")
    })
})