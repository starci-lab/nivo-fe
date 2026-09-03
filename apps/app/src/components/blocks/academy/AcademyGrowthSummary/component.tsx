import { LabelledProgressRow } from "@nivo/ui";
import { SurfaceCard, Text } from "@starci/grammar/core";
import type { AcademyGrowthSnapshot } from "@/modules/api/console";

/** Resolved copy for the growth block. */
export type AcademyGrowthSummaryProps = AcademyGrowthSummaryViewProps;
/** Public API role for AcademyGrowthSummaryLabels. */
export type AcademyGrowthSummaryLabels = {
  readonly section: string;
  readonly health: string;
  readonly loading: string;
  readonly refused: string;
  readonly revenue: string;
  readonly orders: string;
  readonly members: string;
  readonly completions: string;
  readonly activeRate: string;
};

/** Pure growth block state. */
export type AcademyGrowthSummaryViewProps = {
  readonly state: "resting" | "refused" | "answered";
  readonly data?: AcademyGrowthSnapshot;
  readonly labels: AcademyGrowthSummaryLabels;
  readonly revenue: string;
};

/** Render aggregate facts without fetching or formatting. */
const AcademyGrowthSummaryContent = ({
  state,
  data,
  labels,
  revenue
}: AcademyGrowthSummaryViewProps) => {
  const facts = [{
    id: "revenue",
    subject: revenue,
    caption: labels.revenue
  }, {
    id: "orders",
    subject: String(data?.paidOrders ?? 0),
    caption: labels.orders
  }, {
    id: "members",
    subject: String(data?.totalMembers ?? 0),
    caption: labels.members
  }, {
    id: "completions",
    subject: String(data?.totalCompletions ?? 0),
    caption: labels.completions
  }];
  const activePercent = data === undefined || data.totalMembers === 0 ? 0 : Math.round(data.activeMembers / data.totalMembers * 100);
  if (state === "refused") return <SurfaceCard
    label={labels.section}
  ><div>
        <Text size="sm" tone="muted">{labels.refused}</Text></div></SurfaceCard>;
  return <>
            <SurfaceCard
              label={labels.section}
            ><div>{facts.map((fact, index) => <div key={index}>
            <Text weight="semibold" isSkeleton={state === "resting"}>{fact.subject}</Text>
            <Text size="xs" tone="muted">{fact.caption}</Text></div>)}</div></SurfaceCard>

      
            <SurfaceCard
              label={labels.health}
            ><div><>



            <LabelledProgressRow props={{
            id: "active-rate",
            title: labels.activeRate,
            percent: activePercent,
            percentText: `${data?.activeMembers ?? 0}/${data?.totalMembers ?? 0}`
          }} isLoading={state === "resting"} /></></div></SurfaceCard>



      
        </>;
};

/** Stable typed root for the Academy growth block. */
export const AcademyGrowthSummaryBase = (props: AcademyGrowthSummaryProps) => <AcademyGrowthSummaryContent {...props} />;

