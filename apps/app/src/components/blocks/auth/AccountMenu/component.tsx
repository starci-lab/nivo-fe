import { nivoIconSource } from "@nivo/ui";
import { Icon } from "@starci/grammar/common";
import type { ComponentType } from "react";

import { DropdownBranch, type DropdownBranchItemData } from "@nivo/ui/components/branches/DropdownBranch";
import type { AdministratorRevocationDialogProps } from "@/components/blocks/auth/AdministratorRevocationDialog";
import type { SessionEndingDialogProps } from "@/components/blocks/auth/SessionEndingDialog";

/** Resolved signed-in account actions shown in the global navbar. */
export type AccountMenuBaseProps = {
  readonly props: {
    readonly label: string;
    readonly signOutLabel: string;
    readonly signOutEverywhereLabel: string;
    readonly isSigningOut?: boolean;
    /**
     * The administrator ending entry. ABSENT UNTIL AN AUTHORITY OWNER HAS CONFIRMED THE ACTOR, which
     * is the whole of this slot: the row appears only when the connected half supplies a word for it.
     */
    readonly administratorEnding?: {
      readonly label: string;
      readonly isDisabled?: boolean;
    };
    /** The every-browser confirmation this menu opens, resolved by the connected half. */
    readonly sessionEndingControl: ComponentType<SessionEndingDialogProps>;
    readonly sessionEndingControlProps: SessionEndingDialogProps;
    /**
     * The scoped administrator ending this menu opens. Handed in beside the entry above, because the
     * route and the membership that decide the entry's words are the connected half's to resolve.
     */
    readonly administratorRevocationControl: ComponentType<AdministratorRevocationDialogProps>;
    readonly administratorRevocationControlProps: AdministratorRevocationDialogProps;
  };
  readonly on?: {
    readonly signOut?: () => void;
    readonly signOutEverywhere?: () => void;
    readonly administratorEnding?: () => void;
  };
};

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type AccountMenuProps = AccountMenuBaseProps;

/** Every action this menu can report, so the reported id is one of a closed set. */
type AccountMenuAction = "sign-out" | "sign-out-everywhere" | "administrator-ending";
const accountTrigger = <Icon source={nivoIconSource("account", "leading")} usage="leading" />;

/**
 * Pure account menu: vendor mechanics stay in DropdownBranch, session behavior stays above.
 *
 * The menu owns no state of its own, including the two Dialogs it opens - each is handed in as a
 * resolved control, so every visible word and every effect stays in the connected half.
 */
export const AccountMenuBase = (props: AccountMenuProps) => {
  const {
    label,
    signOutLabel,
    signOutEverywhereLabel,
    isSigningOut,
    administratorEnding,
    sessionEndingControl: SessionEndingControl,
    sessionEndingControlProps,
    administratorRevocationControl: AdministratorRevocationControl,
    administratorRevocationControlProps
  }: AccountMenuBaseProps["props"] = props.props;
  const items: ReadonlyArray<DropdownBranchItemData<AccountMenuAction>> = [
    {
      id: "sign-out",
      label: signOutLabel,
      tone: "danger",
      isDisabled: isSigningOut
    },
    {
      id: "sign-out-everywhere",
      label: signOutEverywhereLabel,
      tone: "danger"
    },
    ...(administratorEnding === undefined ? [] : [{
      id: "administrator-ending" as const,
      label: administratorEnding.label,
      tone: "danger" as const,
      isDisabled: administratorEnding.isDisabled
    }])
  ];
  return <>
    <DropdownBranch<AccountMenuAction> props={{
      label,
      sections: [{
        items
      }]
    }} on={{
      action: (id: AccountMenuAction) => {
        if (id === "sign-out") {
          props.on?.signOut?.();
          return;
        }
        if (id === "sign-out-everywhere") {
          props.on?.signOutEverywhere?.();
          return;
        }
        props.on?.administratorEnding?.();
      }
    }} trigger={accountTrigger} />
    <SessionEndingControl {...sessionEndingControlProps} />
    <AdministratorRevocationControl {...administratorRevocationControlProps} />
  </>;
};