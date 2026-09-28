
import { SurfaceCard, Button, Input, Heading, Text } from "@starci/grammar/common";

/** Opening-goal form copy, local state and persistence action. */
export type AgentOSModuleIntakeProps = AgentOSModuleIntakeViewProps;
/** Form data and resolved copy the pure intake draws. */
export type AgentOSModuleIntakeData = {
  readonly goal: string;
  readonly pending: boolean;
  readonly error?: string;
  readonly title: string;
  readonly description: string;
  readonly fieldLabel: string;
  readonly placeholder: string;
  readonly note: string;
  readonly action: string;
  readonly guideTitle: string;
  readonly guideSteps: ReadonlyArray<string>;
  readonly guideNote: string;
};
/** The bounded edits and submit the intake emits. */
export type AgentOSModuleIntakeActions = {
  readonly onGoal: (value: string) => void;
  readonly onSubmit: () => void;
};
/** Public API role for AgentOSModuleIntakeViewProps. */
export type AgentOSModuleIntakeViewProps = {
  readonly props: AgentOSModuleIntakeData;
  readonly on: AgentOSModuleIntakeActions;
};

/** Draw the bounded first-goal form beside its adaptive interview explanation. */
export const AgentOSModuleIntakeBase = (props: AgentOSModuleIntakeProps) => {
  const {
    goal,
    pending,
    error,
    title,
    description,
    fieldLabel,
    placeholder,
    note,
    action,
    guideTitle,
    guideSteps,
    guideNote
  }: AgentOSModuleIntakeData = props.props;
  const {
    onGoal,
    onSubmit
  }: AgentOSModuleIntakeActions = props.on;
  return <div><div><><div>


        <SurfaceCard><div><div>

              <Heading level={2}>{title}</Heading>
              <Text size="sm" tone="muted">{description}</Text></div>

            <Input
              id="module-goal"
              name="goal"
              label={fieldLabel}
              placeholder={placeholder}
              isDisabled={pending}
              variant="secondary"
              hint={error !== undefined ? undefined : error}
              errorMessage={error !== undefined ? error : undefined}
              isError={error !== undefined}
              onValueChange={onGoal}
            />
            <Text size="xs">{note}</Text>
            <Button
              variant="primary"
              isPending={pending}
              isDisabled={goal.trim().length < 3}
              onPress={onSubmit}
            >{action}</Button></div></SurfaceCard>
      </div></></div><div><><div>


        <SurfaceCard><div>
            <Heading level={3}>{guideTitle}</Heading><div>{guideSteps.map((step, index) => <div key={index}><Text size="sm" weight="semibold">{String(index + 1)}</Text><Text size="sm">{step}</Text></div>)}</div>
            <Text size="sm" tone="muted">{guideNote}</Text></div></SurfaceCard>
      </div></></div></div>;
};
