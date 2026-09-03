"use client";

import { LifecycleStep, RequestSummary, type LifecycleStepData } from "@nivo/ui";
import { Button, Input, Heading, Text } from "@starci/grammar/core";

/** The settled trees the template-app flow can draw. */
export type TemplateAppProvisioningProps = TemplateAppProvisioningViewProps;
/** Public API role for TemplateAppProvisioningViewProps. */
export type TemplateAppProvisioningViewProps = {
  readonly state: "catalog_loading" | "unsupported" | "request" | "submitting" | "accepted" | "preparing" | "ready" | "failed";
  readonly props: {
    readonly steps: ReadonlyArray<LifecycleStepData>;
    readonly subject: string;
    readonly detail: string;
    readonly statusTitle: string;
    readonly statusText: string;
    readonly slugLabel: string;
    readonly slugPlaceholder: string;
    readonly slugHint?: string;
    readonly submitLabel: string;
    readonly actionLabel?: string;
    readonly isActionPending?: boolean;
  };
  readonly on?: {
    readonly changeSlug?: (value: string) => void;
    readonly submit?: () => void;
    readonly act?: () => void;
  };
};

/** Draw one Template App request and its deployment journey. */
export const TemplateAppProvisioningBase = (props: TemplateAppProvisioningProps) => {
  const { state, props: viewProps, on }: TemplateAppProvisioningViewProps = props;
  const isRequest = state === "request" || state === "submitting";
  const journey = <div>{viewProps.steps.map((step, index) => <LifecycleStep key={index} props={step} isLoading={state === "catalog_loading"} />)}</div>;
  const request = isRequest ? <div><>


      <Input
        id="template-app-slug"
        name="slug"
        label={viewProps.slugLabel}
        placeholder={viewProps.slugPlaceholder}
        isDisabled={state === "submitting"}
        variant="secondary"
        hint={viewProps.slugHint}
        onValueChange={on?.changeSlug}
      /></>



    <Button
      variant="primary"
      isPending={state === "submitting"}
      onPress={on?.submit}
    >{viewProps.submitLabel}</Button></div> : <RequestSummary props={{
    subject: viewProps.subject,
    detail: viewProps.detail,
    actionLabel: viewProps.actionLabel
  }} on={{
    press: on?.act
  }} isLoading={state === "catalog_loading"} />;
  const status = <div>

    <Heading level={3}>{viewProps.statusTitle}</Heading>


    <Text size="sm" tone={state === "failed" ? "accent" : "muted"}>{viewProps.statusText}</Text>{state === "failed" || state === "unsupported" ? <Button
      size="sm"
      variant="secondary"
      onPress={on?.act}
    >{viewProps.actionLabel ?? ""}</Button> : null}</div>;
  return <div>{journey}{request}{status}</div>;
};

