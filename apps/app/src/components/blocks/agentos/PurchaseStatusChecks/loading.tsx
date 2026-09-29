import { Badge, Button, IconTile, PrimaryRailLayout, Progress, SurfaceCard, Text, type IconSource } from "@starci/grammar/common"
import type { PurchaseStatusCopy } from "@/modules/agentos/purchase-status/copy"
import {
    BAND_CLASS_NAME,
    BANNER_CLASS_NAME,
    FACT_CELL_CLASS_NAME,
    FACT_GRID_CLASS_NAME,
    FACT_ROW_CLASS_NAME,
    NOTICE_CLASS_NAME,
    ROW_BODY_CLASS_NAME,
    ROW_CLASS_NAME,
    ROW_HEAD_CLASS_NAME,
    SKELETON_BANNER_RESERVED_CLASS_NAME,
    SKELETON_CAPTION_CLASS_NAME,
    SKELETON_FACT_ROW_RESERVED_CLASS_NAME,
    SKELETON_FOOTNOTE_RESERVED_CLASS_NAME,
} from "./classNames"

type PurchaseStatusLoadingPreviewProps = {
    readonly copy: PurchaseStatusCopy
    readonly surface?: "provisioning"
}

const skeletonMark: IconSource = () => null

const skeletonLine = (size: "xs" | "sm" | "md", label: string) => (
    <Text size={size} isSkeleton>
        {label}
    </Text>
)

const skeletonLabelEnd = (label: string) => (
    <Text size="md" isSkeleton>
        {label}
    </Text>
)

const skeletonFactCell = (key: string, label: string) => (
    <div key={key} className={FACT_CELL_CLASS_NAME}>
        {skeletonLine("xs", label)}
        {skeletonLine("sm", label)}
    </div>
)

const skeletonFactBand = (id: string, cells: number, label: string) => (
    <div key={id} className={BAND_CLASS_NAME}>
        <div className={FACT_GRID_CLASS_NAME}>
            {Array.from({ length: cells }, (_, index) => skeletonFactCell(`${id}-${index}`, label))}
        </div>
    </div>
)

const skeletonCheckRow = (key: string, label: string, withAt = false) => (
    <div key={key} className={ROW_CLASS_NAME}>
        <IconTile source={skeletonMark} tone="neutral" size="sm" isSkeleton />
        <div className={ROW_BODY_CLASS_NAME}>
            <div className={ROW_HEAD_CLASS_NAME}>
                {skeletonLine("sm", label)}
                <Badge isSkeleton>{label}</Badge>
            </div>
            {withAt ? skeletonLine("xs", label) : null}
            {skeletonLine("xs", label)}
        </div>
    </div>
)

const skeletonTimelineRow = (key: string, label: string) => (
    <div key={key} className={BAND_CLASS_NAME}>
        <div className={ROW_CLASS_NAME}>
            <IconTile source={skeletonMark} tone="neutral" size="sm" isSkeleton />
            <div className={ROW_BODY_CLASS_NAME}>
                {skeletonLine("sm", label)}
                {skeletonLine("xs", label)}
            </div>
        </div>
    </div>
)

const skeletonFactRow = (key: string, label: string, reserved = false) => (
    <div key={key} className={reserved ? SKELETON_FACT_ROW_RESERVED_CLASS_NAME : BAND_CLASS_NAME}>
        <div className={FACT_ROW_CLASS_NAME}>
            {skeletonLine("sm", label)}
            {skeletonLine("sm", label)}
        </div>
    </div>
)

const paymentLoadingPrimary = (copy: PurchaseStatusCopy) => (
    <SurfaceCard label={copy.purchaseFactsLabel} labelEnd={skeletonLabelEnd(copy.loading)} composition="joined" height="fill">
        <div className={SKELETON_BANNER_RESERVED_CLASS_NAME}>
            <div className={BANNER_CLASS_NAME}>
                {skeletonLine("md", copy.loading)}
                {skeletonLine("sm", copy.loading)}
                {skeletonLine("sm", copy.loading)}
            </div>
        </div>
        {skeletonFactBand("facts", 8, copy.loading)}
        {["order", "invoice", "read"].map((key) => skeletonTimelineRow(key, copy.loading))}
    </SurfaceCard>
)

const paymentLoadingRail = (copy: PurchaseStatusCopy) => (
    <SurfaceCard label={copy.verificationLabel} composition="joined" height="fill">
        <div className={BAND_CLASS_NAME}>{skeletonLine("sm", copy.loading)}</div>
        <div className={BAND_CLASS_NAME}>
            {["provider", "amount", "canonical", "admission"].map((key) =>
                skeletonCheckRow(key, copy.loading, key === "provider"),
            )}
        </div>
        <div className={BAND_CLASS_NAME}>
            <div className={NOTICE_CLASS_NAME}>
                <Badge isSkeleton>!</Badge>
                <div className={ROW_BODY_CLASS_NAME}>
                    {skeletonLine("sm", copy.loading)}
                    {skeletonLine("xs", copy.loading)}
                </div>
            </div>
        </div>
        <div className={BAND_CLASS_NAME}>
            <Button variant="primary" size="lg" width="fill" type="button" isSkeleton>
                {copy.loading}
            </Button>
            <div className={SKELETON_CAPTION_CLASS_NAME}>{skeletonLine("xs", copy.loading)}</div>
            {skeletonLine("sm", copy.loading)}
        </div>
    </SurfaceCard>
)

const provisioningLoadingPrimary = (copy: PurchaseStatusCopy) => (
    <SurfaceCard label={copy.provisioningOrderLabel} composition="joined" height="fill">
        {skeletonFactBand("identity", 6, copy.loading)}
        {skeletonFactBand("cadence", 2, copy.loading)}
        <div className={BAND_CLASS_NAME}>
            {skeletonLine("xs", copy.loading)}
            <div className={ROW_HEAD_CLASS_NAME}>
                {skeletonLine("md", copy.loading)}
                <Badge isSkeleton>{copy.loading}</Badge>
            </div>
            <Progress label={copy.loadingTitle} isSkeleton />
            {skeletonLine("xs", copy.loading)}
        </div>
        <div className={SKELETON_FOOTNOTE_RESERVED_CLASS_NAME}>{skeletonLine("xs", copy.loading)}</div>
        <div className={BAND_CLASS_NAME}>
            <div>
                <Button variant="primary" type="button" isSkeleton>
                    {copy.loading}
                </Button>
            </div>
        </div>
    </SurfaceCard>
)

const provisioningLoadingRail = (copy: PurchaseStatusCopy) => (
    <SurfaceCard
        label={copy.confirmedFactsLabel}
        labelEnd={skeletonLabelEnd(copy.loading)}
        composition="joined"
        height="fill"
    >
        <div className={BAND_CLASS_NAME}>
            {["payment", "entitlement", "configure", "readiness"].map((key) =>
                skeletonCheckRow(key, copy.loading, key === "configure"),
            )}
        </div>
        {skeletonFactRow("owner", copy.loading, true)}
        {skeletonFactRow("attempt", copy.loading)}
        <div className={BAND_CLASS_NAME}>
            {skeletonLine("sm", copy.loading)}
            {skeletonLine("xs", copy.loading)}
        </div>
    </SurfaceCard>
)

/** Keep each loading placeholder at the same card rank as its resolved surface. */
export const PurchaseStatusLoadingPreview = (props: PurchaseStatusLoadingPreviewProps) => {
    const { copy, surface } = props
    const provisioning = surface === "provisioning"
    return (
        <PrimaryRailLayout
            railWidth="standard"
            collapsedOrder="primary-first"
            align="start"
            primary={provisioning ? provisioningLoadingPrimary(copy) : paymentLoadingPrimary(copy)}
            rail={provisioning ? provisioningLoadingRail(copy) : paymentLoadingRail(copy)}
        />
    )
}
