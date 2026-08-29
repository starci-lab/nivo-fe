import { WalletControlCenter } from "@/components/blocks/wallet/WalletControlCenter";

/** Architectural states of the Wallet route. */
export type WalletPageProps = WalletPageViewProps;
/** Public API role for WalletPageState. */
export type WalletPageState = "ordinary" | "waypoint";

/** Page-owned input; child payment, ledger, balance, and overlay data stay inside WalletControlCenter. */
export type WalletPageViewProps = {
  readonly pageState: WalletPageState;
};

/** Compose the connected Wallet block without proxying any block state or request data through PageProps. */
export const WalletPageBase = (props: WalletPageProps) => {
  const {
    pageState
  }: WalletPageViewProps = props;
  return <WalletControlCenter pageState={pageState} />;
};

