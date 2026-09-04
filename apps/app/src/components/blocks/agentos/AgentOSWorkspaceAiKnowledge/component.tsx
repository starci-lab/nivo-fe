"use client";
import { DETAILS_CLASS_NAME, CONTENT_CLASS_NAME, ROW_CLASS_NAME } from "./classNames";
import { EmptyNotice as DirectionEmpty, SectionHeader as DirectionHeader, PrimaryRailLayout as DirectionLayout, SurfaceListCard as DirectionList, Badge, Button, Heading, SurfaceCard, Text, type BadgeTone } from "@starci/grammar/common";
import { AgentOSKnowledgeOriginList } from "@/components/blocks/agentos/AgentOSKnowledgeOriginList";
import { AgentOSReadinessComponentList } from "@/components/blocks/agentos/AgentOSReadinessComponentList";
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/console";
import { LifecycleStep, type LifecycleStepData } from "@nivo/ui";
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
    readonly pendingAction?: "testing" | "recovering";
    readonly recoveryFromRefused?: boolean;
};
const toneOf = (state: AgentOSWorkspaceAiKnowledgeViewProps["state"]): BadgeTone => {
    if (state === "ready" || state === "success")
        return "success";
    return state === "refused" ? "danger" : "warning";
};
const refusingStage = (readiness: AgentosAiKnowledgeReadiness | undefined) => {
    if (readiness?.credentialStatus !== "configured")
        return 0;
    const badModel = readiness.components.some(item => item.component.toLowerCase().includes("model") && !["ready", "healthy", "passed", "configured"].includes(item.verdict.toLowerCase()));
    if (badModel)
        return 1;
    if (readiness.qdrantHealth !== "healthy")
        return 3;
    return 4;
};
const currentStage = (state: AgentOSWorkspaceAiKnowledgeViewProps["state"], readiness: AgentosAiKnowledgeReadiness | undefined) => {
    if (state === "recovering")
        return 2;
    if (state === "testing" || state === "ready" || state === "success")
        return 4;
    return state === "refused" ? refusingStage(readiness) : 0;
};
const readinessStepState = (index: number, current: number): LifecycleStepData["state"] => {
    if (index < current)
        return "done";
    return index === current ? "current" : "upcoming";
};
const readinessStepLabel = (index: number, current: number, state: AgentOSWorkspaceAiKnowledgeViewProps["state"], labels: AgentOSWorkspaceAiKnowledgeLabels) => {
    if (index < current)
        return labels.complete;
    if (index !== current)
        return labels.upcoming;
    if (state === "refused")
        return labels.refused;
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
    const { state, readiness, labels, onTest, onRecover, pendingAction, recoveryFromRefused } = props;
    const loading = state === "loading";
    const recoveryPrimary = state === "refused" || recoveryFromRefused === true;
    const status = state === "ready" || state === "success" ? labels.ready : state === "refused" ? labels.refused : labels.testing;
    const credential = readiness?.credentialStatus === undefined ? undefined : readiness.credentialStatus + (readiness.credentialMaskedHint === null ? "" : " · " + readiness.credentialMaskedHint);
    const row = (label: string, value: string | undefined) => <Text size="sm" isSkeleton={loading}>{label}: {value ?? "—"}</Text>;
    const primary = <SurfaceCard label={labels.title}><div className={DETAILS_CLASS_NAME} data-contract="GAP-4"><DirectionHeader level={2} title={labels.title} description={<Text size="sm" tone="muted">{labels.description}</Text>} action={<Badge tone={toneOf(state)} isSkeleton={loading}>{status}</Badge>}/>{row(labels.provider, readiness?.provider)}{row(labels.model, readiness?.chatModel)}{row(labels.embedding, readiness === undefined ? undefined : readiness.embeddingProfile + " · " + readiness.embeddingDimension)}{row(labels.credential, credential)}{row(labels.qdrant, readiness?.qdrantHealth)}{row(labels.testedAt, readiness?.testedAt == null ? "—" : labels.formatTestedAt(readiness.testedAt))}<Button variant={recoveryPrimary ? "secondary" : "primary"} type="button" isDisabled={loading || pendingAction === "recovering" || readiness?.credentialStatus !== "configured" || (state === "testing" && pendingAction !== "testing")} isPending={pendingAction === "testing"} onPress={onTest}>{labels.runTest}</Button>{recoveryPrimary ? <DirectionEmpty message={labels.failureTitle} description={readiness?.failureCode ?? labels.refused}/> : null}<Button key="recovery" variant={recoveryPrimary ? "primary" : "secondary"} type="button" isDisabled={loading || pendingAction === "testing"} isPending={pendingAction === "recovering"} onPress={onRecover}>{labels.recover}</Button><Text size="sm" live="polite">{state === "refused" ? readiness?.failureCode ?? labels.refused : status}</Text></div></SurfaceCard>;
    const rail = <div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><DirectionList label={labels.sectionHeading}>{readinessSteps(state, readiness, labels).map((step, index) => <div className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3" key={index}><LifecycleStep props={step} isLoading={loading}/></div>)}</DirectionList><AgentOSKnowledgeOriginList origins={readiness?.origins ?? []} loading={loading} labels={{ title: labels.origins, documents: labels.documents, current: labels.current, unknownVersion: labels.unknownVersion }}/><AgentOSReadinessComponentList components={readiness?.components ?? []} loading={loading} labels={{ title: labels.components, evidence: labels.evidence }}/></div>;
    return <div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><Heading level={2}>{labels.sectionHeading}</Heading><DirectionLayout primary={primary} rail={rail} railWidth="standard" align="start"/></div>;
};
