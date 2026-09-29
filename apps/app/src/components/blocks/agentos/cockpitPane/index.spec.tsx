import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { cockpitPane } from "@/components/blocks/agentos/cockpitPane"

type ContentProps = { readonly label: string }
const Content = (props: ContentProps) => <span>{props.label}</span>

describe("cockpitPane", () => {
    it("renders the supplied region content", () => {
        expect(cockpitPane(false, Content, { label: "Scenario rail" })).toBeTruthy()
        expect(renderToStaticMarkup(cockpitPane(false, Content, { label: "Scenario rail" }))).toContain("Scenario rail")
    })
})
