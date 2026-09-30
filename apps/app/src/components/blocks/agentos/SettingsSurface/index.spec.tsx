import { createTranslator } from "next-intl"
import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"
import { SettingsSurface } from "."
import type { SettingsSurfaceProps } from "../../../../modules/agentos/module-page/surface-types"
import { buildModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import { TIME_ZONE } from "@/modules/i18n"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
        onError: (error) => {
            throw error
        },
    }),
)
const props: SettingsSurfaceProps = {
    activeVersion: 1,
    currentDisplayName: "Support Desk",
    currentModelProfile: "nivo-default",
    currentConfirmation: true,
    currentOperatingMode: "assist",
    currentChannelAccountRef: "TELEGRAM:12345",
    displayName: "Support Desk",
    modelProfile: "nivo-default",
    requireConfirmation: true,
    operatingMode: "assist",
    channelAccountRef: "TELEGRAM:12345",
    credentialValues: {},
    liveEnabled: false,
    canEnableLive: true,
    pending: false,
    refused: false,
    credentialSlots: [{ key: "telegram-bot-token", label: "Telegram bot token", provider: "telegram" }],
    credentialStatuses: [],
    on: {
        save: vi.fn(),
        setLiveEnabled: vi.fn(),
        saveCredential: vi.fn(),
        removeCredential: vi.fn(),
        changeDisplayName: vi.fn(),
        changeModelProfile: vi.fn(),
        changeConfirmation: vi.fn(),
        changeOperatingMode: vi.fn(),
        changeChannelAccountRef: vi.fn(),
        changeCredential: vi.fn(),
    },
}

describe("SettingsSurface", () => {
    it("shows the settings form and the versioned safeguards", () => {
        const html = renderToStaticMarkup(<SettingsSurface copy={copy} {...props} />)

        expect(html).toContain(copy.settings.title)
        expect(html).toContain(copy.settings.safeguards)
        expect(html).toContain(copy.settings.activeVersion({ version: 1 }))
    })

    it.each(["configured", "invalid", "constructor"] as const)(
        "keeps %s status separate from credential identity",
        (status) => {
            render(
                <SettingsSurface
                    copy={copy}
                    {...props}
                    activeVersion={null}
                    currentConfirmation={false}
                    currentOperatingMode="autopilot"
                    canEnableLive={false}
                    pending
                    refused
                    credentialStatuses={[{ providerKey: "telegram-bot-token", maskedHint: "masked-only", status }]}
                />,
            )

            expect(screen.getByRole("button", { name: copy.settings.enableLive })).toBeDisabled()
            expect(screen.getByText(copy.settings.liveRequires)).toBeInTheDocument()
            expect(screen.getByText(copy.settings.allowedPolicy({ mode: copy.settings.autopilot }))).toBeInTheDocument()
            const expectedStatus =
                status === "configured" || status === "invalid"
                    ? copy.credentialStatus[status]
                    : copy.shell.unknownStatus({ status })
            expect(screen.getByText(`telegram-bot-token: masked-only · ${expectedStatus}`)).toBeInTheDocument()
            expect(screen.getByText(copy.settings.refused)).toBeInTheDocument()
            expect(screen.getByLabelText("Telegram bot token", { selector: "input" })).toBeDisabled()
            expect(
                screen.queryByRole("button", { name: copy.settings.removeCredential({ label: "Telegram bot token" }) }),
            ).toBeNull()
        },
    )
})
