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

/** Resolved pure Integration Center state. */
export type AcademyIntegrationCenterViewProps = {
  readonly state: "resting" | "refused" | "answered";
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
  readonly onSelect: (id: string) => void;
  readonly onChangeField: (name: string, value: string) => void;
  readonly onSubmit: () => void;
};

/** Render provider status and one selected write-only setup form. */
const AcademyIntegrationCenterContent = ({
  state,
  sectionLabel,
  refusedLabel,
  cards,
  selected,
  pendingId,
  outcome,
  onSelect,
  onChangeField,
  onSubmit
}: AcademyIntegrationCenterViewProps) => <>
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
        press: () => onSelect(card.id)
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
    onValueChange={value => onChangeField(field.name, value)}
  />)}
      <Button
        variant="primary"
        isPending={pendingId === selected.id}
        onPress={onSubmit}
      >{selected.submitLabel}</Button></div></SurfaceCard>}
        {outcome === undefined ? null : <Text size="sm" tone="muted" live="polite">{outcome}</Text>}
    </>;

/** Stable typed root for the Academy integration block. */
export const AcademyIntegrationCenterBase = (props: AcademyIntegrationCenterProps) => <AcademyIntegrationCenterContent {...props} />;

