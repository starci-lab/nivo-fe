import { WalletControlCenter } from "@/components/blocks/wallet/WalletControlCenter";

/** Architectural states of the Wallet route. */
export type WalletPageState = "ordinary" | "waypoint";

/** Complete input of WalletPageBase: one drawn shape; page data and overlays stay inside WalletControlCenter. */
export type WalletPageBaseProps = {
  readonly state: WalletPageState;
};

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type WalletPageProps = WalletPageBaseProps;

/** Compose the connected Wallet block without proxying any block state or request data through the page contract. */
export const WalletPageBase = (props: WalletPageProps) => (
  <WalletControlCenter pageState={props.state} />
);
