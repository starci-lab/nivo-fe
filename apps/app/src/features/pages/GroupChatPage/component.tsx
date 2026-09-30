import type { GroupChatPageBaseProps } from "../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_PAGE_CLASS_NAME,
    GROUP_CHAT_WORKSPACE_HOST_DECISION_CLASS_NAME,
    GROUP_CHAT_WORKSPACE_HOST_INVITE_CLASS_NAME,
    GROUP_CHAT_WORKBENCH_CLASS_NAME,
    GROUP_CHAT_TABS_BAND_CLASS_NAME,
    GROUP_CHAT_TABS_BAND_DECISION_CLASS_NAME,
    GROUP_CHAT_TAB_STRIP_CLASS_NAME,
    GROUP_CHAT_HEADER_BAND_CLASS_NAME,
    GROUP_CHAT_HEADER_BAND_COMPACT_CLASS_NAME,
    GROUP_CHAT_HEADER_COMPACT_ROW_CLASS_NAME,
    GROUP_CHAT_HEADER_ACTIONS_CLASS_NAME,
    GROUP_CHAT_DAY_SELECT_CLASS_NAME,
    GROUP_CHAT_WORKSPACE_WRAP_CLASS_NAME,
    GROUP_CHAT_RAIL_ASIDE_DECISION_CLASS_NAME,
    GROUP_CHAT_RAIL_ASIDE_INVITE_CLASS_NAME,
    GROUP_CHAT_RAIL_SCROLL_CLASS_NAME,
    GROUP_CHAT_CARD_BAND_CLASS_NAME,
    GROUP_CHAT_FORM_STACK_CLASS_NAME,
    GROUP_CHAT_TAB_PANEL_SCROLL_CLASS_NAME,
    GROUP_CHAT_LOADING_CLASS_NAME,
} from "./classNames"
export {
    avatarTintClassName,
    buildConversationItems,
    displayMessageBody,
    initialsOf,
    invalidTasksFilter,
    mayPresentDecision,
    mayPresentInvite,
    parseAddressedModule,
    parseRoleHint,
    partitionParticipants,
    shortTaskRef,
    taskStatusTone,
} from "../../../modules/collab/group-chat/model"
export type {
    ConversationBuildArgs,
    ConversationItem,
    GroupChatTab,
    ParticipantPartition,
    SettledApprovalMap,
} from "../../../modules/collab/group-chat/model"
export type {
    GroupChatPageActions,
    GroupChatPageBaseChrome,
    GroupChatPageBaseData,
    GroupChatPageBaseProps,
    GroupChatPageLabels,
    GroupChatPageView,
} from "../../../modules/collab/group-chat/types"

import {
    Button,
    ChatWorkspace,
    EmptyNotice,
    PageContainer,
    SectionHeader,
    SurfaceCard,
    Tabs,
    Text,
} from "@starci/grammar/common"
import { type ReactNode } from "react"
import { mayPresentInvite } from "../../../modules/collab/group-chat/model"
import { AcceptanceSurface } from "../../../components/blocks/collab/AcceptanceSurface"
import { TasksPanel } from "../../../components/blocks/collab/TasksPanel"
import { Conversation } from "../../../components/blocks/collab/Conversation"
import { Composer } from "../../../components/blocks/collab/Composer"
import { MemberSheet } from "../../../components/blocks/collab/MemberSheet"
import { MemberRailToggle } from "../../../components/blocks/collab/MemberRailToggle"
import { RosterRail } from "../../../components/blocks/collab/RosterRail"
import { MembersRail } from "../../../components/blocks/collab/MembersRail"

/** Render the connected Office/Tasks surface for the current workspace. */
export const GroupChatPageBase = (props: GroupChatPageBaseProps) => {
    const { state, props: data, on }: GroupChatPageBaseProps = props
    const { isRailOpen, labels } = state
    const { view } = data
    const isCompact = state.isCompactMembers === true
    if (view.screen === "acceptance") {
        return (
            <PageContainer measure="reading">
                <SectionHeader level={1} title={labels.title} description={labels.description} />
                <AcceptanceSurface view={view} on={on} labels={labels} />
            </PageContainer>
        )
    }
    if (view.officeState === "denied") {
        return (
            <PageContainer measure="reading">
                <SectionHeader level={1} title={labels.title} description={labels.description} />
                <SurfaceCard label={labels.state.deniedTitle} composition="joined" depth="nested">
                    <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                        <div className={GROUP_CHAT_FORM_STACK_CLASS_NAME}>
                            <Text size="sm">{labels.state.deniedBody}</Text>
                            <div>
                                <Button variant="secondary" onPress={on.leaveOffice}>
                                    {labels.state.backOverview}
                                </Button>
                            </div>
                        </div>
                    </div>
                </SurfaceCard>
            </PageContainer>
        )
    }
    if (view.officeState === "failed") {
        return (
            <PageContainer measure="reading">
                <SectionHeader level={1} title={labels.title} description={labels.description} />
                <EmptyNotice
                    message={labels.state.readFailedTitle}
                    actionLabel={labels.state.retry}
                    onAction={on.retryOffice}
                />
            </PageContainer>
        )
    }
    const decisionPending = view.items.some((item): boolean => item.kind === "approval-card")
    const participantCount = view.participants.length
    const railOpenLabel = labels.members.openRail(participantCount)

    const memberChip =
        isCompact && view.officeState === "ready" ? (
            <MemberRailToggle
                expanded={isRailOpen}
                label={railOpenLabel}
                onClick={() => on.changeRailOpen(!isRailOpen)}
            />
        ) : null

    const showHeaderBand = !decisionPending && view.officeState === "ready" && view.workspaceName !== null
    let headerBand: ReactNode = null
    if (showHeaderBand && isCompact) {
        headerBand = (
            <div className={GROUP_CHAT_HEADER_BAND_COMPACT_CLASS_NAME}>
                <div className={GROUP_CHAT_HEADER_COMPACT_ROW_CLASS_NAME}>
                    <Text size="sm" weight="semibold" overflow="truncate">
                        <span>{labels.workspace}</span> <span>{view.workspaceName}</span>
                    </Text>
                    {memberChip}
                </div>
            </div>
        )
    } else if (showHeaderBand) {
        headerBand = (
            <SectionHeader
                level={2}
                title={
                    <>
                        <span>{labels.workspace}</span> <span>{view.workspaceName}</span>
                    </>
                }
                description={labels.description}
                className={GROUP_CHAT_HEADER_BAND_CLASS_NAME}
                action={
                    <div className={GROUP_CHAT_HEADER_ACTIONS_CLASS_NAME}>
                        <select
                            className={GROUP_CHAT_DAY_SELECT_CLASS_NAME}
                            aria-label={labels.today}
                            defaultValue="today"
                        >
                            <option value="today">{labels.today}</option>
                        </select>
                    </div>
                }
            />
        )
    }

    const body =
        view.officeState === "loading" ? (
            <div className={GROUP_CHAT_LOADING_CLASS_NAME} aria-busy="true">
                <Text size="sm" tone="muted" live="polite">
                    {labels.state.loading}
                </Text>
            </div>
        ) : view.tab === "tasks" ? (
            <div className={GROUP_CHAT_TAB_PANEL_SCROLL_CLASS_NAME}>
                <TasksPanel view={view} on={on} labels={labels} />
            </div>
        ) : (
            <>
                <div className={GROUP_CHAT_WORKSPACE_WRAP_CLASS_NAME}>
                    <ChatWorkspace
                        label={labels.title}
                        conversationLabel={labels.conversation.label}
                        conversation={
                            <Conversation
                                view={view}
                                on={on}
                                labels={labels}
                                compact={isCompact}
                                decision={decisionPending}
                            />
                        }
                        composer={
                            <Composer
                                view={view}
                                on={on}
                                labels={labels}
                                decision={decisionPending}
                                compact={isCompact}
                            />
                        }
                    />
                </div>
                {isCompact && isRailOpen ? (
                    <MemberSheet
                        view={view}
                        on={on}
                        labels={labels}
                        showInvite={mayPresentInvite(view.viewer) && !decisionPending}
                    />
                ) : null}
            </>
        )

    return (
        <PageContainer measure="full">
            <div className={GROUP_CHAT_PAGE_CLASS_NAME}>
                <div
                    className={
                        decisionPending
                            ? GROUP_CHAT_WORKSPACE_HOST_DECISION_CLASS_NAME
                            : GROUP_CHAT_WORKSPACE_HOST_INVITE_CLASS_NAME
                    }
                >
                    <div className={GROUP_CHAT_WORKBENCH_CLASS_NAME}>
                        <div
                            className={
                                decisionPending
                                    ? GROUP_CHAT_TABS_BAND_DECISION_CLASS_NAME
                                    : GROUP_CHAT_TABS_BAND_CLASS_NAME
                            }
                        >
                            <div className={GROUP_CHAT_TAB_STRIP_CLASS_NAME}>
                                <Tabs
                                    label={labels.tabListLabel}
                                    selectedKey={view.tab}
                                    items={[
                                        { id: "office", label: labels.tabs.office },
                                        { id: "tasks", label: labels.tabs.tasks },
                                    ]}
                                    onSelect={(key) => on.selectTab(key === "tasks" ? "tasks" : "office")}
                                    inset="none"
                                    labelVisibility="always"
                                />
                            </div>
                            {!showHeaderBand ? memberChip : null}
                        </div>
                        {headerBand}
                        {body}
                    </div>
                    {!isCompact ? (
                        <aside
                            className={
                                decisionPending
                                    ? GROUP_CHAT_RAIL_ASIDE_DECISION_CLASS_NAME
                                    : GROUP_CHAT_RAIL_ASIDE_INVITE_CLASS_NAME
                            }
                            aria-label={labels.members.title}
                        >
                            <div className={GROUP_CHAT_RAIL_SCROLL_CLASS_NAME}>
                                {decisionPending ? (
                                    <RosterRail view={view} labels={labels} />
                                ) : (
                                    <MembersRail view={view} on={on} labels={labels} />
                                )}
                            </div>
                        </aside>
                    ) : null}
                </div>
            </div>
        </PageContainer>
    )
}
