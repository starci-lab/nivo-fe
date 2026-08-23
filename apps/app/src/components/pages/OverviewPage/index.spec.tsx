import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ push: vi.fn(), locale: "en" }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useLocale: () => mocks.locale, useTranslations: () => (key: string) => key }))
interface MockPageProps { readonly title: string, readonly pathLabel: string, readonly consoleLabel: string, readonly buildAppLabel: string, readonly onBuildApp: () => void }
vi.mock("@/modules/overview/context", () => ({ OverviewDataProvider: (props: unknown) => <section data-testid="provider">{(props as Record<string, ReactNode>)["children"]}</section> }))
vi.mock("./component", () => ({ OverviewPageBase: (props: MockPageProps) => <div>
    <span>{props.pathLabel}:{props.consoleLabel}:{props.title}</span><button type="button" onClick={props.onBuildApp}>{props.buildAppLabel}</button>
</div> }))

import { OverviewPage } from "."

describe("OverviewPage connected entry", () => {
    it("keeps one data provider around the complete page and routes the page command", () => {
        render(<OverviewPage />)
        expect(screen.getByTestId("provider")).toBeInTheDocument()
        expect(screen.getByText("navigationLabel:title:overview.title")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "overview.buildApp" }))
        expect(mocks.push).toHaveBeenCalledWith("/en/apps")
    })
})
