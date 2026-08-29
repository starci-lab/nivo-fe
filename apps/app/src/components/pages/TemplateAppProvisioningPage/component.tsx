import { Breadcrumbs, Heading, Text } from "@nivo/ui";
import { TemplateAppProvisioning } from "@/components/blocks/provisioning/TemplateAppProvisioning";

/** Route identity needed to create or resume one Template App. */
export type TemplateAppProvisioningRouteProps = {
  readonly mode: "new";
  readonly templateKey: string;
} | {
  readonly mode: "resume";
  readonly siteId: string;
};

/** Page-owned copy and navigation around the connected provisioning block. */
export type TemplateAppProvisioningPageProps = TemplateAppProvisioningRouteProps & {
  readonly labels?: TemplateAppProvisioningPageLabels;
  readonly onOpenApps?: () => void;
};
type TemplateAppProvisioningPageLabels = {
  readonly path: string;
  readonly apps: string;
  readonly createTitle: string;
  readonly createDescription: string;
  readonly provisioningTitle: string;
  readonly provisioningDescription: string;
};
/** Full resolved content passed from the connected route to the page renderer. */
export type TemplateAppProvisioningPageViewProps = TemplateAppProvisioningRouteProps & {
  readonly labels: TemplateAppProvisioningPageLabels;
  readonly onOpenApps: () => void;
};

/** Compose the create or persisted-site lifecycle without proxying block state. */
export const TemplateAppProvisioningPageBase = (props: TemplateAppProvisioningPageProps) => {
  const view = props as TemplateAppProvisioningPageViewProps;
  const title = view.mode === "new" ? view.labels.createTitle : view.labels.provisioningTitle;
  const description = view.mode === "new" ? view.labels.createDescription : view.labels.provisioningDescription;
  return <div>




    <Breadcrumbs props={{
      mode: "trail",
      label: view.labels.path,
      steps: [{
        id: "apps",
        label: view.labels.apps
      }, {
        id: view.mode,
        label: title,
        isCurrent: true
      }]
    }} on={{
      activate: id => {
        if (id === "apps") view.onOpenApps();
      }
    }} /><div>




      <Heading props={{
        content: title,
        level: 1
      }} />


      <Text props={{
        content: description,
        size: "sm",
        tone: "muted"
      }} /></div><>



      <TemplateAppProvisioning context={view.mode === "new" ? {
        mode: "new",
        templateKey: view.templateKey
      } : {
        mode: "resume",
        siteId: view.siteId
      }} /></></div>;
};


