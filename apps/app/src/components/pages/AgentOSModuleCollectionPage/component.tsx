import { Breadcrumbs, TileIcon } from "@nivo/ui";
import { Badge, Button, EmptyNotice, PageContainer, SectionHeader, StaticStateRow, SurfaceCard, SurfaceListCard, Text, TextAction } from "@starci/grammar/common";
import { AGENT_OS_SIGN_IN_HREF, type AgentOSShellView, type AgentOSWorkspaceControlCenterShellLabels } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter/component";
import {
  MODULE_COLLECTION_GRID_CLASS_NAME,
  MODULE_COLLECTION_INTRO_CLASS_NAME,
  MODULE_COLLECTION_PAGE_CLASS_NAME,
  MODULE_COLLECTION_SOURCE_TIME_CLASS_NAME,
  MODULE_LEDGER_FACETS_CLASS_NAME,
  MODULE_LEDGER_NOTICE_CLASS_NAME
} from "./classNames";

/** Public API role for AgentOSModuleCollectionPageProps. */
export type AgentOSModuleCollectionPageProps = AgentOSModuleCollectionPageViewProps;
type AgentOSModuleCollectionPageViewProps = {
  readonly workspaceId: string;
  readonly shell: AgentOSShellView;
  readonly shellLabels: AgentOSWorkspaceControlCenterShellLabels;
  readonly labels: {
    readonly path: string;
    readonly workspace: string;
    readonly title: string;
    readonly description: string;
    readonly eyebrow: string;
    readonly create: string;
  };
  readonly formatDate: (value: string) => string;
  readonly createHref: string;
  readonly onBack: () => void;
  readonly onRetryShell?: () => void;
  readonly isShellRetrying?: boolean;
};

/** The one sentence a limited facet owes its reader, chosen by that source's own standing. */
const ledgerLimitOf = (standing: AgentOSShellView["inventoryStanding"], labels: AgentOSWorkspaceControlCenterShellLabels): string => {
  if (standing === "stale") return labels.inventoryLimitStale;
  if (standing === "unavailable") return labels.inventoryLimitUnavailable;
  if (standing === "unsupported") return labels.inventoryLimitUnsupported;
  if (standing === "refused") return labels.inventoryLimitRefused;
  if (standing === "loading" || standing === "unresolved") return labels.inventoryLimitLoading;
  return labels.inventoryLimitPartial;
};

/** The runtime facet's own value: what the runtime source said, never what a neighbour implied. */
const ledgerRuntimeValueOf = (shell: AgentOSShellView, labels: AgentOSWorkspaceControlCenterShellLabels): string => {
  if (shell.runtimeStanding === "unsupported" || shell.runtimeStanding === "refused") return ledgerLimitOf(shell.runtimeStanding, labels);
  if (shell.runtimeAvailability === "provisioned") return labels.runtimeProvisioned;
  if (shell.runtimeAvailability === "not_provisioned") return labels.runtimeNotProvisioned;
  if (shell.runtimeAvailability === "unavailable") return labels.runtimeUnavailable;
  return labels.runtimeUnknown;
};

/** One source-qualified fact of the ledger: the label names its source, the value is its answer. */
type ModuleLedgerFacetProps = {
  readonly label: string;
  readonly value: string;
  readonly fact?: string;
};
const ModuleLedgerFacet = (props: ModuleLedgerFacetProps) => <SurfaceCard label={props.label} {...(props.fact === undefined ? {} : { fact: props.fact })}><Text size="md">{props.value}</Text></SurfaceCard>;

/**
 * The ledger's own regions: the actual installation peer list, the permitted empty notice and the
 * separate source-qualified facets. It draws only what the projection settled.
 */
type ModuleLedgerRegionsProps = {
  readonly shell: AgentOSShellView;
  readonly labels: AgentOSWorkspaceControlCenterShellLabels;
  readonly formatDate: (value: string) => string;
  readonly onRetry?: () => void;
  readonly isRetrying?: boolean;
};
const ModuleLedgerRegions = (props: ModuleLedgerRegionsProps) => {
  const { shell, labels, formatDate, onRetry, isRetrying }: ModuleLedgerRegionsProps = props;
  const inventoryFact = shell.inventoryStanding === "current" && shell.inventoryObservedAt !== null ? formatDate(shell.inventoryObservedAt) : undefined;
  return <>
    <SurfaceListCard label={labels.inventorySection} {...(inventoryFact === undefined ? {} : { fact: inventoryFact })}>
      {shell.installations.map(installation => <StaticStateRow key={installation.installationId} item={{
        id: installation.installationId,
        label: installation.displayName,
        description: [installation.moduleKey, installation.status, installation.installationId].filter((part): part is string => part !== null).join(" · ")
      }}/>)}
    </SurfaceListCard>
    {shell.state === "installed-empty" ? <EmptyNotice message={labels.inventoryEmpty} description={labels.inventoryEmptyDescription}/> : null}
    {shell.inventoryStanding !== "current" ? <SurfaceCard label={labels.inventorySection}><Text size="md" tone="muted">{ledgerLimitOf(shell.inventoryStanding, labels)}</Text>{onRetry === undefined ? null : <TextAction onPress={onRetry} isPending={isRetrying === true}>{labels.retry}</TextAction>}</SurfaceCard> : null}
    <div className={MODULE_LEDGER_FACETS_CLASS_NAME}>
      <ModuleLedgerFacet label={labels.runtimeSection} fact={shell.runtimeObservedAt === null ? undefined : formatDate(shell.runtimeObservedAt)} value={ledgerRuntimeValueOf(shell, labels)}/>
      {shell.installations.map(installation => <ModuleLedgerFacet key={"configuration-" + installation.installationId} label={labels.configurationSection + " · " + installation.displayName} fact={installation.configuration === null || installation.configuration.observedAt === null ? undefined : formatDate(installation.configuration.observedAt)} value={installation.configuration === null ? labels.configurationUnsupported : installation.configuration.standing === "current" ? labels.configurationCurrent.replace("{desired}", installation.configuration.desiredDigest ?? "-").replace("{tested}", installation.configuration.testedDigest ?? "-").replace("{applied}", installation.configuration.appliedDigest ?? "-") : installation.configuration.standing === "unsupported" ? labels.configurationUnsupported : labels.configurationAbsent}/>)}
      <ModuleLedgerFacet label={labels.attentionSection} fact={shell.attentionObservedAt === null ? undefined : formatDate(shell.attentionObservedAt)} value={shell.attentionStanding === "unsupported" || shell.attentionStanding === "unresolved" ? labels.attentionUnsupported : ledgerLimitOf(shell.attentionStanding, labels)}/>
      <ModuleLedgerFacet label={labels.resultSection} value={labels.resultUnavailable}/>
    </div>
  </>;
};

/** One settled access state: a retryable verification failure, a refusal, or a sign-in affordance that discloses no scope. */
type ModuleLedgerAccessNoticeProps = {
  readonly state: AgentOSShellView["state"];
  readonly labels: AgentOSWorkspaceControlCenterShellLabels;
  readonly onRetry?: () => void;
  readonly isRetrying?: boolean;
};
const ModuleLedgerAccessNotice = (props: ModuleLedgerAccessNoticeProps) => {
  const { state, labels, onRetry, isRetrying }: ModuleLedgerAccessNoticeProps = props;
  if (state === "sign-in-required") return <div className={MODULE_LEDGER_NOTICE_CLASS_NAME}><Text size="md" tone="muted">{labels.signInRequired}</Text><TextAction href={AGENT_OS_SIGN_IN_HREF}>{labels.signInAction}</TextAction></div>;
  return <EmptyNotice message={state === "access-denied" ? labels.accessDenied : labels.accessUnverified} actionLabel={onRetry === undefined ? undefined : labels.retry} isActionPending={isRetrying === true} onAction={onRetry}/>;
};

/**
 * Compose the module ledger under one route identity: orientation, the one creation door, then the
 * connected shell's own regions as one column. The shell already owns the main landmark, so the page
 * body is a plain column rather than a second `main` - and a sign-in-required or refused access state
 * replaces the ledger instead of qualifying it, so no installation is ever hinted at without access.
 */
export const AgentOSModuleCollectionPageBase = (props: AgentOSModuleCollectionPageProps) => {
  const {
    shell,
    shellLabels,
    labels,
    formatDate,
    createHref,
    onBack,
    onRetryShell,
    isShellRetrying
  }: AgentOSModuleCollectionPageViewProps = props;
  const accessState = shell.state === "sign-in-required" || shell.state === "access-unverified" || shell.state === "access-denied";
  const title = accessState ? labels.title : shell.name ?? labels.title;
  const sourceTime = shell.identityObservedAt === null || accessState ? null : (
    <div className={MODULE_COLLECTION_SOURCE_TIME_CLASS_NAME} data-region="module-source-time" data-contract="GAP-6">
      <Badge tone="neutral">{shellLabels.sourceTime}</Badge>
      <Text size="sm" tone="muted">{formatDate(shell.identityObservedAt)}{shell.instanceId === null ? "" : " · " + shellLabels.identityInstance + " " + shell.instanceId}</Text>
    </div>
  );
  return (
    <PageContainer measure="product">
      <div className={MODULE_COLLECTION_PAGE_CLASS_NAME} data-region="page" data-contract="GAP-5">
        <Breadcrumbs
          props={{
            mode: "trail",
            label: labels.path,
            steps: [
              {
                id: "workspace",
                label: labels.workspace,
              },
              {
                id: "modules",
                label: labels.title,
                isCurrent: true,
              },
            ],
          }}
          on={{
            activate: onBack,
          }}
        />
        <div className={MODULE_COLLECTION_INTRO_CLASS_NAME} data-region="module-intro" data-contract="GAP-3">
          <TileIcon
            props={{
              icon: "agentos",
              signal: "active",
            }}
          />
          <SectionHeader
            composition="context-intro"
            level={1}
            eyebrow={labels.eyebrow}
            title={title}
            description={labels.description}
            action={<Button size="lg" variant="primary" href={createHref}>{labels.create}</Button>}
          />
        </div>
        {sourceTime}
        <section
          className={MODULE_COLLECTION_GRID_CLASS_NAME}
          aria-label={labels.title}
          data-region="module-collection"
          data-contract="GAP-4"
        >
          {accessState
            ? <ModuleLedgerAccessNotice state={shell.state} labels={shellLabels} onRetry={onRetryShell} isRetrying={isShellRetrying}/>
            : <ModuleLedgerRegions shell={shell} labels={shellLabels} formatDate={formatDate} onRetry={onRetryShell} isRetrying={isShellRetrying}/>}
        </section>
      </div>
    </PageContainer>
  );
};