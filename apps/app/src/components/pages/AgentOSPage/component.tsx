import { Breadcrumbs, TileIcon } from "@nivo/ui";
import { Button, Heading, Text } from "@starci/grammar/core";
import { AgentOSWorkspaceList } from "@/components/blocks/agentos/AgentOSWorkspaceList";
import { AgentOSProvisioning } from "@/components/blocks/provisioning/AgentOSProvisioning";

/** Route identity for the dashboard, pre-persistence create flow, or persisted order. */
export type AgentOSPageRouteProps = {
  readonly mode: "dashboard";
} | {
  readonly mode: "create";
} | {
  readonly mode: "resume";
  readonly orderId: string;
};

/** Page-owned copy and navigation; connected blocks keep their own request states. */
export type AgentOSPageProps = AgentOSPageRouteProps & {
  readonly labels?: AgentOSPageLabels;
  readonly onOpenDashboard?: () => void;
  readonly onCreate?: () => void;
};
type AgentOSPageLabels = {
  readonly path: string;
  readonly agentos: string;
  readonly dashboardDescription: string;
  readonly createTitle: string;
  readonly createDescription: string;
  readonly orderTitle: string;
  readonly orderDescription: string;
  readonly createAction: string;
  readonly dashboardEyebrow?: string;
  readonly createEyebrow?: string;
  readonly orderEyebrow?: string;
};
/** Full resolved content passed from the connected route to the page renderer. */
export type AgentOSPageViewProps = AgentOSPageRouteProps & {
  readonly labels: AgentOSPageLabels;
  readonly onOpenDashboard: () => void;
  readonly onCreate: () => void;
};
const pageCopy = (props: AgentOSPageViewProps) => {
  if (props.mode === "create") return {
    title: props.labels.createTitle,
    description: props.labels.createDescription,
    eyebrow: props.labels.createEyebrow ?? props.labels.agentos
  };
  if (props.mode === "resume") return {
    title: props.labels.orderTitle,
    description: props.labels.orderDescription,
    eyebrow: props.labels.orderEyebrow ?? props.labels.agentos
  };
  return {
    title: props.labels.agentos,
    description: props.labels.dashboardDescription,
    eyebrow: props.labels.dashboardEyebrow ?? props.labels.agentos
  };
};

/** Compose dashboard, create, and order routes without proxying child request data. */
export const AgentOSPageBase = (props: AgentOSPageProps) => {
  const view = props as AgentOSPageViewProps;
  const isDashboard = view.mode === "dashboard";
  const {
    title,
    description,
    eyebrow
  } = pageCopy(view);
  const path = isDashboard ? undefined : <Breadcrumbs props={{
    mode: "trail",
    label: view.labels.path,
    steps: [{
      id: "agentos",
      label: view.labels.agentos
    }, {
      id: view.mode,
      label: title,
      isCurrent: true
    }]
  }} on={{
    activate: id => {
      if (id === "agentos") view.onOpenDashboard();
    }
  }} />;
  const heading = <div><div>


      <TileIcon props={{
        icon: "agentos",
        signal: isDashboard ? "active" : "none"
      }} /><div>



        <Text size="sm" tone="accent" weight="semibold">{eyebrow}</Text>


        <Heading level={1} scale="display">{title}</Heading>


        <Text size="md" tone="muted">{description}</Text></div></div>{isDashboard ? <Button
          variant="primary"
          size="lg"
          onPress={view.onCreate}
        >{view.labels.createAction}</Button> : null}</div>;
  const section = isDashboard ? [<AgentOSWorkspaceList key="item-0" />] : [<AgentOSProvisioning key="item-0" context={view.mode === "create" ? {
    mode: "new"
  } : {
    mode: "resume",
    orderId: view.orderId
  }} />];
  return <div>{path === undefined ? null : path}{heading}{section}</div>;
};


