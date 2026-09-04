import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
import { fireEvent, render, screen, cleanup } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ExecuteSessionRailBlock as ActualExecuteSessionRailBlock } from "./index"

type ExecuteSessionRailBlockFixtureProps = Omit<ComponentProps<typeof ActualExecuteSessionRailBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const ExecuteSessionRailBlockCopyFixture = (props: ExecuteSessionRailBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualExecuteSessionRailBlock {...props} copy={buildModulePageCopy(t)} />
}
const ExecuteSessionRailBlock = ({ locale = "en", ...props }: ExecuteSessionRailBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><ExecuteSessionRailBlockCopyFixture {...props} /></NextIntlClientProvider>

afterEach(cleanup)
describe.each(["en", "vi"] as const)("Execute session rail %s", locale => {
 it("localizes navigation and preserves session identifiers", () => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.sessions
  const onSelect = vi.fn(); const onCreate = vi.fn()
  render(<ExecuteSessionRailBlock locale={locale} sessions={[{ id: "session-raw", title: "User conversation", updatedLabel: "2026-09-04", status: "archived" }]} selectedId="session-raw" onSelect={onSelect} onCreate={onCreate} />)
  expect(screen.getAllByText(copy.archived).length).toBeGreaterThan(0)
  expect(screen.getAllByLabelText(copy.label).length).toBeGreaterThan(0)
  expect(screen.getAllByText("User conversation").length).toBeGreaterThan(0)
  fireEvent.click(screen.getAllByRole("button", { name: copy.new })[0]!)
  expect(onCreate).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getAllByText("User conversation")[0]!)
  expect(onSelect).toHaveBeenCalledWith("session-raw")
 })
})


describe.each(["en", "vi"] as const)("Session rail pending and collapse %s", locale => {
 const targets = [...new Set([globalThis, window])]
 let descriptors: Array<PropertyDescriptor | undefined> = []
 beforeEach(() => {
  descriptors = targets.map(target => Object.getOwnPropertyDescriptor(target, "localStorage"))
  const values = new Map<string, string>()
  const storage: Storage = { get length() { return values.size }, clear: () => values.clear(), getItem: key => values.get(key) ?? null, key: index => [...values.keys()][index] ?? null, removeItem: key => { values.delete(key) }, setItem: (key, value) => { values.set(key, value) } }
  for (const target of targets) Object.defineProperty(target, "localStorage", { configurable: true, value: storage })
 })
 afterEach(() => {
  targets.forEach((target, index) => {
   const descriptor = descriptors[index]
   if (descriptor) Object.defineProperty(target, "localStorage", descriptor)
   else Reflect.deleteProperty(target, "localStorage")
  })
 })

 it("preserves the active timestamp and toggles localized controls while create is pending", () => {

  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.sessions
  const onCreate = vi.fn()
  render(<ExecuteSessionRailBlock locale={locale} sessions={[{ id: "active/raw", title: "Owner title", updatedLabel: "Raw updated label", status: "active" }]} selectedId={null} pending onSelect={vi.fn()} onCreate={onCreate} />)
  expect(screen.getByText("Raw updated label")).toBeInTheDocument()
  for (const button of screen.getAllByRole("button", { name: copy.new })) {
   expect(button).toBeDisabled()
   fireEvent.click(button)
  }
  expect(onCreate).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: copy.collapse }))
  expect(screen.getByRole("button", { name: copy.expand })).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: copy.expand }))
  expect(screen.getByRole("button", { name: copy.collapse })).toBeInTheDocument()

 })
})



