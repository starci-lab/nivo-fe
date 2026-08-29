"use client";

import { Button, Field, Heading, LifecycleStep, RequestSummary, Text, type LifecycleStepData } from "@nivo/ui";

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


      <Field props={{
        id: "template-app-slug",
        name: "slug",
        label: viewProps.slugLabel,
        placeholder: viewProps.slugPlaceholder,
        hint: viewProps.slugHint,
        disabled: state === "submitting"
      }} on={{
        change: on?.changeSlug
      }} /></>



    <Button props={{
      label: viewProps.submitLabel,
      variant: "primary",
      isPending: state === "submitting"
    }} on={{
      press: on?.submit
    }} /></div> : <RequestSummary props={{
    subject: viewProps.subject,
    detail: viewProps.detail,
    actionLabel: viewProps.actionLabel
  }} on={{
    press: on?.act
  }} isLoading={state === "catalog_loading"} />;
  const status = <div>

    <Heading props={{
      content: viewProps.statusTitle,
      level: 3
    }} />


    <Text props={{
      content: viewProps.statusText,
      size: "sm",
      tone: state === "failed" ? "accent" : "muted"
    }} />{state === "failed" || state === "unsupported" ? <Button props={{
      label: viewProps.actionLabel ?? "",
      size: "sm",
      variant: "secondary"
    }} on={{
      press: on?.act
    }} /> : null}</div>;
  return <div>{journey}{request}{status}</div>;
};

