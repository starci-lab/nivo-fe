import { CollapsibleRail, DrawerBranch, Icon, SelectionList } from "@nivo/ui";
import type { IconName, SelectionListGroup } from "@nivo/ui";

/** Stable destination keys owned by the console navigation. */
export type ConsoleNavProps = ConsoleNavBaseProps;
/** Public API role for ConsoleDestinationKey. */
export type ConsoleDestinationKey = "overview" | "apps" | "agentos" | "servers" | "domains" | "wallet" | "support";
/** Supported console navigation presentations. */
export type ConsoleNavMode = "desktop" | "mobile";
/** Complete translated vocabulary required by the pure console navigation. */
export type ConsoleNavLabels = {
  readonly navigation: string;
  readonly openMenu: string;
  readonly closeMenu: string;
  readonly title: string;
  readonly services: string;
  readonly account: string;
  readonly unavailable: string;
  readonly destinations: Readonly<Record<ConsoleDestinationKey, string>>;
};
/** Pure console navigation input and its destination command. */
export type ConsoleNavBaseProps = {
  readonly mode?: ConsoleNavMode;
  readonly selectedKey: ConsoleDestinationKey;
  readonly labels: ConsoleNavLabels;
  readonly onActivate: (key: ConsoleDestinationKey) => void;
};
const SERVICE_KEYS: ReadonlyArray<ConsoleDestinationKey> = ["apps", "agentos", "servers", "domains"];
const ACCOUNT_KEYS: ReadonlyArray<ConsoleDestinationKey> = ["wallet", "support"];
const DISABLED = new Set<ConsoleDestinationKey>(["servers", "domains", "support"]);
const ICONS: Readonly<Record<ConsoleDestinationKey, IconName>> = {
  overview: "overview",
  apps: "apps",
  agentos: "agentos",
  servers: "servers",
  domains: "domains",
  wallet: "wallet",
  support: "support"
};
type ConsoleSelectionProps = {
  readonly label: string;
  readonly selectedKey: ConsoleDestinationKey;
  readonly groups: ReadonlyArray<SelectionListGroup>;
  readonly presentation: "expanded" | "compact";
  readonly onActivate: (key: ConsoleDestinationKey) => void;
};
const ConsoleSelection = ({
  label,
  selectedKey,
  groups,
  presentation,
  onActivate
}: ConsoleSelectionProps) => <SelectionList props={{
  label,
  selectedKey,
  groups,
  presentation
}} on={{
  activate: key => onActivate(key as ConsoleDestinationKey)
}} />;
const ConsoleRailToggle = () => <Icon props={{
  name: "sidebar",
  role: "leading"
}} />;

/** Draw the selected grouped destinations as a rail or right-edge drawer. */
export const ConsoleNavBase = (props: ConsoleNavProps) => {
  const {
    mode = "desktop",
    selectedKey,
    labels,
    onActivate
  }: ConsoleNavBaseProps = props;
  const item = (key: ConsoleDestinationKey) => ({
    id: key,
    label: labels.destinations[key],
    icon: ICONS[key],
    ...(DISABLED.has(key) ? {
      status: labels.unavailable,
      isDisabled: true
    } : {})
  });
  const groups: ReadonlyArray<SelectionListGroup> = [{
    id: "home",
    items: [item("overview")]
  }, {
    id: "services",
    label: labels.services,
    items: SERVICE_KEYS.map(item)
  }, {
    id: "account",
    label: labels.account,
    items: ACCOUNT_KEYS.map(item)
  }];
  const expanded = {
    label: labels.navigation,
    selectedKey,
    groups,
    presentation: "expanded" as const,
    onActivate
  };
  const compact = {
    ...expanded,
    presentation: "compact" as const
  };
  if (mode === "mobile") return <DrawerBranch triggerLabel={labels.openMenu} title={labels.title} closeLabel={labels.closeMenu} content={ConsoleSelection} contentProps={expanded} />;
  return <CollapsibleRail ariaLabel={labels.navigation} rail={ConsoleSelection} railProps={expanded} collapsedRail={ConsoleSelection} collapsedRailProps={compact} toggleControl={ConsoleRailToggle} toggleControlProps={{}} collapseLabel={labels.closeMenu} expandLabel={labels.openMenu} storageKey="nivo-console-navigation-collapsed" />;
};

/** Registry identity for the pure console navigation twin. */
