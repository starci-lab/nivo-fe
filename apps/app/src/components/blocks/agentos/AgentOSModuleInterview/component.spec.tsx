import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSModuleInterviewBase } from "./component"

describe("AgentOSModuleInterviewBase", () => {
    it("draws interview, profile, and specification states", () => {
        const interview = renderToStaticMarkup(
            <AgentOSModuleInterviewBase
                state="loading"
                props={{
                    answer: "",
                    pending: false,
                    labels: {
                        title: "Interview",
                        saved: "Answers are saved",
                        refused: "Unavailable",
                        field: "Answer",
                        placeholder: "Type an answer",
                        send: "Send",
                        complete: "Complete",
                        agent: "Agent",
                        you: "You",
                    },
                }}
                on={{ onAnswer: vi.fn(), onSend: vi.fn() }}
            />,
        )
        expect(interview).toContain("Interview")
    })
})
