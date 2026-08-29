import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyIntegrationCenterBase } from "./component"

const card = { id: "google", title: "Google", description: "Analytics", statusLabel: "Connected", statusTone: "success" as const, detail: "client-1", actionLabel: "Configure" }
describe("academy integration center states", () => {
    it("renders refusal and resting provider cards", () => {
        expect(renderToStaticMarkup(<AcademyIntegrationCenterBase state="refused" sectionLabel="Integrations" refusedLabel="Unavailable" cards={[]} onSelect={vi.fn()} onChangeField={vi.fn()} onSubmit={vi.fn()} />)).toContain("Unavailable")
        expect(renderToStaticMarkup(<AcademyIntegrationCenterBase state="resting" sectionLabel="Integrations" refusedLabel="Unavailable" cards={[card]} onSelect={vi.fn()} onChangeField={vi.fn()} onSubmit={vi.fn()} />)).toContain("Integrations")
    })
    it("renders selected password form and outcome", () => {
        const html = renderToStaticMarkup(<AcademyIntegrationCenterBase state="answered" sectionLabel="Integrations" refusedLabel="Unavailable" cards={[card]} selected={{ id: "google", label: "Google setup", fields: [{ id: "secret", name: "secret", label: "Secret", kind: "password" }], submitLabel: "Save" }} pendingId="google" outcome="Saved" onSelect={vi.fn()} onChangeField={vi.fn()} onSubmit={vi.fn()} />)
        expect(html).toContain("Google setup")
        expect(html).toContain("Secret")
        expect(html).toContain("Saved")
    })
})