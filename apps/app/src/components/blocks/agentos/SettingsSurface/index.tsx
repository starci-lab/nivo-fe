import { SurfaceCard, Text } from "@starci/grammar/common"
import { SettingsFormContent } from "../SettingsFormContent"
import type { SettingsSurfaceProps as SettingsSurfaceDataProps } from "../../../../modules/agentos/module-page/surface-types"
import type { WithModulePageCopy } from "../../../../modules/agentos/module-page-copy"

type SettingsSurfaceProps = WithModulePageCopy<SettingsSurfaceDataProps>

/** Settings form and safeguards for the active module version. */
export const SettingsSurface = (props: SettingsSurfaceProps) => {
    return (
        <div>
            <SurfaceCard label={props.copy.settings.title}>
                <SettingsFormContent {...props} />
            </SurfaceCard>

            <SurfaceCard
                label={props.copy.settings.safeguards}
                fact={
                    props.activeVersion === null
                        ? props.copy.settings.contextRequired
                        : props.copy.settings.activeVersion({ version: props.activeVersion })
                }
            >
                <div>
                    {
                        <div>
                            {[
                                [
                                    props.copy.settings.externalSends,
                                    props.currentConfirmation
                                        ? props.copy.settings.requireConfirmation
                                        : props.copy.settings.allowedPolicy({
                                              mode: props.copy.settings[props.currentOperatingMode],
                                          }),
                                ],
                                [props.copy.settings.refundLegal, props.copy.settings.humanApproval],
                                [
                                    props.copy.settings.promptCache,
                                    props.activeVersion === null
                                        ? props.copy.settings.inactive
                                        : props.copy.settings.stableKnowledge({ version: props.activeVersion }),
                                ],
                                [props.copy.settings.cacheInvalidation, props.copy.settings.automaticApply],
                                [props.copy.settings.executeHistory, props.copy.settings.bindingRetained],
                            ].map(([label, value], index) => (
                                <div key={index}>
                                    {<Text size="sm">{label}</Text>}
                                    {
                                        <Text size="sm" weight="semibold">
                                            {value}
                                        </Text>
                                    }
                                </div>
                            ))}
                        </div>
                    }
                </div>
            </SurfaceCard>
        </div>
    )
}
