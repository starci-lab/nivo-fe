import { isBoolean, isNullableString, isOneOf, isRecord, isString, parseEach } from "@nivo/api"
import { AgentChannelApplyState, AgentChannelProvider } from "./__generated__/core"
import type { ConfigureAgentWorkspaceChannelMutation } from "./__generated__/core"
import type { AgentWorkspaceChannelSettingView } from "./agentos-module-runtime"

type ChannelSetting = NonNullable<ConfigureAgentWorkspaceChannelMutation["configureAgentWorkspaceChannel"]["data"]>
const CHANNEL_STATE_LABELS = {
    [AgentChannelApplyState.Applied]: "APPLIED",
    [AgentChannelApplyState.Error]: "ERROR",
    [AgentChannelApplyState.NotConfigured]: "NOT_CONFIGURED",
    [AgentChannelApplyState.Pending]: "PENDING",
} satisfies Record<AgentChannelApplyState, AgentWorkspaceChannelSettingView["state"]>

/** Parse the `data` of `configureAgentWorkspaceChannel`: statuses only, never the secret. */
export const parseChannelSetting = (input: unknown): AgentWorkspaceChannelSettingView | null => {
    if (
        !isRecord(input) ||
        !isOneOf(input.provider, [
            AgentChannelProvider.Discord,
            AgentChannelProvider.Messenger,
            AgentChannelProvider.Slack,
            AgentChannelProvider.Telegram,
            AgentChannelProvider.Whatsapp,
            AgentChannelProvider.Zalo,
        ]) ||
        !isString(input.accountId) ||
        !isOneOf(input.state, [
            AgentChannelApplyState.Applied,
            AgentChannelApplyState.Error,
            AgentChannelApplyState.NotConfigured,
            AgentChannelApplyState.Pending,
        ]) ||
        !isNullableString(input.displayName)
    ) {
        return null
    }
    const credentials = parseEach(input.credentials, (entry) =>
        isRecord(entry) &&
        isString(entry.key) &&
        isBoolean(entry.required) &&
        isBoolean(entry.configured) &&
        isNullableString(entry.hint) &&
        isNullableString(entry.syncedAt)
            ? {
                  key: entry.key,
                  required: entry.required,
                  configured: entry.configured,
                  hint: entry.hint,
                  syncedAt: entry.syncedAt,
              }
            : null,
    )
    if (credentials === null) return null
    const setting: ChannelSetting = {
        provider: input.provider,
        accountId: input.accountId,
        state: input.state,
        displayName: input.displayName,
        credentials,
    }
    return {
        provider: setting.provider,
        accountId: setting.accountId,
        state: CHANNEL_STATE_LABELS[setting.state],
        displayName: setting.displayName,
        credentials: setting.credentials,
    }
}
