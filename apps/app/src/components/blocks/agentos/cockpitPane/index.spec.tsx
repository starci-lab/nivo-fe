import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { cockpitPane } from "."

type ContentProps = { readonly label: string }
const Content = (props: ContentProps) => <span>{props.label}</span>

describe("cockpitPane", () => {
    it("renders the supplied region content", async () => {
        expect(cockpitPane(false, Content, { label: "Scenario rail" })).toBeTruthy()
        const subject = cockpitPane(false, Content, { label: "Scenario rail" })
        expect(renderToStaticMarkup(subject)).toContain("Scenario rail")
        const { container } = render(subject)
        await expectNoA11yViolations(container)
    })
})
