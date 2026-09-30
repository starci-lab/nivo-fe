import { Button, PageContainer, SectionHeader, Text } from "@starci/grammar/common"
import { AgentOSWorkspaceList } from "@/components/blocks/agentos/AgentOSWorkspaceList"

/** Keep the resolved section grouping. */
const SECTIONS_CLASS_NAME = "flex min-w-0 flex-col gap-6"

/** Every sentence and destination the workspaces page renders, resolved by its connected index. */
type AgentOSWorkspacesPageBaseData = {
    readonly title: string
    readonly description: string
    readonly createLabel: string
    readonly createHref: string
}

/** Props for {@link AgentOSWorkspacesPageBase}: resolved data only, no actions cross in. */
type AgentOSWorkspacesPageBaseProps = {
    readonly props: AgentOSWorkspacesPageBaseData
}

/** The workspaces list and the new-workspace purchase entry, drawn with no world reads of its own. */
export const AgentOSWorkspacesPageBase = ({ props }: AgentOSWorkspacesPageBaseProps) => (
    <PageContainer measure="product">
        <div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
            <SectionHeader
                level={1}
                title={props.title}
                description={
                    <Text size="md" tone="muted">
                        {props.description}
                    </Text>
                }
                action={
                    <Button variant="primary" size="lg" href={props.createHref}>
                        {props.createLabel}
                    </Button>
                }
            />
            <AgentOSWorkspaceList />
        </div>
    </PageContainer>
)
