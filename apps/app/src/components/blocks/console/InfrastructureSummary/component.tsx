import { Heading, SurfaceCard, SurfaceListCard, Text } from "@nivo/ui";

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
  <Text props={{
    content: item.label,
    size: "sm"
  }} isLoading={isLoading} />
  <Text props={{
    content: item.value,
    size: "sm"
  }} isLoading={isLoading} /></div>;
const refusal = (note: string) => <div>
  <Text props={{
    content: note,
    size: "sm",
    tone: "muted"
  }} /></div>;
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
    return <SurfaceListCard props={{
      label,
      description: note === undefined ? context : `${context} ${note}`
    }} isLoading={isLoading}>{content}</SurfaceListCard>;
  }
  return <SurfaceCard><div><div>
        <Heading props={{
          content: label,
          level: 3
        }} /></div>
      <Text props={{
        content: context,
        size: "sm"
      }} />
      {facts.length > 0 ? <div>{facts.map(item => fact(item))}</div> : null}
      {note === undefined ? null : refusal(note)}</div></SurfaceCard>;
};

/** Registry identity for the pure infrastructure summary twin. */
