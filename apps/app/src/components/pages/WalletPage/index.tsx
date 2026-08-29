"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WalletPageBase, type WalletPageState } from "./component";
/** Public API role for WalletPageProps. */
export type WalletPageProps = Record<string, never>;
const WAYPOINT_KEYS = ["orderId", "invoiceId", "returnTo"] as const;

/** Resolve the route-owned architecture axis inside the boundary required by Next prerendering. */
const WalletPageSearchState = () => {
  const searchParams = useSearchParams();
  const pageState: WalletPageState = WAYPOINT_KEYS.some(key => searchParams.has(key)) ? "waypoint" : "ordinary";
  return <WalletPageBase pageState={pageState} />;
};

/** Connect only the page architecture axis; WalletControlCenter owns every local block and overlay condition. */
export const WalletPage = (props: WalletPageProps) => {
  void props;
  return <Suspense fallback={null}>
        <WalletPageSearchState />
    </Suspense>;
};

