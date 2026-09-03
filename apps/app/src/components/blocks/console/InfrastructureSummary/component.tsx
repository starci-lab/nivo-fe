import { EmptyNotice, SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common";
import {
  INFRASTRUCTURE_SUMMARY_COLLECTION_CLASS_NAME,
  INFRASTRUCTURE_SUMMARY_FACT_COLUMN_CLASS_NAME,
  INFRASTRUCTURE_SUMMARY_FACT_ROW_CLASS_NAME,
  INFRASTRUCTURE_SUMMARY_FALLBACK_CLASS_NAME,
  INFRASTRUCTURE_SUMMARY_NOTE_CLASS_NAME
} from "./classNames";

/** One exact domain fact displayed in infrastructure context. */
export type InfrastructureDomainFact = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};
/** Independently settled domain evidence states. */
export type InfrastructureDomainsState = {
  readonly phase: "pending";
} | {
  readonly phase: "empty";
  readonly note: string;
} | {
  readonly phase: "populated";
  readonly facts: ReadonlyArray<InfrastructureDomainFact>;
} | {
  readonly phase: "failed";
  readonly note: string;
} | {
  readonly phase: "partial";
  readonly facts: ReadonlyArray<InfrastructureDomainFact>;
  readonly note: string;
};
/** Pure infrastructure summary input derived from service and domain evidence. */
export type InfrastructureSummaryProps = {
  readonly label: string;
  readonly context: string;
  readonly domains: InfrastructureDomainsState;
};
const fact = (item: InfrastructureDomainFact, isLoading = false) => <div
  key={item.id}
  className={INFRASTRUCTURE_SUMMARY_FACT_ROW_CLASS_NAME}
>
  <div className={INFRASTRUCTURE_SUMMARY_FACT_COLUMN_CLASS_NAME}>
    <Text size="sm" isSkeleton={isLoading}>{item.label}</Text>
  </div>
  <div className={INFRASTRUCTURE_SUMMARY_FACT_COLUMN_CLASS_NAME}>
    <Text size="sm" isSkeleton={isLoading}>{item.value}</Text>
  </div>
</div>;
const refusal = (note: string) => <div className={INFRASTRUCTURE_SUMMARY_NOTE_CLASS_NAME}>
  <Text size="sm" tone="muted">{note}</Text></div>;
const domainEvidenceContent = (renderedFacts: ReadonlyArray<ReturnType<typeof fact>>) => <div className={INFRASTRUCTURE_SUMMARY_COLLECTION_CLASS_NAME}>{renderedFacts}</div>;

/** Draw derived service context beside independently settled domain evidence. */
export const InfrastructureSummaryBase = (props: InfrastructureSummaryProps) => {
  const {
    label,
    context,
    domains
  }: InfrastructureSummaryProps = props;
  if (domains.phase === "pending" || domains.phase === "populated") {
    const isLoading = domains.phase === "pending";
    const renderedFacts = isLoading ? [fact({
      id: "pending-1",
      label: "",
      value: ""
    }, true), fact({
      id: "pending-2",
      label: "",
      value: ""
    }, true)] : domains.facts.map(item => fact(item));
    const content = domainEvidenceContent(renderedFacts);
    return <SurfaceListCard
      label={label}
      footer={<div className={INFRASTRUCTURE_SUMMARY_NOTE_CLASS_NAME}>
        <Text size="xs" tone="muted" isSkeleton={isLoading}>{context}</Text>
      </div>}
      isLoading={isLoading}
    >{content}</SurfaceListCard>;
  }
  if (domains.phase === "partial") return <SurfaceCard label={label} state="cautionary"><div className={INFRASTRUCTURE_SUMMARY_FALLBACK_CLASS_NAME}>
      <Text size="sm">{context}</Text>
      {domains.facts.length > 0 ? domainEvidenceContent(domains.facts.map(item => fact(item))) : null}
      {refusal(domains.note)}</div></SurfaceCard>;
  if (domains.phase === "empty") return <SurfaceCard label={label}><div className={INFRASTRUCTURE_SUMMARY_FALLBACK_CLASS_NAME}>
      <Text size="sm">{context}</Text>
      <EmptyNotice message={domains.note} /></div></SurfaceCard>;
  return <SurfaceCard label={label} state="unavailable"><div className={INFRASTRUCTURE_SUMMARY_FALLBACK_CLASS_NAME}>
      <Text size="sm">{context}</Text>
      {refusal(domains.note)}</div></SurfaceCard>;
};

/** Registry identity for the pure infrastructure summary twin. */
