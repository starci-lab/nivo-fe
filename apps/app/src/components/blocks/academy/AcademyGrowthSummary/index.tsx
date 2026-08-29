"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useQueryMyAcademyGrowthSnapshotSwr } from "@/hooks/swr";
import { AcademyGrowthSummaryBase } from "./component";

/** Owner-scoped identity consumed by the connected growth block. */
export type AcademyGrowthSummaryProps = {
  readonly siteId: string;
};

/** Load and format Academy growth independently from neighbouring blocks. */
export const AcademyGrowthSummary = (props: AcademyGrowthSummaryProps) => {
  const {
    siteId
  }: AcademyGrowthSummaryProps = props;
  const t = useTranslations("console.academyControlCenter.growth");
  const format = useFormatter();
  const answer = useQueryMyAcademyGrowthSnapshotSwr(siteId).data;
  const data = answer?.ok === true ? answer.data : undefined;
  const settledState = answer?.ok === true ? "answered" : "refused";
  return <AcademyGrowthSummaryBase state={answer === undefined ? "resting" : settledState} data={data} revenue={format.number(data?.revenueVnd ?? 0, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  })} labels={{
    section: t("section"),
    health: t("health"),
    loading: t("loading"),
    refused: t("refused"),
    revenue: t("revenue"),
    orders: t("orders"),
    members: t("members"),
    completions: t("completions"),
    activeRate: t("activeRate")
  }} />;
};
