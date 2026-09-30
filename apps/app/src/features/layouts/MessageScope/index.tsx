import type { ReactNode } from "react"
import { I18nProvider } from "@nivo/i18n/provider"
import { getMessages } from "next-intl/server"
import { MESSAGE_SCOPES, pickMessages, type MessageScopeName } from "@/modules/i18n/messages"

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
    return <I18nProvider messages={pickMessages(messages, MESSAGE_SCOPES[scope])}>{children}</I18nProvider>
}

export default MessageScope
