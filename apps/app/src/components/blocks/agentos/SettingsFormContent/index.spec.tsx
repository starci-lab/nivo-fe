import { fireEvent, render, screen } from "@testing-library/react"
import { createTranslator } from "next-intl"
import { renderToStaticMarkup } from "react-dom/server"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"
import { SettingsFormContent } from "."
import type { SettingsFormContentProps } from "../../../../modules/agentos/module-page/surface-types"
import { buildModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import { SessionProvider } from "../../../../modules/auth/session"
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
const props: SettingsFormContentProps = {
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
    credentialStatuses: [{ providerKey: "telegram-bot-token", maskedHint: "••••1234", status: "configured" }],
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
const SettingsInteractionFixture = () => {
    const [displayName, setDisplayName] = useState(props.displayName)
    const [modelProfile, setModelProfile] = useState(props.modelProfile)
    const [requireConfirmation, setRequireConfirmation] = useState(props.requireConfirmation)
    const [operatingMode, setOperatingMode] = useState(props.operatingMode)
    const [channelAccountRef, setChannelAccountRef] = useState(props.channelAccountRef)
    const [credentialValues, setCredentialValues] = useState(props.credentialValues)

    return (
        <SessionProvider>
            <SettingsFormContent
                copy={copy}
                {...props}
                displayName={displayName}
                modelProfile={modelProfile}
                requireConfirmation={requireConfirmation}
                operatingMode={operatingMode}
                channelAccountRef={channelAccountRef}
                credentialValues={credentialValues}
                on={{
                    ...props.on,
                    changeDisplayName: setDisplayName,
                    changeModelProfile: setModelProfile,
                    changeConfirmation: setRequireConfirmation,
                    changeOperatingMode: setOperatingMode,
                    changeChannelAccountRef: setChannelAccountRef,
                    changeCredential: (key, value) => setCredentialValues((current) => ({ ...current, [key]: value })),
                }}
            />
        </SessionProvider>
    )
}

describe("SettingsFormContent", () => {
    it("renders only the masked credential hint in its password field", () => {
        const html = renderToStaticMarkup(<SettingsFormContent copy={copy} {...props} />)

        expect(html).toContain('type="password"')
        expect(html).toContain("••••1234")
        expect(html).not.toContain("credential-secret")
    })

    it("reveals, hides, saves and removes credentials without translating input", () => {
        const view = render(<SettingsInteractionFixture />)
        const input = screen.getByLabelText("Telegram bot token", { selector: "input" })

        expect(input).toHaveAttribute("type", "password")
        expect(input).toHaveAttribute("placeholder", "••••1234")
        fireEvent.click(
            screen.getByRole("button", { name: copy.settings.showCredential({ label: "Telegram bot token" }) }),
        )
        expect(input).toHaveAttribute("type", "text")
        fireEvent.click(
            screen.getByRole("button", { name: copy.settings.hideCredential({ label: "Telegram bot token" }) }),
        )
        fireEvent.change(input, { target: { value: "  synthetic-test-value  " } })
        fireEvent.click(
            screen.getByRole("button", { name: copy.settings.saveCredential({ label: "Telegram bot token" }) }),
        )
        fireEvent.click(
            screen.getByRole("button", { name: copy.settings.removeCredential({ label: "Telegram bot token" }) }),
        )

        expect(props.on.saveCredential).toHaveBeenCalledExactlyOnceWith("telegram-bot-token", "synthetic-test-value")
        expect(props.on.removeCredential).toHaveBeenCalledExactlyOnceWith("telegram-bot-token")
        fireEvent.change(screen.getByRole("textbox", { name: copy.settings.displayName }), {
            target: { value: "Owner name" },
        })
        fireEvent.change(screen.getByRole("textbox", { name: copy.settings.modelProfile }), {
            target: { value: "raw-model" },
        })
        fireEvent.change(screen.getByRole("textbox", { name: copy.settings.channelRef }), {
            target: { value: "  TELEGRAM:987  " },
        })
        fireEvent.click(screen.getByRole("checkbox", { name: copy.settings.confirmation }))
        fireEvent.click(screen.getByRole("button", { name: copy.settings.save }))
        expect(props.on.save).toHaveBeenCalledExactlyOnceWith(
            { displayName: "Owner name", modelProfile: "raw-model", requireConfirmation: false },
            "assist",
            "TELEGRAM:987",
        )
        view.unmount()
    })
})
