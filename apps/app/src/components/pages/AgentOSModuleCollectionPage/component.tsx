import { Breadcrumbs, TileIcon } from "@nivo/ui";
import { Badge, Button, PageContainer, SectionHeader, Text } from "@starci/grammar/common";
import { AgentOSShellAccessNotice, AgentOSShellRegions, type AgentOSShellView, type AgentOSShellViewLabels } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter/component";
import {
  MODULE_COLLECTION_GRID_CLASS_NAME,
  MODULE_COLLECTION_INTRO_CLASS_NAME,
  MODULE_COLLECTION_PAGE_CLASS_NAME,
  MODULE_COLLECTION_SOURCE_TIME_CLASS_NAME
} from "./classNames";

/** Public API role for AgentOSModuleCollectionPageProps. */
export type AgentOSModuleCollectionPageProps = AgentOSModuleCollectionPageViewProps;
type AgentOSModuleCollectionPageViewProps = {
  readonly workspaceId: string;
  readonly shell: AgentOSShellView;
  readonly shellLabels: AgentOSShellViewLabels;
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
  readonly shellRetrying?: boolean;
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
    shellRetrying
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
            ? <AgentOSShellAccessNotice state={shell.state} labels={shellLabels} onRetry={onRetryShell} retrying={shellRetrying}/>
            : <AgentOSShellRegions view={shell} labels={shellLabels} formatDate={formatDate} onRetry={onRetryShell} retrying={shellRetrying}/>}
        </section>
      </div>
    </PageContainer>
  );
};