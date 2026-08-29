"use client";

import { Badge, Button, Heading, LifecycleStep, SurfaceCard, Text, TileIcon, type BadgeTone, type LifecycleStepData } from "@nivo/ui";
import { AgentOSKnowledgeOriginList } from "@/components/blocks/agentos/AgentOSKnowledgeOriginList";
import { AgentOSReadinessComponentList } from "@/components/blocks/agentos/AgentOSReadinessComponentList";
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/console";

/** Resolved bilingual copy for the workspace AI and knowledge operating surface. */
export type AgentOSWorkspaceAiKnowledgeProps = AgentOSWorkspaceAiKnowledgeViewProps;
/** Public API role for AgentOSWorkspaceAiKnowledgeLabels. */
export type AgentOSWorkspaceAiKnowledgeLabels = {
  readonly sectionHeading: string;
  readonly title: string;
  readonly description: string;
  readonly ready: string;
  readonly testing: string;
  readonly refused: string;
  readonly provider: string;
  readonly model: string;
  readonly embedding: string;
  readonly qdrant: string;
  readonly credential: string;
  readonly testedAt: string;
  readonly runTest: string;
  readonly recover: string;
  readonly origins: string;
  readonly components: string;
  readonly evidence: string;
  readonly documents: (count: number) => string;
  readonly current: string;
  readonly unknownVersion: string;
  readonly formatTestedAt: (value: string) => string;
  readonly readinessStages: ReadonlyArray<string>;
  readonly complete: string;
  readonly upcoming: string;
  readonly failureTitle: string;
};
/** Closed readiness and action conditions consumed by the pure workspace renderer. */
export type AgentOSWorkspaceAiKnowledgeViewProps = {
  readonly state: "loading" | "key-configuring" | "ready" | "refused" | "testing" | "recovering" | "success";
  readonly readiness?: AgentosAiKnowledgeReadiness;
  readonly labels: AgentOSWorkspaceAiKnowledgeLabels;
  readonly onTest: () => void;
  readonly onRecover: () => void;
};
const fact = (label: string, value: string | undefined, loading: boolean) => <div>
  <Text props={{
    content: label,
    size: "sm"
  }} />
  <Text props={{
    content: value,
    size: "sm"
  }} isLoading={loading} /></div>;
const toneOf = (state: AgentOSWorkspaceAiKnowledgeViewProps["state"]): BadgeTone => {
  if (state === "ready" || state === "success") return "success";
  return state === "refused" ? "danger" : "warning";
};
const refusingStage = (readiness: AgentosAiKnowledgeReadiness | undefined) => {
  if (readiness?.credentialStatus !== "configured") return 0;
  const badModel = readiness.components.some(item => item.component.toLowerCase().includes("model") && !["ready", "healthy", "passed", "configured"].includes(item.verdict.toLowerCase()));
  if (badModel) return 1;
  if (readiness.qdrantHealth !== "healthy") return 3;
  return 4;
};
const currentStage = (state: AgentOSWorkspaceAiKnowledgeViewProps["state"], readiness: AgentosAiKnowledgeReadiness | undefined) => {
  if (state === "recovering") return 2;
  if (state === "testing" || state === "ready" || state === "success") return 4;
  return state === "refused" ? refusingStage(readiness) : 0;
};
const readinessStepState = (index: number, current: number): LifecycleStepData["state"] => {
  if (index < current) return "done";
  return index === current ? "current" : "upcoming";
};
const readinessStepLabel = (index: number, current: number, state: AgentOSWorkspaceAiKnowledgeViewProps["state"], labels: AgentOSWorkspaceAiKnowledgeLabels) => {
  if (index < current) return labels.complete;
  if (index !== current) return labels.upcoming;
  if (state === "refused") return labels.refused;
  return state === "ready" || state === "success" ? labels.ready : labels.testing;
};
const readinessSteps = (state: AgentOSWorkspaceAiKnowledgeViewProps["state"], readiness: AgentosAiKnowledgeReadiness | undefined, labels: AgentOSWorkspaceAiKnowledgeLabels): ReadonlyArray<LifecycleStepData> => {
  const current = currentStage(state, readiness);
  return labels.readinessStages.map((label, index) => ({
    ordinal: String(index + 1),
    label,
    state: readinessStepState(index, current),
    stateLabel: readinessStepLabel(index, current, state, labels)
  }));
};

/** Compose the complete workspace AI verdict, source provenance and bounded recovery controls. */
export const AgentOSWorkspaceAiKnowledgeBase = (props: AgentOSWorkspaceAiKnowledgeProps) => {
  const {
    state,
    readiness,
    labels,
    onTest,
    onRecover
  }: AgentOSWorkspaceAiKnowledgeViewProps = props;
  const loading = state === "loading";
  let status = labels.testing;
  if (state === "ready" || state === "success") status = labels.ready;else if (state === "refused") status = labels.refused;
  const embedding = readiness === undefined ? undefined : `${readiness.embeddingProfile} · ${readiness.embeddingDimension}`;
  let credential = readiness?.credentialStatus;
  if (credential !== undefined && readiness !== undefined && readiness.credentialMaskedHint !== null) credential += ` · ${readiness.credentialMaskedHint}`;
  const summary = <SurfaceCard props={{
    label: labels.title
  }}><div><div>

        <Text props={{
          content: labels.title,
          size: "md",
          weight: "semibold"
        }} />
        <Text props={{
          content: state === "refused" ? readiness?.failureCode ?? labels.refused : labels.description,
          size: "xs",
          tone: "muted"
        }} /></div>

      <Badge props={{
        content: status,
        tone: toneOf(state)
      }} isLoading={loading} /><div><>{fact(labels.provider, readiness?.provider, loading)}{fact(labels.model, readiness?.chatModel, loading)}{fact(labels.embedding, embedding, loading)}{fact(labels.credential, credential, loading)}{fact(labels.qdrant, readiness?.qdrantHealth, loading)}{fact(labels.testedAt, readiness?.testedAt === null || readiness?.testedAt === undefined ? "—" : labels.formatTestedAt(readiness.testedAt), loading)}</></div><div><>


          <Button props={{
            label: labels.runTest,
            variant: "primary",
            disabled: loading || state === "testing" || readiness?.credentialStatus !== "configured",
            isPending: state === "testing"
          }} on={{
            press: onTest
          }} />{state === "refused" ? [] : [<Button key="item-0" props={{
            label: labels.recover,
            variant: "secondary",
            disabled: loading || state === "recovering",
            isPending: state === "recovering"
          }} on={{
            press: onRecover
          }} />]}</></div></div></SurfaceCard>;
  const notice = state === "refused" ? <SurfaceCard props={{
    label: labels.failureTitle
  }}><div>
      <TileIcon props={{
        icon: "retry",
        signal: "attention"
      }} /><div>

        <Heading props={{
          content: labels.failureTitle,
          level: 2
        }} />
        <Text props={{
          content: readiness?.failureCode ?? labels.refused,
          size: "sm",
          tone: "muted"
        }} />
        <Button props={{
          label: labels.recover,
          variant: "primary"
        }} on={{
          press: onRecover
        }} /></div></div></SurfaceCard> : undefined;
  const progress = <div>{readinessSteps(state, readiness, labels).map((step, index) => <LifecycleStep key={index} props={step} isLoading={loading} />)}</div>;
  const origins = <AgentOSKnowledgeOriginList origins={readiness?.origins ?? []} loading={loading} labels={{
    title: labels.origins,
    documents: labels.documents,
    current: labels.current,
    unknownVersion: labels.unknownVersion
  }} />;
  const components = <AgentOSReadinessComponentList components={readiness?.components ?? []} loading={loading} labels={{
    title: labels.components,
    evidence: labels.evidence
  }} />;
  const evidence = <div>{origins}{components}</div>;
  const heading = <Heading props={{
    content: labels.sectionHeading,
    level: 2
  }} />;
  return <div>{heading}{summary}{notice}{progress}{evidence}</div>;
};

