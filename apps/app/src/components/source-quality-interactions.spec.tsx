import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyIntegrationCenterBase } from "./blocks/academy/AcademyIntegrationCenter/component"
import { AcademyLeadPipelineBase } from "./blocks/academy/AcademyLeadPipeline/component"
import { AcademyStudentCrmBase } from "./blocks/academy/AcademyStudentCrm/component"
import { AgentOSSolutionModuleCenterBase } from "./blocks/agentos/AgentOSSolutionModuleCenter/component"
import { AgentOSProvisioningBase } from "./blocks/provisioning/AgentOSProvisioning/component"
import { AppsPageBase } from "./pages/AppsPage/component"

const leadLabels = { section: "Leads", empty: "No leads", refused: "Unavailable", open: "Open", detail: "Detail", advance: "Advance", draft: "Draft", saved: "Saved", actionFailed: "Failed" }
const studentLabels = { section: "Students", empty: "No students", refused: "Unavailable", open: "Open", active: "Active", banned: "Banned", detail: "Detail", create: "Create", name: "Name", email: "Email", password: "Password", saveStudent: "Save", courseSlug: "Course", grant: "Grant", revoke: "Revoke", ban: "Ban", activate: "Activate", loadingDetail: "Loading", actionFailed: "Failed" }

describe("source quality interaction coverage", () => {
    it("fires integration, lead, student, and solution actions", () => {
        const submit = vi.fn()
        const change = vi.fn()
        render(<AcademyIntegrationCenterBase state="answered" sectionLabel="Integrations" refusedLabel="Unavailable" cards={[{ id: "google", title: "Google", description: "Analytics", statusLabel: "Connected", statusTone: "success", detail: "client", actionLabel: "Configure" }]} selected={{ id: "google", label: "Setup", fields: [{ id: "secret", name: "secret", label: "Secret", kind: "password" }], submitLabel: "Save" }} onSelect={vi.fn()} onChangeField={change} onSubmit={submit} />)
        fireEvent.change(screen.getByLabelText("Secret"), { target: { value: "value" } })
        fireEvent.click(screen.getByRole("button", { name: "Save" }))
        expect(change).toHaveBeenCalled()
        expect(submit).toHaveBeenCalled()
        cleanup()
        renderToStaticMarkup(<AcademyIntegrationCenterBase state="answered" sectionLabel="Integrations" refusedLabel="Unavailable" cards={[]} selected={{ id: "plain", label: "Plain", fields: [{ id: "name", name: "name", label: "Name", kind: "text" }], submitLabel: "Save" }} onSelect={vi.fn()} onChangeField={vi.fn()} onSubmit={vi.fn()} />)

        const openLead = vi.fn()
        const advance = vi.fn()
        const draftReply = vi.fn()
        const lead = { id: "lead-1", name: "Reader", contact: "reader@example.test", message: "Interested", status: "new", note: null }
        render(<AcademyLeadPipelineBase state="answered" leads={[lead]} selected={lead} labels={leadLabels} onOpenLead={openLead} onAdvance={advance} onDraftReply={draftReply} />)
        fireEvent.click(screen.getAllByRole("button", { name: "Open" }).at(-1)!)
        fireEvent.click(screen.getByRole("button", { name: "Draft" }))
        render(<AcademyLeadPipelineBase state="answered" leads={[lead]} selected={lead} draft="Prepared" labels={leadLabels} onOpenLead={openLead} onAdvance={advance} onDraftReply={draftReply} />)
        fireEvent.click(screen.getByRole("button", { name: "Advance" }))
        expect(openLead).toHaveBeenCalled()
        expect(draftReply).toHaveBeenCalled()
        expect(advance).toHaveBeenCalled()
        cleanup()
        renderToStaticMarkup(<AcademyLeadPipelineBase state="resting" leads={[]} labels={leadLabels} onOpenLead={openLead} onAdvance={advance} onDraftReply={draftReply} />)
        renderToStaticMarkup(<AcademyLeadPipelineBase state="answered" leads={[{ ...lead, status: "converted" }]} selected={lead} message="Saved" pendingAction="advance" labels={leadLabels} onOpenLead={openLead} onAdvance={advance} onDraftReply={draftReply} />)

        const actions = { openStudent: vi.fn(), changeName: vi.fn(), changeEmail: vi.fn(), changePassword: vi.fn(), createStudent: vi.fn(), changeCourseSlug: vi.fn(), setStatus: vi.fn(), grantAccess: vi.fn(), revokeAccess: vi.fn() }
        const student = { id: "member-1", name: "Student", email: "student@example.test", role: "student", status: "active", xp: 1 }
        const detail = { member: student, orders: [], courses: [{ slug: "intro", title: "Intro", completed: 1, total: 2 }] }
        render(<AcademyStudentCrmBase state="answered" students={[student]} detailState="answered" detail={detail} labels={studentLabels} on={actions} />)
        fireEvent.click(screen.getAllByRole("button", { name: "Open" }).at(-1)!)
        fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New" } })
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.test" } })
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } })
        fireEvent.change(screen.getByLabelText("Course"), { target: { value: "advanced" } })
        fireEvent.click(screen.getByRole("button", { name: "Save" }))
        fireEvent.click(screen.getByRole("button", { name: "Grant" }))
        expect(actions.openStudent).toHaveBeenCalled()
        expect(actions.createStudent).toHaveBeenCalled()
        expect(actions.grantAccess).toHaveBeenCalled()
        cleanup()
        renderToStaticMarkup(<AcademyStudentCrmBase state="resting" students={[]} detailState="resting" labels={studentLabels} on={actions} />)
        renderToStaticMarkup(<AcademyStudentCrmBase state="answered" students={[{ ...student, status: "banned" }]} detailState="refused" actionMessage="Failed" detail={{ member: student, orders: [], courses: [{ slug: "zero", title: "Zero", completed: 0, total: 0 }] }} labels={studentLabels} on={actions} />)

        const selectMode = vi.fn()
        const pressCard = vi.fn()
        render(<AgentOSSolutionModuleCenterBase state="answered" mode="catalog" sectionLabel="Solutions" modesLabel="Mode" modes={[{ id: "catalog", label: "Catalog" }, { id: "installed", label: "Installed" }]} refusedLabel="Unavailable" emptyLabel="Empty" emptyActionLabel="Browse" cards={[{ id: "sales", title: "Sales", description: "Assist", statusLabel: "Ready", statusTone: "success", actionLabel: "Install" }]} onSelectMode={selectMode} onPressCard={pressCard} />)
        fireEvent.click(screen.getByRole("button", { name: "Install" }))
        fireEvent.click(screen.getByRole("tab", { name: "Installed" }))
        expect(pressCard).toHaveBeenCalledWith("sales")
        expect(selectMode).toHaveBeenCalledWith("installed")
        cleanup()
        renderToStaticMarkup(<AgentOSSolutionModuleCenterBase state="resting" mode="installed" sectionLabel="Solutions" modesLabel="Mode" modes={[{ id: "catalog", label: "Catalog" }, { id: "installed", label: "Installed" }]} refusedLabel="Unavailable" emptyLabel="Empty" emptyActionLabel="Browse" cards={[]} onSelectMode={selectMode} onPressCard={pressCard} />)
        const steps = [{ ordinal: "1", label: "Request", state: "current" as const, stateLabel: "Current" }]
        renderToStaticMarkup(<AgentOSProvisioningBase state="failed" props={{ steps, subject: "AgentOS", detail: "order-1", statusTitle: "Failed", statusText: "Unavailable" }} on={{ statusAction: vi.fn() }} />)
        renderToStaticMarkup(<AgentOSProvisioningBase state="ready" props={{ steps, subject: "AgentOS", detail: "workspace-1", statusTitle: "Ready", statusText: "Ready", statusActionLabel: "Manage" }} on={{ statusAction: vi.fn() }} />)
    })

    it("fires AppsPage row and offer actions across resting and refused sections", () => {
        const onBuildTemplate = vi.fn()
        const onOpenOwnedApp = vi.fn()
        render(<AppsPageBase title="Apps" lede="Lede" owned={{ phase: "answered", label: "Owned", rows: [{ id: "site-1", name: "Academy", detail: "academy.test", kindLabel: "Academy", status: "ready", statusLabel: "Ready", actionLabel: "Open" }] }} catalogue={{ phase: "answered", label: "Catalogue", fact: "Templates", offers: [{ id: "offer-1", templateKey: "ai_academy", name: "Academy", tagline: "Learn", kindLabel: "Template", priceLabel: "100", actionLabel: "Build", actionDisabled: false }] }} onBuildTemplate={onBuildTemplate} onOpenOwnedApp={onOpenOwnedApp} />)
        fireEvent.click(screen.getByRole("button", { name: "Build" }))
        for (const link of screen.getAllByRole("link", { name: "Academy" })) fireEvent.click(link)
        expect(onBuildTemplate).toHaveBeenCalledWith("ai_academy")
        expect(onOpenOwnedApp).toHaveBeenCalledWith("site-1")
        render(<AppsPageBase title="Apps" lede="Lede" owned={{ phase: "resting", label: "Owned" }} catalogue={{ phase: "resting", label: "Catalogue", fact: "Fact" }} onBuildTemplate={onBuildTemplate} onOpenOwnedApp={onOpenOwnedApp} />)
        render(<AppsPageBase title="Apps" lede="Lede" owned={{ phase: "refused", label: "Owned", note: "Unavailable" }} catalogue={{ phase: "empty", label: "Catalogue", note: "Empty" }} onBuildTemplate={onBuildTemplate} onOpenOwnedApp={onOpenOwnedApp} />)
        expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0)
    })
})
