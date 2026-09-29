import { RouteTabs } from "@nivo/ui"
import { ChatbotWorkbenchBlock } from "../ChatbotWorkbenchBlock"
import { DEFAULT_WIDGET_REGISTRY, ExecuteChatBlock } from "../ExecuteChatBlock"
import { ExecuteSessionRailBlock } from "../ExecuteSessionRailBlock"
import { DEFAULT_WORKBENCH_REGISTRY, KindWorkbenchBlock } from "../KindWorkbenchBlock"
import type { OperateSurfaceProps as OperateSurfaceDataProps } from "../../../../modules/agentos/module-page/surface-types"
import type { WithModulePageCopy } from "../../../../modules/agentos/module-page-copy"

type OperateSurfaceProps = WithModulePageCopy<OperateSurfaceDataProps>

const chatPane = (props: OperateSurfaceProps) => (
    <div>
        <ExecuteChatBlock
            copy={props.copy}
            sessionTitle={props.selectedSessionTitle}
            messages={props.messages}
            pending={props.pending}
            refused={props.refused}
            registry={DEFAULT_WIDGET_REGISTRY}
            onSend={props.onSend}
            onWidgetAction={props.onWidgetAction}
        />
    </div>
)

const workbenchPane = (props: OperateSurfaceProps) => (
    <div>
        <KindWorkbenchBlock
            copy={props.copy}
            moduleId={props.installationId}
            kindKey={props.kindKey}
            workbenchKey={props.workbenchKey}
            workbenchVersion={props.workbenchVersion}
            tasks={props.tasks}
            events={props.events}
            registry={DEFAULT_WORKBENCH_REGISTRY}
        />
    </div>
)

/** Live chat or operation workbench for the active module installation. */
export const OperateSurface = (props: OperateSurfaceProps) => {
    const { copy } = props
    if (props.isChatbot)
        return (
            <ChatbotWorkbenchBlock
                installationId={props.installationId}
                workbench={props.chatbotWorkbench}
                selectedConversationId={props.supportInbox.selectedConversationId}
                pending={props.supportInbox.pending}
                refusedCode={props.chatbotRefusedCode}
                copy={copy.chatbot}
                onSelectConversation={props.onSelectSupportConversation}
                onConnectZalo={props.onConnectChatbotZalo}
                onSetHandoff={props.onSetChatbotHandoff}
                onResolveHandoff={props.onResolveChatbotHandoff}
                onReconcile={props.onReconcileChatbotDelivery}
            />
        )
    return (
        <div>
            <div>
                <RouteTabs
                    props={{
                        label: copy.operate.view,
                        selectedKey: props.operationTarget,
                        tabs: [
                            {
                                id: "internal-chat",
                                label: copy.operate.chat,
                            },
                            {
                                id: "internal-workbench",
                                label: copy.operate.workbench,
                            },
                        ],
                    }}
                    on={{
                        select: (key) => props.onSelectTarget(key as OperateSurfaceProps["operationTarget"]),
                    }}
                />
            </div>
            <ExecuteSessionRailBlock
                copy={props.copy}
                sessions={props.sessions}
                selectedId={props.selectedSessionId}
                pending={props.pending}
                onSelect={props.onSelectSession}
                onCreate={props.onCreateSession}
            />
            {chatPane(props)}
            {workbenchPane(props)}
        </div>
    )
}
