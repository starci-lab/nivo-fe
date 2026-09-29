import { SurfaceCard, Button, Heading, Text, Tabs, PrimaryRailLayout, TextAction } from "@starci/grammar/common"
import { ContextVersionBlock } from "../ContextVersionBlock"
import { PrivateSetupChatBlock } from "../PrivateSetupChatBlock"
import { AGENTOS_SETUP_SURFACE_CLASS_NAME, CONTEXT_BAND_CLASS_NAME, CONTEXT_RAISED_BAND_CLASS_NAME } from "./classNames"
import type { SetupSurfaceProps as SetupSurfaceDataProps } from "../../../../modules/agentos/module-page/surface-types"
import type { WithModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import { isSetupCompactPane } from "../../../../modules/agentos/module-page/surface-types.guards"

type SetupSurfaceProps = WithModulePageCopy<SetupSurfaceDataProps>

const setupVersionsPane = (props: SetupSurfaceProps) => {
    const { copy } = props
    return (
        <SurfaceCard ariaLabel={copy.setup.revisions} composition="joined">
            <div className={CONTEXT_RAISED_BAND_CLASS_NAME} data-contract="SURFACE-3 GAP-3 PADDING-4">
                <Heading level={3}>{copy.setup.revisions}</Heading>
                <Text size="sm" tone="muted">
                    {copy.setup.revisionsHint}
                </Text>
            </div>
            <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
                <Tabs
                    label={copy.setup.revisions}
                    selectedKey={props.selectedRevisionId}
                    labelVisibility="always"
                    items={props.revisions.map((r) => ({
                        id: r.id,
                        label: copy.setup.revision({
                            revision: r.revision,
                            status: copy.setup.revisionStatus[r.status],
                        }),
                    }))}
                    onSelect={props.onSelectRevision}
                />
                <Text size="sm">{copy.setup.selectedRevision({ revision: props.selectedRevisionId })}</Text>
                <TextAction onPress={() => props.onSelectPane("conversation")}>{copy.setup.openChat}</TextAction>
                {props.setupStartRefused ? (
                    <Text size="sm" live="assertive">
                        {copy.setup.startRefused}
                    </Text>
                ) : null}
            </div>
            {props.canStartRevision ? (
                <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
                    <Button
                        variant="secondary"
                        isPending={props.setupStartPending}
                        isDisabled={
                            props.setupPeerDisabled ||
                            props.setupSendPending ||
                            props.setupApplyPending ||
                            props.setupStartPending
                        }
                        onPress={props.onStartRevision}
                    >
                        {copy.setup.newChat}
                    </Button>
                </div>
            ) : null}
        </SurfaceCard>
    )
}

const setupConversationPane = (props: SetupSurfaceProps) => (
    <PrivateSetupChatBlock
        copy={props.copy}
        messages={props.messages}
        pending={props.pending}
        ownPending={props.setupSendPending}
        peerDisabled={props.setupPeerDisabled || props.setupApplyPending || props.setupStartPending}
        refused={props.setupSendRefused}
        unconfirmed={props.setupUnconfirmed}
        revisions={props.revisions}
        selectedRevisionId={props.selectedRevisionId}
        canSend={props.canSend}
        canStartRevision={props.canStartRevision}
        showRevisionControls={false}
        draft={props.draftText}
        onDraft={props.onDraft}
        onSelectRevision={props.onSelectRevision}
        onStartRevision={props.onStartRevision}
        onSend={props.onSend}
        onOpenVersions={() => props.onSelectPane("versions")}
    />
)

const setupContextPane = (props: SetupSurfaceProps) => (
    <div>
        {props.sourceAttachmentPanel}
        <ContextVersionBlock
            copy={props.copy}
            activeVersion={props.activeVersion}
            draft={props.draft}
            pending={props.pending}
            ownPending={props.setupApplyPending}
            peerDisabled={props.setupPeerDisabled || props.setupSendPending || props.setupStartPending}
            refused={props.setupApplyRefused ?? false}
            onApply={props.onApply}
            onCreateVersion={props.onCreateVersion}
            onConfirmRequirement={props.onConfirmRequirement}
        />
    </div>
)

const setupSummaryPane = (props: SetupSurfaceProps) => {
    const { copy } = props
    const draft = props.draft
    return (
        <SurfaceCard label={copy.setup.businessContext} composition="joined">
            <div className={CONTEXT_RAISED_BAND_CLASS_NAME} data-contract="SURFACE-3 GAP-3 PADDING-4">
                <Heading level={4}>
                    {draft === null
                        ? copy.setup.noDraft
                        : draft.version === null
                          ? copy.setup.draftRevision({ revision: draft.revision })
                          : copy.setup.contextVersion({ version: draft.version })}
                </Heading>
                <Text size="sm" tone="muted">
                    {draft === null ? copy.setup.noDraft : copy.setup.fromConversation}
                </Text>
            </div>
            <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
                <Text size="sm" weight="semibold">
                    {draft?.summary ?? copy.setup.contextStartsHere}
                </Text>
                <Text size="sm" tone="muted">
                    {draft ? copy.setup.reviewBeforeTest : copy.setup.contextHint}
                </Text>
                <TextAction onPress={() => props.onSelectPane("context")}>{copy.setup.reviewGates}</TextAction>
            </div>
            <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
                <Text size="sm">
                    {copy.setup.activeContext({
                        version: props.activeVersion === null ? copy.setup.notApplied : `v${props.activeVersion}`,
                    })}
                </Text>
                <Text size="sm" tone="muted">
                    {copy.setup.historyUnchanged}
                </Text>
            </div>
        </SurfaceCard>
    )
}

/** One controlled Setup panel for module history, conversation and context review. */
export const SetupSurface = (props: SetupSurfaceProps) => {
    const { copy } = props
    const { compactPane } = props
    return (
        <section className={AGENTOS_SETUP_SURFACE_CLASS_NAME} data-contract="MEASURE-2 GAP-4">
            <Heading level={2}>{copy.setup.title}</Heading>
            <Tabs
                label={copy.setup.views}
                selectedKey={compactPane}
                labelVisibility="always"
                items={[
                    { id: "conversation", label: copy.setup.chat },
                    { id: "context", label: copy.setup.gates },
                    { id: "versions", label: copy.setup.versions },
                ]}
                onSelect={(key) => props.onSelectPane(isSetupCompactPane(key) ? key : compactPane)}
                panelId={(key) => `setup-panel-${key}`}
            />
            {compactPane === "conversation" ? (
                <section id="setup-panel-conversation" role="tabpanel" aria-label={copy.setup.chat}>
                    <PrimaryRailLayout
                        primary={setupConversationPane(props)}
                        rail={setupSummaryPane(props)}
                        railWidth="standard"
                        align="start"
                        collapsedOrder="primary-first"
                    />
                </section>
            ) : compactPane === "context" ? (
                <section id="setup-panel-context" role="tabpanel" aria-label={copy.setup.gates}>
                    {setupContextPane(props)}
                </section>
            ) : (
                <section id="setup-panel-versions" role="tabpanel" aria-label={copy.setup.versions}>
                    {setupVersionsPane(props)}
                </section>
            )}
        </section>
    )
}
