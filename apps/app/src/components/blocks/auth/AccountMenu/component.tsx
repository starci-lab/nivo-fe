import { nivoIconSource } from "@nivo/ui";
import { Icon } from "@starci/grammar/common";

import { DropdownBranch } from "@nivo/ui/components/branches/DropdownBranch";

/** Resolved signed-in account action shown in the global navbar. */
export type AccountMenuProps = AccountMenuViewProps;
/** Public API role for AccountMenuViewProps. */
export type AccountMenuViewProps = {
  readonly props: {
    readonly label: string;
    readonly signOutLabel: string;
    readonly isSigningOut?: boolean;
  };
  readonly on?: {
    readonly signOut?: () => void;
  };
};
const accountTrigger = <Icon source={nivoIconSource("account", "leading")} usage="leading" />;

/** Pure account menu: vendor mechanics stay in DropdownBranch, session behavior stays above. */
export const AccountMenuBase = (props: AccountMenuProps) => <DropdownBranch props={{
  label: props.props.label,
  sections: [{
    items: [{
      id: "sign-out",
      label: props.props.signOutLabel,
      tone: "danger",
      isDisabled: props.props.isSigningOut
    }]
  }]
}} on={{
  action: () => props.on?.signOut?.()
}} trigger={accountTrigger} />;

