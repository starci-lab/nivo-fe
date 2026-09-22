import { BAND_CLASS_NAME, BANNER_CLASS_NAME, BREADCRUMB_LIST_CLASS_NAME, CAPTION_CLASS_NAME, ESCAPE_CLASS_NAME, FACT_CELL_CLASS_NAME, FACT_GRID_CLASS_NAME, FACT_ROW_CLASS_NAME, NOTICE_CLASS_NAME, ROW_BODY_CLASS_NAME, ROW_CLASS_NAME, ROW_HEAD_CLASS_NAME, SECTIONS_CLASS_NAME } from "./classNames";
import { Badge, Button, EmptyNotice, IconTile, PageContainer, PrimaryRailLayout, Progress, SectionHeader, SurfaceCard, Text, TextAction, type BadgeTone, type IconSource } from "@starci/grammar/common";
import type { PurchaseStatusCopy } from "./copy";

/** One source-qualified observation row in a rail; the circular mark is paired with its word so neither carries meaning alone. */
export type PurchaseStatusCheck = {
    readonly id: string;
    readonly label: string;
    readonly detail?: string;
    readonly at?: string;
    readonly word: string;
    readonly tone: BadgeTone;
    /** The semantic mark glyph the connected owner resolved from the app icon registry. */
    readonly mark: IconSource;
};

/** One label/value pair in a fact grid. */
export type PurchaseStatusFact = {
    readonly label: string;
    readonly value: string;
};

/** One ordered evidence row; `at` renders only when a real source timestamp exists. */
export type PurchaseStatusTimelineRow = {
    readonly id: string;
    readonly title: string;
    readonly detail?: string;
    readonly at?: string;
    /** The recorded-fact mark glyph the connected owner resolved from the app icon registry. */
    readonly mark: IconSource;
};

/** The provisioning surface's current-operation panel. */
export type PurchaseStatusOperation = {
    readonly heading: string;
    readonly name: string;
    readonly word: string;
    readonly tone: BadgeTone;
    readonly mark?: IconSource;
    readonly progressLabel: string;
    /** Ordinal position 0-100; omitted draws the unresolved indeterminate bar. */
    readonly progressValue?: number;
    readonly started?: string;
    readonly lastObservation?: string;
};

/** Resolved destinations the connected owner supplies; the view never builds a route. */
export type PurchaseStatusLinks = {
    readonly workspaces: string;
    readonly offerSelection: string;
};

/** Breadcrumb, heading and badge resolved for every state. */
export type PurchaseStatusHeadProps = {
    readonly copy: PurchaseStatusCopy;
    readonly links: PurchaseStatusLinks;
    readonly trail: ReadonlyArray<{
        readonly id: string;
        readonly label: string;
        readonly href?: string;
        readonly isCurrent?: boolean;
    }>;
    readonly title: string;
    readonly subtitle: string;
    readonly badge?: {
        readonly label: string;
        readonly tone: BadgeTone;
    };
};

/** The primary card: purchase facts on the payment surface, the running order on provisioning. */
export type PurchaseStatusPrimary = {
    readonly label: string;
    readonly fact?: string;
    readonly banner?: ReadonlyArray<string>;
    readonly facts: ReadonlyArray<PurchaseStatusFact>;
    readonly timeline?: ReadonlyArray<PurchaseStatusTimelineRow>;
    readonly operation?: PurchaseStatusOperation;
    readonly footnote?: string;
    readonly action?: {
        readonly label: string;
        readonly pending?: boolean;
    };
};

/** The rail: current verification on the payment surface, confirmed facts on provisioning. */
export type PurchaseStatusRail = {
    readonly label: string;
    readonly fact?: string;
    readonly latestCheck?: string;
    readonly checks: ReadonlyArray<PurchaseStatusCheck>;
    /** Confirmed identity rows (owner, fenced attempt); each renders as its own divided row. */
    readonly facts?: ReadonlyArray<PurchaseStatusFact>;
    readonly notice?: string;
    readonly outcome?: {
        readonly title: string;
        readonly detail?: string;
    };
    readonly action?: {
        readonly label: string;
        readonly pending?: boolean;
    };
    readonly actionCaption?: string;
    readonly secondaryLink?: {
        readonly label: string;
        readonly href: string;
    };
    readonly refusalText?: string;
};

/** Commands the connected owner binds; the view holds no request lifecycle. */
export type PurchaseStatusActions = {
    readonly primary?: () => void;
    readonly returnToList?: () => void;
};

/** Complete state/data/action contract for the purchase-status block. */
export type PurchaseStatusFlowViewProps = {
    readonly state: "loading";
    readonly props: PurchaseStatusHeadProps;
} | {
    readonly state: "denied";
    readonly props: PurchaseStatusHeadProps & {
        readonly message: string;
        readonly description?: string;
    };
    readonly on: PurchaseStatusActions;
} | {
    readonly state: "payment-pending" | "payment-unknown" | "payment-failed" | "paid" | "provisioning" | "provisioning-unknown" | "provisioning-failed-retryable" | "provisioning-failed-terminal" | "ready";
    readonly props: PurchaseStatusHeadProps & {
        readonly primary: PurchaseStatusPrimary;
        readonly rail: PurchaseStatusRail;
        /** Page-level escape link; used where the rail band already holds the onward action. */
        readonly escapeLink?: {
            readonly label: string;
            readonly href: string;
        };
    };
    readonly on: PurchaseStatusActions;
};

/** Public props contract of {@link PurchaseStatusFlowBase}; aliased so consumers see the component's own name. */
export type PurchaseStatusFlowProps = PurchaseStatusFlowViewProps;

const factCell = (fact: PurchaseStatusFact) => <div key={fact.label} className={FACT_CELL_CLASS_NAME}>
    <Text size="xs" tone="muted">{fact.label}</Text>
    <Text size="sm" overflow="wrap">{fact.value}</Text>
</div>;

const factRow = (fact: PurchaseStatusFact) => <div className={FACT_ROW_CLASS_NAME}>
    <Text size="sm" tone="muted">{fact.label}</Text>
    <Text size="sm" weight="semibold" overflow="wrap">{fact.value}</Text>
</div>;

const checkRow = (check: PurchaseStatusCheck) => <div key={check.id} className={ROW_CLASS_NAME}>
    <IconTile source={check.mark} tone={check.tone} size="sm" />
    <div className={ROW_BODY_CLASS_NAME}>
        <div className={ROW_HEAD_CLASS_NAME}>
            <Text size="sm" weight="semibold">{check.label}</Text>
            <Badge tone={check.tone}>{check.word}</Badge>
        </div>
        {check.at === undefined ? null : <Text size="xs" tone="muted">{check.at}</Text>}
        {check.detail === undefined ? null : <Text size="xs" tone="muted" overflow="wrap">{check.detail}</Text>}
    </div>
</div>;

const timelineRow = (row: PurchaseStatusTimelineRow) => <div key={row.id} className={ROW_CLASS_NAME}>
    <IconTile source={row.mark} tone="success" size="sm" />
    <div className={ROW_BODY_CLASS_NAME}>
        <Text size="sm" weight="semibold">{row.title}{row.at === undefined ? "" : ` — ${row.at}`}</Text>
        {row.detail === undefined ? null : <Text size="xs" tone="muted" overflow="wrap">{row.detail}</Text>}
    </div>
</div>;

const head = (props: PurchaseStatusHeadProps) => <>
    <nav aria-label={props.copy.path}>
        <ol className={BREADCRUMB_LIST_CLASS_NAME}>
            {props.trail.map((step, index) => <li key={step.id} className={BREADCRUMB_LIST_CLASS_NAME} aria-current={step.isCurrent === true ? "page" : undefined}>
                {index > 0 ? <span aria-hidden="true"><Text size="sm" tone="muted">›</Text></span> : null}
                {step.isCurrent === true || step.href === undefined
                    ? <Text size="sm" tone="muted">{step.label}</Text>
                    : <TextAction href={step.href} size="sm">{step.label}</TextAction>}
            </li>)}
        </ol>
    </nav>
    <SectionHeader level={1}
        title={<span>{props.title}{props.badge === undefined ? null : <>{" "}<Badge tone={props.badge.tone}>{props.badge.label}</Badge></>}</span>}
        description={<Text size="md" tone="muted">{props.subtitle}</Text>} />
</>;

const operationBand = (operation: PurchaseStatusOperation) => <div className={BAND_CLASS_NAME}>
    <Text size="xs" tone="muted">{operation.heading}</Text>
    <div className={ROW_HEAD_CLASS_NAME}>
        <Text size="md" weight="semibold">{operation.name}</Text>
        <Badge tone={operation.tone}>{operation.word}</Badge>
    </div>
    <Progress label={operation.progressLabel} value={operation.progressValue} />
    {operation.started === undefined ? null : <Text size="xs" tone="muted">{operation.started}</Text>}
    {operation.lastObservation === undefined ? null : <Text size="xs" tone="muted" overflow="wrap">{operation.lastObservation}</Text>}
</div>;

const primaryCard = (primary: PurchaseStatusPrimary, on: PurchaseStatusActions) => <SurfaceCard label={primary.label} fact={primary.fact} composition="joined" height="fill">
    {primary.banner === undefined ? null : <div className={BAND_CLASS_NAME}>
        <div className={BANNER_CLASS_NAME}>
            {primary.banner.map((part, index) => index === 0
                ? <Text key={index} weight="semibold">{part}</Text>
                : <Text key={index} size="sm" tone="muted">· {part}</Text>)}
        </div>
    </div>}
    <div className={BAND_CLASS_NAME}><div className={FACT_GRID_CLASS_NAME}>{primary.facts.map(factCell)}</div></div>
    {primary.operation === undefined ? null : operationBand(primary.operation)}
    {primary.timeline?.map(row => <div key={row.id} className={BAND_CLASS_NAME}>{timelineRow(row)}</div>)}
    {primary.footnote === undefined ? null : <div className={BAND_CLASS_NAME}><Text size="xs" tone="muted" overflow="wrap">{primary.footnote}</Text></div>}
    {primary.action === undefined ? null : <div className={BAND_CLASS_NAME}>
        <div><Button variant="primary" type="button" isPending={primary.action.pending} onPress={on.primary}>{primary.action.label}</Button></div>
    </div>}
</SurfaceCard>;

const railCard = (rail: PurchaseStatusRail, on: PurchaseStatusActions) => <SurfaceCard label={rail.label} fact={rail.fact} composition="joined" height="fill">
    {rail.latestCheck === undefined ? null : <div className={BAND_CLASS_NAME}>
        <Text size="sm" weight="semibold">{rail.latestCheck}</Text>
    </div>}
    {rail.checks.length === 0 ? null : <div className={BAND_CLASS_NAME}>{rail.checks.map(checkRow)}</div>}
    {rail.facts?.map(fact => <div key={fact.label} className={BAND_CLASS_NAME}>{factRow(fact)}</div>)}
    {rail.notice === undefined ? null : <div className={BAND_CLASS_NAME}>
        <div className={NOTICE_CLASS_NAME}>
            <Badge tone="warning">!</Badge>
            <Text size="sm" overflow="wrap">{rail.notice}</Text>
        </div>
    </div>}
    {rail.outcome === undefined ? null : <div className={BAND_CLASS_NAME}>
        <Text size="sm" weight="semibold" overflow="wrap">{rail.outcome.title}</Text>
        {rail.outcome.detail === undefined ? null : <Text size="xs" tone="muted" overflow="wrap">{rail.outcome.detail}</Text>}
    </div>}
    {rail.action === undefined && rail.secondaryLink === undefined && rail.refusalText === undefined ? null : <div className={BAND_CLASS_NAME}>
        {rail.action === undefined ? null : <Button variant="primary" size="lg" width="fill" type="button" isPending={rail.action.pending} onPress={on.primary}>{rail.action.label}</Button>}
        {rail.actionCaption === undefined ? null : <div className={CAPTION_CLASS_NAME}><Text size="xs" tone="muted" overflow="wrap">{rail.actionCaption}</Text></div>}
        {rail.refusalText === undefined ? null : <Text size="sm" live="polite" overflow="wrap">{rail.refusalText}</Text>}
        {rail.secondaryLink === undefined ? null : <TextAction href={rail.secondaryLink.href} size="sm" onFollow={on.returnToList}>{rail.secondaryLink.label}</TextAction>}
    </div>}
</SurfaceCard>;

const skeletonBand = (lines: number) => <div className={BAND_CLASS_NAME}>
    {Array.from({ length: lines }, (_, index) => <Text key={index} size="sm" isSkeleton>Loading</Text>)}
</div>;

/** Draw every purchase-status state from resolved props; data and routes belong to the connected owner. */
export const PurchaseStatusFlowBase = (props: PurchaseStatusFlowProps) => {
    const { state } = props;
    if (state === "loading") {
        const copy = props.props.copy;
        return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} aria-busy="true" data-contract="GAP-5">
            {head(props.props)}
            <PrimaryRailLayout railWidth="standard" collapsedOrder="primary-first" align="start"
                primary={<SurfaceCard label={copy.purchaseFactsLabel} composition="joined">{skeletonBand(4)}</SurfaceCard>}
                rail={<SurfaceCard label={copy.verificationLabel} composition="joined">{skeletonBand(3)}<div className={BAND_CLASS_NAME}><Text size="sm" isSkeleton>Loading</Text></div></SurfaceCard>} />
        </div></PageContainer>;
    }
    if (state === "denied") {
        return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
            {head(props.props)}
            <SurfaceCard label={props.props.copy.purchases} composition="single">
                <EmptyNotice message={props.props.message} description={props.props.description} actionLabel={props.props.copy.returnToList} onAction={props.on.returnToList} />
            </SurfaceCard>
        </div></PageContainer>;
    }
    const { primary, rail, escapeLink } = props.props;
    return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
        {head(props.props)}
        <PrimaryRailLayout railWidth="standard" collapsedOrder="primary-first" align="start"
            primary={primaryCard(primary, props.on)}
            rail={railCard(rail, props.on)} />
        {escapeLink === undefined ? null : <div className={ESCAPE_CLASS_NAME}>
            <TextAction href={escapeLink.href} size="sm" onFollow={props.on.returnToList}>{escapeLink.label}</TextAction>
        </div>}
    </div></PageContainer>;
};
