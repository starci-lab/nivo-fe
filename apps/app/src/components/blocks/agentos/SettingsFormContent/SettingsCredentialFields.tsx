import { Button, Input, Text } from "@starci/grammar/common"
import type { ModulePageCopy } from "@/modules/agentos/module-page-copy"
import type { SettingsFormContentProps } from "./settings-form.types"

type SettingsCredentialFieldsProps = SettingsFormContentProps

const credentialStatusLabel = (status: string, copy: ModulePageCopy): string =>
    status === "configured" || status === "invalid"
        ? copy.credentialStatus[status]
        : copy.shell.unknownStatus({ status })

/** Draw credential entry, status, save, and removal controls. */
export const SettingsCredentialFields = (props: SettingsCredentialFieldsProps) => {
    const { copy, credentialSlots, credentialStatuses, credentialValues, pending } = props
    return (
        <>
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
        </>
    )
}
