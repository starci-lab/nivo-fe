import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentType } from "react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ push: vi.fn(), locale: "en" }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useLocale: () => mocks.locale, useTranslations: () => (key: string) => key }))
interface MockPageProps { readonly title: string, readonly pathLabel: string, readonly consoleLabel: string, readonly buildAppLabel: string, readonly onBuildApp: () => void }
type MockProviderProps = { readonly content: ComponentType<MockPageProps>; readonly contentProps: MockPageProps }
vi.mock("@/modules/overview/context", () => ({ OverviewDataProvider: ({ content: Content, contentProps }: MockProviderProps) => <section data-testid="provider"><Content {...contentProps} /></section> }))
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
        expect(mocks.push).toHaveBeenCalledWith("/apps")
    })
})
