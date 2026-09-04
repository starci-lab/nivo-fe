import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
const mocks = vi.hoisted(() => ({ push: vi.fn(), answer: undefined as unknown }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks", () => ({ useQueryMyAgentosCustomModulesSwr: () => ({ data: mocks.answer }) }))
import { AgentOSCustomModuleCollection } from "./index"
afterEach(cleanup)
describe.each(["en", "vi"] as const)("Custom module collection %s", locale => {
 it("keeps translated active status and raw continuation identity", () => {
  const messages = locale === "en" ? enMessages : viMessages
  const copy = messages.console.agentos.modules
  mocks.answer = { ok: true, data: [{ id: "module-raw", name: "Owner module", progress: 80, status: "active", installationId: "installation-raw" }] }
  render(<NextIntlClientProvider locale={locale} messages={messages} timeZone={TIME_ZONE} onError={error => { throw error }}><AgentOSCustomModuleCollection workspaceId="workspace-raw" /></NextIntlClientProvider>)
  expect(screen.getByText(copy.status.active)).toBeInTheDocument()
  expect(screen.getByText(copy.status.active).closest('[data-component="Badge"]')).toHaveAttribute("data-tone", "success")
  expect(screen.getByText("Owner module")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: copy.collection.inspect }))
  expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-raw/modules/installation-raw")
 })
})

describe.each(["en", "vi"] as const)("Custom module loading labels %s", locale => {
 it("supplies localized kind and draft labels to inert skeleton badges", () => {
  const messages = locale === "en" ? enMessages : viMessages
  const copy = messages.console.agentos.modules
  mocks.answer = undefined
  const view = render(<NextIntlClientProvider locale={locale} messages={messages} timeZone={TIME_ZONE} onError={error => { throw error }}><AgentOSCustomModuleCollection workspaceId="workspace-raw" /></NextIntlClientProvider>)
  expect(screen.getAllByText(copy.collection.custom).length).toBeGreaterThan(0)
  expect(screen.getAllByText(copy.status.draft).length).toBeGreaterThan(0)
  const badges = view.container.querySelectorAll('[data-component="Badge"][data-loading="true"]')
  expect(badges.length).toBeGreaterThan(0)
  for (const badge of badges) expect(badge).toHaveAttribute("aria-hidden", "true")
 })
})


describe.each(["en", "vi"] as const)("Collection recovery routes %s", locale => {
 it.each(["refused", "empty"] as const)("offers the exact create route when %s", state => {
  mocks.push.mockClear()
  const messages = locale === "en" ? enMessages : viMessages
  const copy = messages.console.agentos.modules.collection
  mocks.answer = state === "refused" ? { ok: false } : { ok: true, data: [] }
  render(<NextIntlClientProvider locale={locale} messages={messages} timeZone={TIME_ZONE} onError={error => { throw error }}><AgentOSCustomModuleCollection workspaceId="workspace/raw" /></NextIntlClientProvider>)
  expect(screen.getByText(copy[state])).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: copy.create }))
  expect(mocks.push).toHaveBeenCalledExactlyOnceWith("/agentos/workspaces/workspace/raw/modules/create")
 })
 it("resumes the raw studio identity before an installation exists", () => {
  mocks.push.mockClear()
  const messages = locale === "en" ? enMessages : viMessages
  mocks.answer = { ok: true, data: [{ id: "draft-raw", name: "Owner draft", progress: 20, status: "draft", installationId: null }] }
  render(<NextIntlClientProvider locale={locale} messages={messages} timeZone={TIME_ZONE} onError={error => { throw error }}><AgentOSCustomModuleCollection workspaceId="workspace-raw" /></NextIntlClientProvider>)
  fireEvent.click(screen.getByRole("button", { name: messages.console.agentos.modules.collection.resume }))
  expect(mocks.push).toHaveBeenCalledExactlyOnceWith("/agentos/workspaces/workspace-raw/modules/studio/draft-raw")
 })
})
