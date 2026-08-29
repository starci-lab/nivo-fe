import { Button, Field, Heading, SurfaceCard, Text } from "@nivo/ui";

/** Opening-goal form copy, local state and persistence action. */
export type AgentOSModuleIntakeProps = AgentOSModuleIntakeViewProps;
/** Public API role for AgentOSModuleIntakeViewProps. */
export type AgentOSModuleIntakeViewProps = {
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
  readonly onGoal: (value: string) => void;
  readonly onSubmit: () => void;
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
    guideNote,
    onGoal,
    onSubmit
  }: AgentOSModuleIntakeViewProps = props;
  return <div><div><><div>


        <SurfaceCard><div><div>

              <Heading props={{
                  content: title,
                  level: 2
                }} />
              <Text props={{
                  content: description,
                  size: "sm",
                  tone: "muted"
                }} /></div>

            <Field props={{
                id: "module-goal",
                name: "goal",
                label: fieldLabel,
                placeholder,
                hint: error,
                isInvalid: error !== undefined,
                disabled: pending
              }} on={{
                change: onGoal
              }} />
            <Text props={{
                content: note,
                size: "xs"
              }} />
            <Button props={{
                label: action,
                variant: "primary",
                isPending: pending,
                disabled: goal.trim().length < 3
              }} on={{
                press: onSubmit
              }} /></div></SurfaceCard>
      </div></></div><div><><div>


        <SurfaceCard><div>
            <Heading props={{
                content: guideTitle,
                level: 3
              }} /><div>{guideSteps.map((step, index) => <div key={index}><Text props={{
                    content: String(index + 1),
                    size: "sm",
                    weight: "semibold"
                  }} /><Text props={{
                    content: step,
                    size: "sm"
                  }} /></div>)}</div>
            <Text props={{
                content: guideNote,
                size: "sm",
                tone: "muted"
              }} /></div></SurfaceCard>
      </div></></div></div>;
};

