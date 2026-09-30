import type { ReactNode } from "react"
import type { Messages } from "next-intl"
import { I18nProvider } from "@nivo/i18n/provider"
import { getMessages } from "next-intl/server"
import { MESSAGE_SCOPES, pickMessages, type MessageScopeName } from "@/modules/i18n/messages"

/** Props for {@link MessageScopeView}: a selected route group, the loaded catalogue, and its stream. */
type MessageScopeViewProps = {
    readonly scope: MessageScopeName
    readonly messages: Messages
    readonly locale?: string
    readonly children: ReactNode
}

/** Render one route group's catalogue slice inside the shared internationalization provider. */
export const MessageScopeView = ({ scope, messages, locale, children }: MessageScopeViewProps) => (
    <I18nProvider
        {...(locale === undefined ? {} : { locale })}
        messages={pickMessages(messages, MESSAGE_SCOPES[scope])}
    >
        {children}
    </I18nProvider>
)

/** Props for {@link MessageScope}: which route group copy to ship, and the routed stream. */
type MessageScopeProps = {
    readonly scope: MessageScopeName
    readonly children: ReactNode
}

/**
 * Ship one route group slice of the catalogue to the client, as a server component.
 *
 * The provider above it (the locale root) carries only the shell copy. This one replaces it for
 * everything beneath the route group with the namespaces that group reads, so a page pays for its own
 * copy and no other page.
 *
 * @param props - The scope and the routed stream.
 * @returns The stream inside a client provider holding just that scope of messages.
 */
export const MessageScope = async ({ scope, children }: MessageScopeProps) => {
    const messages = await getMessages()
    return <MessageScopeView scope={scope} messages={messages}>{children}</MessageScopeView>
}

export default MessageScope
