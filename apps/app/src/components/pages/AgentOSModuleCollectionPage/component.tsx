import { Breadcrumbs, TileIcon } from "@nivo/ui";
import { Button, PageContainer, SectionHeader } from "@starci/grammar/common";
import { AgentOSCustomModuleCollection } from "@/components/blocks/agentos/AgentOSCustomModuleCollection";
import { AgentOSSolutionModuleCenter } from "@/components/blocks/agentos/AgentOSSolutionModuleCenter";
import {
  MODULE_COLLECTION_GRID_CLASS_NAME,
  MODULE_COLLECTION_INTRO_CLASS_NAME,
  MODULE_COLLECTION_PAGE_CLASS_NAME
} from "./classNames";

/** Public API role for AgentOSModuleCollectionPageProps. */
export type AgentOSModuleCollectionPageProps = AgentOSModuleCollectionPageViewProps;
type AgentOSModuleCollectionPageViewProps = {
  readonly workspaceId: string;
  readonly labels: {
    readonly path: string;
    readonly workspace: string;
    readonly title: string;
    readonly description: string;
    readonly eyebrow: string;
    readonly create: string;
  };
  readonly createHref: string;
  readonly onBack: () => void;
};

/**
 * Compose the module ledger under one route identity: orientation, the one creation door, then the
 * custom, installed and catalogue sections as one column. The shell already owns the main landmark,
 * so the page body is a plain column rather than a second `main`.
 */
export const AgentOSModuleCollectionPageBase = (props: AgentOSModuleCollectionPageProps) => {
  const {
    workspaceId,
    labels,
    createHref,
    onBack
  }: AgentOSModuleCollectionPageViewProps = props;
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
            title={labels.title}
            description={labels.description}
            action={<Button size="lg" variant="primary" href={createHref}>{labels.create}</Button>}
          />
        </div>
        <section
          className={MODULE_COLLECTION_GRID_CLASS_NAME}
          aria-label={labels.title}
          data-region="module-collection"
          data-contract="GAP-4"
        >
          <AgentOSCustomModuleCollection workspaceId={workspaceId} />
          <AgentOSSolutionModuleCenter workspaceId={workspaceId} layout="ledger" />
        </section>
      </div>
    </PageContainer>
  );
};
