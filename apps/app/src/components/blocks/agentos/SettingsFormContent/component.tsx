import { Checkbox, ChoiceTabs } from "@nivo/ui"
import { Button, Input, Text } from "@starci/grammar/common"
import { isOperatingMode } from "../../../../modules/agentos/module-page/surface-types.guards"

import type { SettingsFormContentProps } from "./settings-form.types"
import { SettingsCredentialFields } from "./SettingsCredentialFields"

type SettingsFormContentBaseProps = {
    readonly props: Omit<SettingsFormContentProps, "on">
    readonly on: SettingsFormContentProps["on"]
}

/** Editable model, policy, channel and credential controls for module settings. */
export const SettingsFormContentBase = (props: SettingsFormContentBaseProps) => {
    const {
        copy,
        currentDisplayName,
        currentModelProfile,
        currentChannelAccountRef,
        liveEnabled,
        canEnableLive,
        pending,
        refused,
        displayName,
        modelProfile,
        requireConfirmation,
        operatingMode,
        channelAccountRef,
    } = props.props
    return (
        <div>
            <>
                <Input
                    key={`display-${currentDisplayName}`}
                    id="agentos-module-display-name"
                    name="displayName"
                    label={copy.settings.displayName}
                    placeholder={currentDisplayName}
                    value={displayName}
                    isDisabled={pending}
                    variant="secondary"
                    onValueChange={props.on.changeDisplayName}
                />

                <Input
                    key={`profile-${currentModelProfile}`}
                    id="agentos-module-model-profile"
                    name="modelProfile"
                    label={copy.settings.modelProfile}
                    placeholder={currentModelProfile}
                    value={modelProfile}
                    isDisabled={pending}
                    variant="secondary"
                    onValueChange={props.on.changeModelProfile}
                />

                <Input
                    key={`channel-${currentChannelAccountRef}`}
                    id="agentos-module-channel-account-ref"
                    name="channelAccountRef"
                    label={copy.settings.channelRef}
                    placeholder={currentChannelAccountRef || "telegram:nivo-support"}
                    value={channelAccountRef}
                    isDisabled={pending}
                    variant="secondary"
                    hint={copy.settings.channelHint}
                    onValueChange={props.on.changeChannelAccountRef}
                />
            </>

            <ChoiceTabs
                props={{
                    label: copy.settings.mode,
                    selectedKey: operatingMode,
                    tabs: [
                        {
                            id: "assist",
                            label: copy.settings.assist,
                        },
                        {
                            id: "autopilot",
                            label: copy.settings.autopilot,
                        },
                    ],
                }}
                on={{
                    select: (key) => props.on.changeOperatingMode(isOperatingMode(key) ? key : operatingMode),
                }}
            />

            <Checkbox
                props={{
                    label: copy.settings.confirmation,
                    isSelected: requireConfirmation,
                    name: "requireConfirmation",
                }}
                on={{
                    change: props.on.changeConfirmation,
                }}
            />
            <>
                <Button
                    variant="primary"
                    isPending={pending}
                    isDisabled={channelAccountRef.trim().length < 3}
                    onPress={() =>
                        props.on.save(
                            {
                                displayName,
                                modelProfile,
                                requireConfirmation,
                            },
                            operatingMode,
                            channelAccountRef.trim(),
                        )
                    }
                >
                    {copy.settings.save}
                </Button>

                <Button
                    variant="secondary"
                    isPending={pending}
                    isDisabled={!liveEnabled && !canEnableLive}
                    onPress={() => props.on.setLiveEnabled(!liveEnabled)}
                >
                    {liveEnabled ? copy.settings.disableLive : copy.settings.enableLive}
                </Button>
            </>
            <SettingsCredentialFields {...props.props} on={props.on} />
            {refused ? (
                <Text size="sm" tone="muted" live="assertive">
                    {copy.settings.refused}
                </Text>
            ) : (
                <Text size="sm" tone="muted" live="polite">
                    {liveEnabled
                        ? copy.settings.liveEnabled
                        : canEnableLive
                          ? copy.settings.liveReady
                          : copy.settings.liveRequires}
                </Text>
            )}
        </div>
    )
}
