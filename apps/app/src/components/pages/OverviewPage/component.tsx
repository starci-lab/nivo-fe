import { Breadcrumbs } from "@nivo/ui";
import {
  Button,
  PageContainer,
  PrimaryRailLayout,
  SectionHeader
} from "@starci/grammar/core";
import { AgentOSSummary } from "@/components/blocks/console/AgentOSSummary";
import type { AgentOSSummaryProps } from "@/components/blocks/console/AgentOSSummary/component";
import { AgentOSSummaryBase } from "@/components/blocks/console/AgentOSSummary/component";
import { AppsSummary } from "@/components/blocks/console/AppsSummary";
import type { AppsSummaryProps } from "@/components/blocks/console/AppsSummary/component";
import { AppsSummaryBase } from "@/components/blocks/console/AppsSummary/component";
import { InfrastructureSummary } from "@/components/blocks/console/InfrastructureSummary";
import type { InfrastructureSummaryProps } from "@/components/blocks/console/InfrastructureSummary/component";
import { InfrastructureSummaryBase } from "@/components/blocks/console/InfrastructureSummary/component";
import { OverviewPulse } from "@/components/blocks/console/OverviewPulse";
import type { OverviewPulseProps } from "@/components/blocks/console/OverviewPulse/component";
import { OverviewPulseBase } from "@/components/blocks/console/OverviewPulse/component";
import { WalletSummary } from "@/components/blocks/console/WalletSummary";
import type { WalletSummaryProps } from "@/components/blocks/console/WalletSummary/component";
import { WalletSummaryBase } from "@/components/blocks/console/WalletSummary/component";
import type { FleetStatus } from "@/components/blocks/provisioning/FleetRow";
import {
  OVERVIEW_HEADER_CLASS_NAME,
  OVERVIEW_PAGE_CLASS_NAME,
  OVERVIEW_SECTION_CLASS_NAME
} from "./classNames";

/** Legacy app-section view retained for existing pure-page consumers during this revision. */
export type OverviewPageProps = OverviewPageViewProps;
/** Public API role for AppsSectionView. */
export type AppsSectionView = {
  readonly phase: "resting";
  readonly label: string;
  readonly openSetLabel: string;
} | {
  readonly phase: "empty";
  readonly label: string;
  readonly fact: string;
  readonly offers: ReadonlyArray<unknown>;
} | {
  readonly phase: "answered";
  readonly label: string;
  readonly openSetLabel: string;
  readonly rows: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly detail: string;
    readonly kindLabel?: string;
    readonly status: FleetStatus;
    readonly statusLabel: string;
    readonly actionLabel: string;
  }>;
} | {
  readonly phase: "refused";
  readonly label: string;
  readonly note: string;
};

/** Legacy AgentOS view retained for existing pure-page consumers. */
export type AgentOsSectionView = {
  readonly phase: "resting";
  readonly label: string;
  readonly openLabel: string;
} | {
  readonly phase: "empty";
  readonly label: string;
  readonly plansLabel: string;
  readonly message: string;
} | {
  readonly phase: "answered";
  readonly label: string;
  readonly openLabel: string;
  readonly rows: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly status: FleetStatus;
    readonly statusLabel: string;
  }>;
} | {
  readonly phase: "refused";
  readonly label: string;
  readonly openLabel: string;
  readonly note: string;
  readonly rows: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly status: FleetStatus;
    readonly statusLabel: string;
  }>;
};

/** Legacy domains view retained for existing pure-page consumers. */
export type DomainsSectionView = {
  readonly phase: "resting";
  readonly label: string;
} | {
  readonly phase: "empty" | "refused";
  readonly label: string;
  readonly note: string;
} | {
  readonly phase: "answered";
  readonly label: string;
  readonly facts: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly value: string;
  }>;
};

/** Legacy wallet view retained for existing pure-page consumers. */
export type WalletSectionView = {
  readonly phase: "resting";
  readonly label: string;
  readonly actionLabel: string;
} | {
  readonly phase: "empty" | "answered";
  readonly label: string;
  readonly actionLabel: string;
  readonly facts: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly value: string;
  }>;
} | {
  readonly phase: "refused";
  readonly label: string;
  readonly note: string;
};
type AcceptedOverviewPageViewProps = {
  readonly title: string;
  readonly lede?: string;
  readonly buildAppLabel?: string;
  readonly atAGlanceLabel?: string;
  readonly servicesLabel?: string;
  readonly accountLabel?: string;
  readonly pulse?: OverviewPulseProps;
  readonly apps: AppsSummaryProps;
  readonly agentOs: AgentOSSummaryProps;
  readonly infrastructure: InfrastructureSummaryProps;
  readonly wallet: WalletSummaryProps;
  readonly onBuildApp?: () => void;
};
type ConnectedOverviewPageViewProps = {
  readonly title: string;
  readonly lede: string;
  readonly pathLabel: string;
  readonly consoleLabel: string;
  readonly buildAppLabel: string;
  readonly atAGlanceLabel: string;
  readonly servicesLabel: string;
  readonly accountLabel: string;
  readonly onBuildApp: () => void;
};
type LegacyOverviewPageViewProps = {
  readonly title: string;
  readonly atAGlanceLabel?: string;
  readonly servicesLabel?: string;
  readonly accountLabel?: string;
  readonly apps: AppsSectionView;
  readonly agentOs: AgentOsSectionView;
  readonly servers: {
    readonly label: string;
    readonly note: string;
  };
  readonly domains: DomainsSectionView;
  readonly wallet: WalletSectionView;
  readonly on?: {
    readonly openApps?: () => void;
    readonly openAgentOs?: () => void;
    readonly openWallet?: () => void;
  };
};

/** Fully resolved overview content, including the previous call shape during migration. */
export type OverviewPageViewProps = ConnectedOverviewPageViewProps | AcceptedOverviewPageViewProps | LegacyOverviewPageViewProps;
const legacyTone = (status: FleetStatus) => {
  if (status === "failed") return "danger" as const;
  if (status === "awaiting_dns") return "warning" as const;
  if (status === "ready" || status === "active") return "success" as const;
  return "neutral" as const;
};
const normalizeLegacyApps = (input: LegacyOverviewPageViewProps): AppsSummaryProps => {
  let state: AppsSummaryProps["state"];
  if (input.apps.phase === "resting") state = {
    phase: "pending"
  };else if (input.apps.phase === "refused") state = {
    phase: "forbidden",
    message: input.apps.note
  };else if (input.apps.phase === "empty") state = {
    phase: "empty",
    message: input.apps.fact
  };else {
    state = {
      phase: "populated",
      items: input.apps.rows.map(row => ({
        ...row,
        statusTone: legacyTone(row.status)
      }))
    };
  }
  return {
    label: input.apps.label,
    onOpenApp: () => input.on?.openApps?.(),
    state
  };
};
const normalizeLegacyAgentOs = (input: LegacyOverviewPageViewProps): AgentOSSummaryProps => {
  const agentRows = input.agentOs.phase === "answered" || input.agentOs.phase === "refused" ? input.agentOs.rows : [];
  const row = agentRows[0];
  let state: AgentOSSummaryProps["state"];
  if (input.agentOs.phase === "resting") state = {
    phase: "pending"
  };else if (input.agentOs.phase === "empty") state = {
    phase: "empty",
    message: input.agentOs.message
  };else if (row === undefined) {
    const message = input.agentOs.phase === "refused" ? input.agentOs.note : "";
    state = {
      phase: "empty",
      message
    };
  } else {
    state = {
      phase: input.agentOs.phase === "refused" ? "partial" : "populated",
      workspace: {
        ...row,
        description: "",
        statusTone: legacyTone(row.status),
        actionLabel: input.agentOs.openLabel
      }
    };
  }
  return {
    label: input.agentOs.label,
    onOpenService: () => input.on?.openAgentOs?.(),
    state
  };
};
const normalizeLegacyDomains = (input: LegacyOverviewPageViewProps): InfrastructureSummaryProps["domains"] => {
  if (input.domains.phase === "resting") return {
    phase: "pending"
  };
  if (input.domains.phase === "answered") return {
    phase: "populated",
    facts: input.domains.facts
  };
  if (input.domains.phase === "empty") return {
    phase: "empty",
    note: input.domains.note
  };
  return {
    phase: "failed",
    note: input.domains.note
  };
};
const normalizeLegacyWallet = (input: LegacyOverviewPageViewProps): WalletSummaryProps["state"] => {
  if (input.wallet.phase === "resting") return {
    phase: "pending"
  };
  if (input.wallet.phase === "refused") return {
    phase: "failed",
    note: input.wallet.note
  };
  if (input.wallet.phase === "empty") return {
    phase: "empty",
    facts: input.wallet.facts
  };
  return {
    phase: "populated",
    facts: input.wallet.facts
  };
};
const normalize = (input: OverviewPageViewProps): ConnectedOverviewPageViewProps | AcceptedOverviewPageViewProps => {
  if (!("apps" in input)) return input;
  if ("infrastructure" in input) return input;
  return {
    title: input.title,
    atAGlanceLabel: input.atAGlanceLabel,
    servicesLabel: input.servicesLabel,
    accountLabel: input.accountLabel,
    apps: normalizeLegacyApps(input),
    agentOs: normalizeLegacyAgentOs(input),
    infrastructure: {
      label: input.domains.label,
      context: input.servers.note,
      domains: normalizeLegacyDomains(input)
    },
    wallet: {
      label: input.wallet.label,
      actionLabel: "actionLabel" in input.wallet ? input.wallet.actionLabel : undefined,
      state: normalizeLegacyWallet(input),
      onOpenWallet: input.on?.openWallet
    }
  };
};

/** Draw the accepted dashboard shell from its four independently settled summary blocks. */
export const OverviewPageBase = (props: OverviewPageProps) => {
  const resolved = normalize(props);
  const {
    title,
    lede,
    buildAppLabel,
    atAGlanceLabel,
    servicesLabel,
    accountLabel,
    onBuildApp
  } = resolved;
  const accepted = "apps" in resolved ? resolved : null;
  const hasBuildAction = buildAppLabel !== undefined && onBuildApp !== undefined;
  const hasPulse = accepted === null || accepted.pulse !== undefined;
  const apps = accepted === null ? <AppsSummary /> : <AppsSummaryBase {...accepted.apps} />;
  const agentOs = accepted === null ? <AgentOSSummary /> : <AgentOSSummaryBase {...accepted.agentOs} />;
  const wallet = accepted === null ? <WalletSummary /> : <WalletSummaryBase {...accepted.wallet} />;
  const infrastructure = accepted === null ? <InfrastructureSummary /> : <InfrastructureSummaryBase {...accepted.infrastructure} />;
  return <PageContainer
    measure="product"
    className={OVERVIEW_PAGE_CLASS_NAME}
    data-contract="GAP-5"
  >
    {!("pathLabel" in resolved) ? null : <Breadcrumbs props={{
      mode: "trail",
      label: resolved.pathLabel,
      steps: [{
        id: "console",
        label: resolved.consoleLabel
      }, {
        id: "overview",
        label: resolved.title,
        isCurrent: true
      }]
    }} />}
    <SectionHeader
      className={OVERVIEW_HEADER_CLASS_NAME}
      level={1}
      title={title}
      description={lede}
      action={hasBuildAction ? <Button
        size="lg"
        variant="primary"
        onPress={onBuildApp}
      >{buildAppLabel}</Button> : undefined}
    />
    {!hasPulse ? null : <>
      {atAGlanceLabel === undefined ? null : <SectionHeader level={2} title={atAGlanceLabel} />}
      {accepted === null ? <OverviewPulse /> : <OverviewPulseBase {...accepted.pulse!} />}
    </>}
    <PrimaryRailLayout
      align="start"
      railWidth="standard"
      primary={<section
        className={OVERVIEW_SECTION_CLASS_NAME}
        data-contract="GAP-4 MEASURE-2"
      >
        {servicesLabel === undefined ? null : <SectionHeader level={2} title={servicesLabel} />}
        {apps}
        {agentOs}
      </section>}
      rail={<section
        className={OVERVIEW_SECTION_CLASS_NAME}
        data-contract="GAP-4 MEASURE-2"
      >
        {accountLabel === undefined ? null : <SectionHeader level={2} title={accountLabel} />}
        {wallet}
        {infrastructure}
      </section>}
    />
  </PageContainer>;
};

