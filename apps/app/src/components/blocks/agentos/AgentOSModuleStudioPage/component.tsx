import { Heading, Text } from "@starci/grammar/common"
import { Breadcrumbs, TileIcon } from "@nivo/ui"
import { AgentOSModuleAttachments } from "@/components/blocks/agentos/AgentOSModuleAttachments"
import { AgentOSModuleInterview } from "@/components/blocks/agentos/AgentOSModuleInterview"
import { AgentOSModuleProfile } from "@/components/blocks/agentos/AgentOSModuleProfile"
import { AgentOSModuleSpecification } from "@/components/blocks/agentos/AgentOSModuleSpecification"
/** Public API role for AgentOSModuleStudioPageBaseProps. */
type AgentOSModuleStudioPageBaseProps = {
    readonly props: AgentOSModuleStudioPageViewProps
    readonly on: AgentOSModuleStudioPageActions
}
/** Navigation commands the connected Studio page exposes to its pure drawing half. */
type AgentOSModuleStudioPageActions = { readonly back: () => void }
type AgentOSModuleStudioPageViewProps = {
    readonly workspaceId: string
    readonly moduleId: string
    readonly labels: {
        readonly path: string
        readonly modules: string
        readonly title: string
        readonly description: string
        readonly eyebrow: string
        readonly sections: string
    }
}
/** Compose independently-owned interview, profile, file, integration and review sections. */
export const AgentOSModuleStudioPageBase = (props: AgentOSModuleStudioPageBaseProps) => {
    const { workspaceId, moduleId, labels }: AgentOSModuleStudioPageViewProps = props.props
    const { back }: AgentOSModuleStudioPageActions = props.on
    return (
        <div>
            <Breadcrumbs
                props={{
                    mode: "back",
                    label: labels.path,
                    backLabel: labels.modules,
                }}
                on={{
                    back: back,
                }}
            />
            <div>
                <div>
                    <TileIcon
                        props={{
                            icon: "agentos",
                            signal: "attention",
                        }}
                    />
                    <div>
                        <Text size="sm" tone="accent" weight="semibold">
                            {labels.eyebrow}
                        </Text>
                        <Heading level={1} scale="display">
                            {labels.title}
                        </Heading>
                        <Text size="md" tone="muted">
                            {labels.description}
                        </Text>
                    </div>
                </div>
            </div>

            <Heading level={2}>{labels.sections}</Heading>
            <>
                <div>
                    {
                        <div>
                            {[
                                <AgentOSModuleInterview key="item-0" workspaceId={workspaceId} moduleId={moduleId} />,
                                <AgentOSModuleSpecification
                                    key="item-1"
                                    workspaceId={workspaceId}
                                    moduleId={moduleId}
                                />,
                            ]}
                        </div>
                    }
                    {
                        <div>
                            {[
                                <AgentOSModuleProfile key="item-0" workspaceId={workspaceId} moduleId={moduleId} />,
                                <AgentOSModuleAttachments
                                    key="item-1"
                                    scope="studio"
                                    workspaceId={workspaceId}
                                    moduleId={moduleId}
                                />,
                            ]}
                        </div>
                    }
                </div>
            </>
        </div>
    )
}
