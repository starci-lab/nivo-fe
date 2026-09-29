import { Checkbox, ChoiceTabs } from "@nivo/ui"
import { Button, Input, Text } from "@starci/grammar/common"
import type { SettingsFormContentProps as SettingsFormDataProps } from "../../../../modules/agentos/module-page/surface-types"
import type { WithModulePageCopy, ModulePageCopy } from "../../../../modules/agentos/module-page-copy"

const credentialStatusLabel = (status: string, copy: ModulePageCopy): string =>
    status === "configured" || status === "invalid"
        ? copy.credentialStatus[status]
        : copy.shell.unknownStatus({ status })

type SettingsFormContentProps = WithModulePageCopy<SettingsFormDataProps>

/** Editable model, policy, channel and credential controls for module settings. */
export const SettingsFormContent = (props: SettingsFormContentProps) => {
    const {
        copy,
        currentDisplayName,
        currentModelProfile,
        currentChannelAccountRef,
        liveEnabled,
        canEnableLive,
        pending,
        refused,
        credentialSlots,
        credentialStatuses,
        displayName,
        modelProfile,
        requireConfirmation,
        operatingMode,
        channelAccountRef,
        credentialValues,
    } = props
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
                    select: (key) => props.on.changeOperatingMode(key as "assist" | "autopilot"),
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
            {credentialSlots.map((slot) => (
                <Input
                    key={`${slot.key}-${credentialStatuses.find((row) => row.providerKey === slot.key)?.maskedHint ?? "empty"}`}
                    id={`agentos-module-credential-${slot.key}`}
                    name={slot.key}
                    label={slot.label}
                    kind="password"
                    placeholder={
                        credentialStatuses.find((row) => row.providerKey === slot.key)?.maskedHint ??
                        copy.settings.enterCredential
                    }
                    isDisabled={pending}
                    revealLabel={copy.settings.showCredential({ label: slot.label })}
                    hideLabel={copy.settings.hideCredential({ label: slot.label })}
                    variant="secondary"
                    hint={copy.settings.credentialHint({ provider: slot.provider })}
                    value={credentialValues[slot.key] ?? ""}
                    onValueChange={(value) => props.on.changeCredential(slot.key, value)}
                />
            ))}
            {credentialSlots.length === 0 ? undefined : (
                <Text size="sm" tone="muted" live="polite">
                    {credentialStatuses.length === 0
                        ? copy.settings.noCredential
                        : credentialStatuses
                              .map(
                                  (row) =>
                                      `${row.providerKey}: ${row.maskedHint} · ${credentialStatusLabel(row.status, copy)}`,
                              )
                              .join(" · ")}
                </Text>
            )}
            {credentialSlots.flatMap((slot) => {
                const configured = credentialStatuses.some((row) => row.providerKey === slot.key)
                const value = credentialValues[slot.key]?.trim() ?? ""
                return [
                    <Button
                        key={`${slot.key}-save`}
                        variant="secondary"
                        isDisabled={value.length === 0}
                        isPending={pending}
                        onPress={() => value.length > 0 && props.on.saveCredential(slot.key, value)}
                    >
                        {copy.settings.saveCredential({ label: slot.label })}
                    </Button>,
                    ...(configured
                        ? [
                              <Button
                                  key={`${slot.key}-remove`}
                                  variant="ghost"
                                  isDisabled={pending}
                                  onPress={() => props.on.removeCredential(slot.key)}
                              >
                                  {copy.settings.removeCredential({ label: slot.label })}
                              </Button>,
                          ]
                        : []),
                ]
            })}
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
