import { StatusActionCard } from "@nivo/ui";
import { SurfaceCard, Button, Input, type InputKind, Text, type BadgeTone } from "@starci/grammar/common";

/** One safe provider card; it contains no credential value. */
export type AcademyIntegrationCenterProps = AcademyIntegrationCenterViewProps;
/** Public API role for AcademyIntegrationCard. */
export type AcademyIntegrationCard = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly statusLabel: string;
  readonly statusTone: BadgeTone;
  readonly detail?: string;
  readonly actionLabel: string;
};

/** One provider-specific local form field. */
export type AcademyIntegrationFormField = {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly kind?: InputKind;
  readonly hint?: string;
};

/** Atoms the pure Integration Center draws; the connected half owns provider requests. */
export type AcademyIntegrationCenterData = {
  readonly sectionLabel: string;
  readonly refusedLabel: string;
  readonly cards: ReadonlyArray<AcademyIntegrationCard>;
  readonly selected?: {
    readonly id: string;
    readonly label: string;
    readonly fields: ReadonlyArray<AcademyIntegrationFormField>;
    readonly submitLabel: string;
  };
  readonly pendingId?: string;
  readonly outcome?: string;
};

/** Actions the pure Integration Center emits; every argument is an atom. */
export type AcademyIntegrationCenterActions = {
  readonly select: (id: string) => void;
  readonly changeField: (name: string, value: string) => void;
  readonly submit: () => void;
};

/** Resolved pure Integration Center state. */
export type AcademyIntegrationCenterViewProps = {
  readonly state: "resting" | "refused" | "answered";
  readonly props: AcademyIntegrationCenterData;
  readonly on: AcademyIntegrationCenterActions;
};

/** Render provider status and one selected write-only setup form. */
const AcademyIntegrationCenterContent = (input: AcademyIntegrationCenterViewProps) => {
  const {
    state
  } = input;
  const {
    sectionLabel,
    refusedLabel,
    cards,
    selected,
    pendingId,
    outcome
  } = input.props;
  const {
    select,
    changeField,
    submit
  } = input.on;
  return <>
        {state === "refused" ? <SurfaceCard
          label={sectionLabel}
        ><div>


      <Text size="sm" tone="muted">{refusedLabel}</Text></div></SurfaceCard> : <SurfaceCard
        label={sectionLabel}
      ><div>{cards.map(card => <StatusActionCard key={card.id} props={{
        ...card,
        isPending: pendingId === card.id,
        disabled: pendingId !== undefined
      }} on={{
        press: () => select(card.id)
      }} isLoading={state === "resting"} />)}</div></SurfaceCard>}
        {selected === undefined ? null : <SurfaceCard
          label={selected.label}
        ><div>{selected.fields.map(field => <Input
    key={field.id}
    {...field}
    isDisabled={pendingId !== undefined}
    revealLabel={field.kind === "password" ? "Show" : undefined}
    hideLabel={field.kind === "password" ? "Hide" : undefined}
    variant="secondary"
    onValueChange={value => changeField(field.name, value)}
  />)}
      <Button
        variant="primary"
        isPending={pendingId === selected.id}
        onPress={submit}
      >{selected.submitLabel}</Button></div></SurfaceCard>}
        {outcome === undefined ? null : <Text size="sm" tone="muted" live="polite">{outcome}</Text>}
    </>;
};

/** Stable typed root for the Academy integration block. */
export const AcademyIntegrationCenterBase = (props: AcademyIntegrationCenterProps) => <AcademyIntegrationCenterContent {...props} />;

