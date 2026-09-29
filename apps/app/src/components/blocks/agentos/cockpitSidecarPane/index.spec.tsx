import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { cockpitSidecarPane } from "@/components/blocks/agentos/cockpitSidecarPane"

type ContentProps = { readonly label: string }
const Content = (props: ContentProps) => <span>{props.label}</span>

describe("cockpitSidecarPane", () => {
    it("renders the supplied evidence content", () => {
        const html = renderToStaticMarkup(cockpitSidecarPane(false, Content, { label: "Evidence" }))

        expect(html).toContain("Evidence")
    })
})
