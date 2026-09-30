import type { AgentWorkspaceControlCenterFieldsFragment } from "@/modules/api/__generated__/core"

import type { AgentOSWorkspaceControlCenterLabels } from "@/modules/agentos/workspace-control-center/labels"
import type { AgentOSWorkspacePageState, AgentOSWorkspaceControlCenterStatus } from "@/modules/agentos/workspace-control-center/contracts"
import type { AgentOSShellConfigurationDigests, AgentOSShellView, AgentOSShellViewStatus, AgentOSWorkspaceControlCenterShellLabels } from "@/modules/agentos/workspace-control-center/shell-types"
import { AgentOSWorkspaceApplicationsPane } from "@/components/blocks/agentos/AgentOSWorkspaceApplicationsPane"
import { AgentOSWorkspaceAiKnowledgePane } from "@/components/blocks/agentos/AgentOSWorkspaceAiKnowledgePane"
import { AgentOSWorkspaceControlCenterHeader } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenterHeader"
import { AgentOSWorkspaceModuleList } from "@/components/blocks/agentos/AgentOSWorkspaceModuleList"
import { AgentOSWorkspaceRuntimeSummary } from "@/components/blocks/agentos/AgentOSWorkspaceRuntimeSummary"
import { AgentOSWorkspaceShell } from "@/components/blocks/agentos/AgentOSWorkspaceShell"
import { AgentOSWorkspaceOperations } from "@/components/blocks/operations/AgentOSWorkspaceOperations"

import { CONTENT_CLASS_NAME, SECTIONS_CLASS_NAME, SHELL_NOTICE_CLASS_NAME } from "./classNames"
import { EmptyNotice, PageContainer, SurfaceCard, Text, TextAction } from "@starci/grammar/common"

/** The sign-in address the product already publishes (ConsoleLayout and SessionEndingDialog agree). */

export const AGENT_OS_SIGN_IN_HREF = "/authentication"
export type { AgentOSWorkspaceControlCenterLabels } from "@/modules/agentos/workspace-control-center/labels"
export type { AgentOSWorkspacePageState, AgentOSWorkspaceControlCenterStatus } from "@/modules/agentos/workspace-control-center/contracts"

/** One settled access state: a retryable verification failure, a refusal, or a sign-in affordance. */
type AgentOSShellAccessNoticeProps = {
    readonly state: AgentOSShellViewStatus
    readonly labels: AgentOSWorkspaceControlCenterShellLabels
    readonly onRetry?: () => void
    readonly retrying?: boolean
}
const AgentOSShellAccessNotice = (props: AgentOSShellAccessNoticeProps) => {
    const { state, labels, onRetry, retrying } = props
    if (state === "sign-in-required")
        return (
            <div className={SHELL_NOTICE_CLASS_NAME}>
                <Text size="md" tone="muted">
                    {labels.signInRequired}
                </Text>
                <TextAction href={AGENT_OS_SIGN_IN_HREF}>{labels.signInAction}</TextAction>
            </div>
        )
    return (
        <EmptyNotice
            message={state === "access-denied" ? labels.accessDenied : labels.accessUnverified}
            actionLabel={onRetry === undefined ? undefined : labels.retry}
            isActionPending={retrying === true}
            onAction={onRetry}
        />
    )
}

/** Pure workspace drawing contract: one page shape, settled data and explicit owner actions. */
export type AgentOSWorkspaceControlCenterProps = {
    readonly state: AgentOSWorkspacePageState
    readonly props: {
        readonly workspaceId?: string
        readonly controlCenterState: AgentOSWorkspaceControlCenterStatus
        readonly message?: string
        readonly data?: AgentWorkspaceControlCenterFieldsFragment
        readonly shell: AgentOSShellView
        readonly labels: AgentOSWorkspaceControlCenterLabels
        readonly retryPending?: boolean
        readonly isShellRetrying?: boolean
        readonly openClawLaunchHref: string
        readonly launchState: "idle" | "opening" | "connected" | "blocked" | "expired" | "disconnected"
    }
    readonly on: {
        readonly onSelectPageState: (pageState: AgentOSWorkspacePageState) => void
        readonly onOpenAgentConsole: () => void
        readonly onRetry?: () => void
        readonly onRetryShell?: () => void
        readonly onRetryOperation?: (installationId: string, intentId: string) => void
        readonly formatDate: (value: string) => string
        readonly formatConfiguration: (digests: AgentOSShellConfigurationDigests) => string
    }
}

/** Settled view state consumed by the pure workspace page. */
export type AgentOSWorkspaceControlCenterViewProps = {
    readonly workspaceId?: string
    readonly pageState: AgentOSWorkspacePageState
    readonly controlCenterState: AgentOSWorkspaceControlCenterStatus
    readonly message?: string
    readonly data?: AgentWorkspaceControlCenterFieldsFragment
    readonly shell: AgentOSShellView
    readonly labels: AgentOSWorkspaceControlCenterLabels
    readonly onSelectPageState: (pageState: AgentOSWorkspacePageState) => void
    readonly onOpenAgentConsole: () => void
    readonly onRetry?: () => void
    readonly onRetryShell?: () => void
    readonly onRetryOperation?: (installationId: string, intentId: string) => void
    readonly retryPending?: boolean
    readonly isShellRetrying?: boolean
    readonly openClawLaunchHref: string
    readonly launchState: "idle" | "opening" | "connected" | "blocked" | "expired" | "disconnected"
    readonly formatDate: (value: string) => string
    readonly formatConfiguration: (digests: AgentOSShellConfigurationDigests) => string
}

/** Compose the workspace page from its pure region blocks. */
export const AgentOSWorkspaceControlCenterBase = (props: AgentOSWorkspaceControlCenterProps) => {
    const pageState = props.state
    const {
        workspaceId,
        controlCenterState,
        message,
        data,
        shell,
        labels,
        launchState,
        openClawLaunchHref,
        retryPending,
        isShellRetrying,
    } = props.props
    const { onSelectPageState, onOpenAgentConsole, onRetry, onRetryShell, onRetryOperation, formatDate, formatConfiguration } =
        props.on
    const accessState =
        shell.state === "sign-in-required" || shell.state === "access-unverified" || shell.state === "access-denied"
    const title = accessState
        ? labels.titleFallback
        : shell.state === "loading"
          ? (workspaceId ?? labels.titleFallback)
          : (shell.name ?? shell.workspaceId ?? workspaceId ?? labels.titleFallback)
    const pageCopy = {
        eyebrow: labels.eyebrow ?? labels.titleFallback,
        description: labels.description ?? labels.accessUnavailable,
        stateSection: labels.stateSection ?? labels.titleFallback,
        loadingTitle: labels.loadingTitle ?? labels.loading,
        refusedTitle: labels.refusedTitle ?? labels.titleFallback,
        retry: labels.retry ?? "Retry",
    }
    const sourceTime =
        shell.identityObservedAt === null || accessState
            ? undefined
            : {
                  label: labels.shell.sourceTime,
                  value:
                      formatDate(shell.identityObservedAt) +
                      (shell.instanceId === null ? "" : " · " + labels.shell.identityInstance + " " + shell.instanceId),
              }
    const header = (
        <AgentOSWorkspaceControlCenterHeader
            eyebrow={pageCopy.eyebrow}
            title={title}
            description={pageCopy.description}
            sourceTime={sourceTime}
            {...(accessState
                ? {}
                : {
                      tabsLabel: labels.tabsLabel,
                      pageState,
                      tabs: labels.tabs,
                      onSelectPageState,
                  })}
        />
    )
    if (accessState)
        return (
            <PageContainer measure="product">
                <div className={CONTENT_CLASS_NAME} data-contract="GAP-2">
                    {header}
                    <AgentOSShellAccessNotice
                        state={shell.state}
                        labels={labels.shell}
                        onRetry={onRetryShell}
                        retrying={isShellRetrying}
                    />
                </div>
            </PageContainer>
        )
    const sectionsOf = () => {
        if (controlCenterState !== "ready" || data === undefined) {
            const isRefused = controlCenterState === "refused"
            return [
                isRefused ? (
                    <EmptyNotice
                        key="state"
                        message={message ?? pageCopy.refusedTitle}
                        actionLabel={pageCopy.retry}
                        onAction={onRetry}
                        isActionPending={retryPending}
                    />
                ) : (
                    <SurfaceCard key="state" label={pageCopy.stateSection}>
                        <Text live="polite">{pageCopy.loadingTitle}</Text>
                    </SurfaceCard>
                ),
            ]
        }
        if (pageState === "applications")
            return [
                <AgentOSWorkspaceApplicationsPane
                    key="item-0"
                    data={data}
                    labels={labels.applications}
                    launchState={launchState}
                    openClawLaunchHref={openClawLaunchHref}
                    onManageOpenClaw={onOpenAgentConsole}
                />,
            ]
        if (pageState === "solutions")
            return [<AgentOSWorkspaceModuleList key="item-0" workspaceId={data.workspace.id} />]
        if (pageState === "ai-knowledge")
            return [<AgentOSWorkspaceAiKnowledgePane key="item-0" workspaceId={data.workspace.id} />]
        if (pageState === "access") return [<EmptyNotice key="item-0" message={labels.accessUnavailable} />]
        if (pageState === "infrastructure")
            return [
                <AgentOSWorkspaceRuntimeSummary
                    key="infrastructure"
                    view="runtime"
                    data={data}
                    labels={{ runtime: labels.runtime, stack: labels.stack }}
                    formatDate={formatDate}
                />,
            ]
        return [<AgentOSWorkspaceOperations key="item-0" labels={labels.operations} />]
    }
    const overview = [
        <AgentOSWorkspaceShell
            key="shell"
            view={shell}
            labels={labels.shell}
            formatDate={formatDate}
            formatConfiguration={formatConfiguration}
            onRetry={onRetryShell}
            onRecheckOperation={onRetryOperation}
            retrying={isShellRetrying}
        />,
        data === undefined ? null : (
            <AgentOSWorkspaceRuntimeSummary key="summary" view="summary" data={data} labels={labels.summary} />
        ),
        data === undefined ? null : <AgentOSWorkspaceModuleList key="solutions" workspaceId={data.workspace.id} />,
    ]
    const sections = pageState === "overview" ? overview : sectionsOf()
    return (
        <PageContainer measure="product">
            <div className={CONTENT_CLASS_NAME} data-contract="GAP-2">
                {header}
                <section
                    role="tabpanel"
                    id={"workspace-panel-" + pageState}
                    aria-label={labels.tabs.find((tab) => tab.id === pageState)?.label}
                >
                    <div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
                        {sections}
                    </div>
                </section>
            </div>
        </PageContainer>
    )
}
