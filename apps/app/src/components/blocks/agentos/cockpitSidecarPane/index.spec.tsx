import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { cockpitSidecarPane } from "."

type ContentProps = { readonly label: string }
const Content = (props: ContentProps) => <span>{props.label}</span>

describe("cockpitSidecarPane", () => {
    it("renders the supplied evidence content", async () => {
        const subject = cockpitSidecarPane(false, Content, { label: "Evidence" })
        const html = renderToStaticMarkup(subject)

        expect(html).toContain("Evidence")
        const { container } = render(subject)
        await expectNoA11yViolations(container)
    })
})
