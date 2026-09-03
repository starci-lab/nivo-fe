import { SurfaceCard, SurfaceListCard, Heading, Text } from "@starci/grammar/core";

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
const fact = (item: InfrastructureDomainFact, isLoading = false) => <div>
  <Text size="sm" isSkeleton={isLoading}>{item.label}</Text>
  <Text size="sm" isSkeleton={isLoading}>{item.value}</Text></div>;
const refusal = (note: string) => <div>
  <Text size="sm" tone="muted">{note}</Text></div>;
const domainEvidenceContent = (renderedFacts: ReadonlyArray<ReturnType<typeof fact>>) => <div>{renderedFacts}</div>;

/** Draw derived service context beside independently settled domain evidence. */
export const InfrastructureSummaryBase = (props: InfrastructureSummaryProps) => {
  const {
    label,
    context,
    domains
  }: InfrastructureSummaryProps = props;
  const isLoading = domains.phase === "pending";
  const facts = domains.phase === "populated" || domains.phase === "partial" ? domains.facts : [];
  const note = domains.phase === "empty" || domains.phase === "failed" || domains.phase === "partial" ? domains.note : undefined;
  if (domains.phase === "pending" || domains.phase === "populated" || domains.phase === "partial") {
    const renderedFacts = isLoading ? [fact({
      id: "pending-1",
      label: "",
      value: ""
    }, true), fact({
      id: "pending-2",
      label: "",
      value: ""
    }, true)] : facts.map(item => fact(item));
    const content = domainEvidenceContent(renderedFacts);
    return <SurfaceListCard
      label={label}
      footer={<Text size="xs" tone="muted" isSkeleton={isLoading}>{note === undefined ? context : `${context} ${note}`}</Text>}
      isLoading={isLoading}
    >{content}</SurfaceListCard>;
  }
  return <SurfaceCard><div><div>
        <Heading level={3}>{label}</Heading></div>
      <Text size="sm">{context}</Text>
      {facts.length > 0 ? <div>{facts.map(item => fact(item))}</div> : null}
      {note === undefined ? null : refusal(note)}</div></SurfaceCard>;
};

/** Registry identity for the pure infrastructure summary twin. */
