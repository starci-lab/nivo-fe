import { LabelledProgressRow } from "@nivo/ui"
import { SurfaceCard, Text } from "@starci/grammar/common"
import type { AgentosModuleStudio } from "@/modules/api/agentos-module-studio"
/** Public API role for AgentOSModuleProfileProps. */
export type AgentOSModuleProfileProps = AgentOSModuleProfileViewProps
/** Resolved copy for the profile block. */
type AgentOSModuleProfileLabels = {
    readonly title: string
    readonly progress: string
    readonly missing: string
    readonly refused: string
}
/** Profile projection, slot flags and copy the pure profile draws. */
type AgentOSModuleProfileData = {
    readonly studio?: AgentosModuleStudio
    readonly loading: boolean
    readonly refused: boolean
    readonly labels: AgentOSModuleProfileLabels
}
type AgentOSModuleProfileViewProps = {
    readonly props: AgentOSModuleProfileData
}

/** Draw backend-owned completeness, accepted facts and unresolved profile fields. */
export const AgentOSModuleProfileBase = (props: AgentOSModuleProfileProps) => {
    const { studio, loading, refused, labels }: AgentOSModuleProfileData = props.props
    if (refused)
        return (
            <SurfaceCard label={labels.title}>
                <div>
                    <Text size="sm" tone="muted">
                        {labels.refused}
                    </Text>
                </div>
            </SurfaceCard>
        )
    const facts = loading
        ? [
              {
                  key: labels.title,
                  value: "",
              },
          ]
        : (studio?.profileFacts ?? [])
    return (
        <SurfaceCard label={labels.title}>
            <div>
                <LabelledProgressRow
                    props={{
                        id: "module-progress",
                        title: labels.progress,
                        percent: studio?.module.progress ?? 0,
                        percentText: `${studio?.module.progress ?? 0}%`,
                    }}
                    isLoading={loading}
                />
                <div>
                    {facts.map((fact) => (
                        <div key={fact.key}>
                            <Text size="sm" isSkeleton={loading}>
                                {fact.key}
                            </Text>
                            <Text size="sm" weight="semibold" isSkeleton={loading}>
                                {fact.value}
                            </Text>
                        </div>
                    ))}
                </div>
            </div>
        </SurfaceCard>
    )
}
