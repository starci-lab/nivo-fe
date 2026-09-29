import { Composer } from "./index"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { labels, baseView, actions } from "@/modules/collab/group-chat/test-fixtures.fixture"

describe("Composer", () => {
    it("keeps a drafted message in the composer and submits it once through the form", () => {
        const on = actions()
        render(
            <Composer
                view={baseView({ composer: { value: "Xin chào", pending: false, failure: null, answering: null } })}
                labels={labels}
                on={on}
                decision={false}
            />,
        )
        const draft = screen.getByRole("textbox", { name: labels.composer.label })
        const form = draft.closest("form")
        expect(form).not.toBeNull()
        if (form === null) throw new Error("Composer form is missing")
        expect(draft).toHaveValue("Xin chào")
        expect(screen.getByRole("button", { name: labels.composer.send })).toBeEnabled()
        fireEvent.submit(form)
        expect(on.sendMessage).toHaveBeenCalledTimes(1)
    })
    it("keeps a failed send's draft and offers the reconcile-and-retry path", () => {
        const on = actions()
        render(
            <Composer
                view={baseView({
                    composer: { value: "@Sales báo cáo", pending: false, failure: "retry", answering: null },
                })}
                labels={labels}
                on={on}
                decision={false}
            />,
        )
        expect(screen.getByText("Tin nhắn chưa chắc đã được ghi. Kiểm tra rồi gửi lại.")).toBeInTheDocument()
        expect(screen.getByRole("textbox", { name: "Tin nhắn" })).toHaveValue("@Sales báo cáo")
        fireEvent.click(screen.getByRole("button", { name: "Kiểm tra và gửi lại" }))
        expect(on.retrySend).toHaveBeenCalled()
    })
})
