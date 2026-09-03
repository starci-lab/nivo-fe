"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useOverviewData } from "@/modules/overview/context";
import { OverviewAddressesBase, type OverviewAddressesState } from "./component";
/** Public API role for OverviewAddressesProps. */
export type OverviewAddressesProps = Record<string, never>;
export type { OverviewAddressesFact, OverviewAddressesState } from "./component";

/** Connect the exact held domains to the addresses surface; states its own absence rather than
 * disappearing. */
export const OverviewAddresses = (props: OverviewAddressesProps) => {
  void props;
  const { domains } = useOverviewData();
  const t = useTranslations("console");
  const format = useFormatter();
  const day = (value: string) => format.dateTime(new Date(value), {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  let state: OverviewAddressesState;
  if (domains === null) state = {
    phase: "pending"
  }; else if (!domains.ok) state = {
    phase: "failed",
    message: t("refusal.unknown")
  }; else if (domains.data.length === 0) state = {
    phase: "empty",
    message: t("domains.empty")
  }; else state = {
    phase: "populated",
    facts: domains.data.map(domain => {
      let renewal = domain.autoRenew ? t("domains.autoRenewOn") : t("domains.autoRenewOff");
      if (domain.expiresAt !== null) renewal = t("domains.expiresAt", {
        date: day(domain.expiresAt)
      });
      const statusLabel = t(`domains.status.${domain.status}`);
      return {
        id: domain.id,
        label: domain.name,
        value: `${statusLabel} · ${renewal}`
      };
    })
  };
  return <OverviewAddressesBase label={t("overview.addressesLabel")} state={state} />;
};

/** Registry identity for the connected overview addresses twin. */
