import { SECTIONS_CLASS_NAME, CONTENT_CLASS_NAME, SHELL_FACETS_CLASS_NAME, SHELL_NOTICE_CLASS_NAME, SHELL_SOURCE_TIME_CLASS_NAME } from "./classNames";
import { AgentOSSolutionModuleCenter } from "@/components/blocks/agentos/AgentOSSolutionModuleCenter";
import { AgentOSWorkspaceAiKnowledge } from "@/components/blocks/agentos/AgentOSWorkspaceAiKnowledge";
import { AgentOSWorkspaceApplications } from "@/components/blocks/agentos/AgentOSWorkspaceApplications";
import { AgentOSWorkspaceRuntime } from "@/components/blocks/agentos/AgentOSWorkspaceRuntime";
import { AgentOSWorkspaceSummary } from "@/components/blocks/agentos/AgentOSWorkspaceSummary";
import { AgentOSWorkspaceOperations } from "@/components/blocks/operations/AgentOSWorkspaceOperations";
import { HelmStackSnapshot } from "@/components/blocks/operations/HelmStackSnapshot";
import type { AgentWorkspaceControlCenter } from "@/modules/api/console";
import type { ShellSourceIdentity } from "@/modules/api/agentos-shell";
import type { ShellSessionStanding, ShellSourceObservation, ShellSourceStanding } from "@/modules/agentos/shell-observation-store";
import { SectionHeader as DirectionHeader, PrimaryRailLayout as DirectionLayout, PageContainer as DirectionPage, Tabs as DirectionTabs, Badge, EmptyNotice, StaticStateRow, SurfaceCard, SurfaceListCard, Text, TextAction } from "@starci/grammar/common";

/** The sign-in address the product already publishes (ConsoleLayout and SessionEndingDialog agree). */
export const AGENT_OS_SIGN_IN_HREF = "/authentication";

/**
 * Which situation the connected shell is showing.
 *
 * The names are the accepted direction's own states; the projection below is the only place that
 * decides which one the current observations have earned. Nothing here is inferred from a sibling
 * facet - a state is entered from the source that owns the fact.
 */
type AgentOSShellViewState = "loading" | "sign-in-required" | "access-unverified" | "access-denied" | "no-runtime" | "installed-current" | "installed-empty" | "evidence-limited" | "last-known" | "retrying" | "operation-pending" | "operation-confirmed" | "operation-uncertain";

/** How one source-qualified facet stands, kept apart from every sibling facet. */
export type AgentOSShellFacetStanding = "current" | "partial" | "stale" | "unavailable" | "unsupported" | "refused" | "loading" | "unresolved";

/**
 * Where one returned receiver-owned operation stands.
 *
 * `pending` is the receiver's acceptance without a result - it is never a confirmation.
 * `confirmed` requires a receiver `final` observation on a settled queue; `uncertain` covers every
 * ambiguous or delayed answer (`possible_start`, `quarantined`, a cancelled start, an outcome the
 * receiver itself could not classify). A source that did not settle stays its own facet standing.
 */
export type AgentOSShellOperationStanding = "pending" | "confirmed" | "uncertain" | AgentOSShellFacetStanding;

/** One returned operation exactly as its own receiver receipt carries it. */
export interface AgentOSShellOperationView {
    readonly installationId: string;
    readonly intentId: string;
    readonly commandId: string | null;
    readonly receiverName: string;
    readonly standing: AgentOSShellOperationStanding;
    readonly observedAt: string | null;
}

/** One installation exactly as its own inventory row carries it, with its own configuration facet. */
export interface AgentOSShellInstallationView {
    readonly installationId: string;
    readonly moduleKey: string | null;
    readonly displayName: string;
    readonly status: string | null;
    readonly configuration: {
        readonly standing: AgentOSShellFacetStanding;
        readonly desiredDigest: string | null;
        readonly testedDigest: string | null;
        readonly appliedDigest: string | null;
        readonly observedAt: string | null;
    } | null;
}

/** The settled connected-shell view the drawing half renders; every string is already resolved. */
export interface AgentOSShellView {
    readonly state: AgentOSShellViewState;
    readonly workspaceId: string | null;
    readonly instanceId: string | null;
    readonly name: string | null;
    readonly identityObservedAt: string | null;
    readonly inventoryStanding: AgentOSShellFacetStanding;
    readonly inventoryObservedAt: string | null;
    /** True only on a current, complete, authorized zero inventory - the permitted empty answer. */
    readonly inventoryEmpty: boolean;
    readonly runtimeStanding: AgentOSShellFacetStanding;
    readonly runtimeAvailability: string | null;
    readonly runtimeGeneration: string | null;
    readonly runtimeObservedAt: string | null;
    readonly installations: ReadonlyArray<AgentOSShellInstallationView>;
    readonly attentionStanding: AgentOSShellFacetStanding;
    readonly attentionObservedAt: string | null;
    readonly operations: ReadonlyArray<AgentOSShellOperationView>;
    readonly retrying: boolean;
}

/** Everything the projection reads off the connected shell; the handle satisfies it structurally. */
export interface AgentOSShellReading {
    readonly session: ShellSessionStanding;
    readonly sessionStatus: string;
    readonly sources: ReadonlyArray<ShellSourceObservation>;
}

/** Bilingual copy the settled shell view is rendered from, resolved before the drawing half runs. */
export interface AgentOSWorkspaceControlCenterShellLabels {
    readonly headingFallback: string;
    readonly eyebrow: string;
    readonly description: string;
    readonly signInRequired: string;
    readonly signInAction: string;
    readonly accessDenied: string;
    readonly accessUnverified: string;
    readonly retry: string;
    readonly loading: string;
    readonly sourceTime: string;
    readonly identityInstance: string;
    readonly inventorySection: string;
    readonly inventoryEmpty: string;
    readonly inventoryEmptyDescription: string;
    readonly inventoryLimitPartial: string;
    readonly inventoryLimitStale: string;
    readonly inventoryLimitUnavailable: string;
    readonly inventoryLimitUnsupported: string;
    readonly inventoryLimitRefused: string;
    readonly inventoryLimitLoading: string;
    readonly lastKnown: string;
    readonly retrying: string;
    readonly runtimeSection: string;
    readonly runtimeProvisioned: string;
    readonly runtimeNotProvisioned: string;
    readonly runtimeUnavailable: string;
    readonly runtimeUnknown: string;
    readonly configurationSection: string;
    readonly configurationCurrent: string;
    readonly configurationAbsent: string;
    readonly configurationUnsupported: string;
    readonly attentionSection: string;
    readonly attentionUnsupported: string;
    readonly resultSection: string;
    readonly resultUnavailable: string;
    readonly resultPending: string;
    readonly resultConfirmed: string;
    readonly resultUncertain: string;
    readonly resultRecheck: string;
    readonly installEntry: string;
}

/** One string field of a source payload, or null when the payload does not carry it. */
const payloadText = (payload: Readonly<Record<string, unknown>> | null, key: string): string | null => {
    const value = payload === null ? null : payload[key];
    return typeof value === "string" && value.length > 0 ? value : null;
};

/** The installation rows a payload carries, or null when it carries no row array at all. */
const payloadRows = (payload: Readonly<Record<string, unknown>> | null): ReadonlyArray<Readonly<Record<string, unknown>>> | null => {
    const value = payload === null ? null : payload.installations;
    if (!Array.isArray(value)) return null;
    return value.filter((entry): entry is Readonly<Record<string, unknown>> => typeof entry === "object" && entry !== null);
};

/** The three-way configuration identity one configuration payload reports, digests kept separate. */
const configurationOf = (payload: Readonly<Record<string, unknown>> | null) => {
    const identity = payload === null ? null : payload.configurationIdentity;
    if (typeof identity !== "object" || identity === null) return null;
    const digests = identity as Readonly<Record<string, unknown>>;
    const digestOf = (key: string): string | null => {
        const value = digests[key];
        return typeof value === "string" && value.length > 0 ? value : null;
    };
    return {
        desiredDigest: digestOf("desiredDigest"),
        testedDigest: digestOf("testedDigest"),
        appliedDigest: digestOf("appliedDigest")
    };
};

/** How deep a facet's standing is, so several sources can be read as one situation without merging them. */
const standingOf = (observation: ShellSourceObservation | null): AgentOSShellFacetStanding => {
    if (observation === null) return "unresolved";
    if (observation.state === "available" || observation.state === "partial") {
        if (observation.freshness === "stale") return "stale";
        return observation.state === "partial" ? "partial" : "current";
    }
    return observation.state;
};

/** One source's own observation, matched by the identity the shell allocated for it. */
const observationOf = (sources: ReadonlyArray<ShellSourceObservation>, kind: ShellSourceIdentity["kind"], installationId?: string): ShellSourceObservation | null => {
    for (const observation of sources) {
        const identity: ShellSourceIdentity = observation.identity;
        if (identity.kind !== kind) continue;
        if (installationId === undefined) return observation;
        if ("installationId" in identity && identity.installationId === installationId) return observation;
    }
    return null;
};

/** Whether this standing still settles nothing of its own, so the view keeps waiting for it. */
const isSettling = (standing: ShellSourceStanding): boolean => standing === "unresolved" || standing === "loading";

/** One receiver observation's operation standing, taken from the receipt's own queue state. */
const operationStandingOf = (observation: ShellSourceObservation): AgentOSShellOperationStanding => {
    const standing = standingOf(observation);
    if (standing !== "current" && standing !== "partial") return standing;
    const payload = observation.payload;
    const queueState = payloadText(payload, "queueState");
    const entries = payload === null || !Array.isArray(payload.observations) ? [] : payload.observations;
    const kinds = entries.map(entry => typeof entry === "object" && entry !== null ? (entry as Readonly<Record<string, unknown>>).kind : null);
    // The receiver's own unknown beats every hopeful reading; an ambiguous queue state is never
    // presented as a confirmed outcome.
    if (kinds.includes("outcome_unknown") || queueState === "possible_start" || queueState === "quarantined" || queueState === "cancelled_before_start") return "uncertain";
    if (queueState === "settled") return kinds.includes("final") ? "confirmed" : "uncertain";
    if (queueState === "queued" || queueState === "claimed") return "pending";
    return "uncertain";
};

/**
 * Project the connected shell onto one settled view.
 *
 * WHY THE DECISION LIVES HERE. Every source answers for itself, so the surface reading of those
 * answers is one pure function of the observations rather than a comparison each component makes
 * for itself: an owner may see a current inventory beside an unavailable runtime, and only this
 * projection decides that is an evidence limit rather than an empty or all-ready workspace.
 */
export const projectAgentOSShellView = (reading: AgentOSShellReading, labels: AgentOSWorkspaceControlCenterShellLabels): AgentOSShellView => {
    const identity = observationOf(reading.sources, "core_registry");
    const inventory = observationOf(reading.sources, "installation_inventory");
    const runtime = observationOf(reading.sources, "runtime");
    const attention = observationOf(reading.sources, "attention");
    const inventoryStanding = standingOf(inventory);
    const runtimeStanding = standingOf(runtime);
    const attentionStanding = standingOf(attention);
    const rows = payloadRows(inventory === null ? null : inventory.payload);
    const installations: ReadonlyArray<AgentOSShellInstallationView> = rows === null ? [] : rows.flatMap(row => {
        const installationId = payloadText(row, "installationId");
        if (installationId === null) return [];
        const configuration = observationOf(reading.sources, "configuration", installationId);
        const digests = configurationOf(configuration === null ? null : configuration.payload);
        return [{
            installationId,
            moduleKey: payloadText(row, "moduleKey"),
            displayName: payloadText(row, "displayName") ?? installationId,
            status: payloadText(row, "status"),
            configuration: configuration === null ? null : {
                standing: standingOf(configuration),
                observedAt: configuration.observedAt,
                desiredDigest: digests === null ? null : digests.desiredDigest,
                testedDigest: digests === null ? null : digests.testedDigest,
                appliedDigest: digests === null ? null : digests.appliedDigest
            }
        }];
    });
    const base = {
        workspaceId: payloadText(identity === null ? null : identity.payload, "workspaceId"),
        instanceId: payloadText(identity === null ? null : identity.payload, "instanceId"),
        // The heading is always renderable: an identity the source did not name falls back to the
        // shell's own copy here rather than making the drawing half choose a word.
        name: payloadText(identity === null ? null : identity.payload, "name") ?? labels.headingFallback,
        identityObservedAt: identity === null ? null : identity.observedAt,
        inventoryStanding,
        inventoryObservedAt: inventory === null ? null : inventory.observedAt,
        inventoryEmpty: inventoryStanding === "current" && inventory !== null && inventory.completeness === "complete" && installations.length === 0,
        runtimeStanding,
        runtimeAvailability: payloadText(runtime === null ? null : runtime.payload, "runtimeAvailability"),
        runtimeGeneration: payloadText(runtime === null ? null : runtime.payload, "runtimeGeneration"),
        runtimeObservedAt: runtime === null ? null : runtime.observedAt,
        installations,
        attentionStanding,
        attentionObservedAt: attention === null ? null : attention.observedAt,
        operations: [] as ReadonlyArray<AgentOSShellOperationView>
    };
    // 1. No session, or a session nobody has settled yet: nothing about this scope is disclosed.
    if (reading.session === "sign-in-required" || reading.sessionStatus === "anonymous") return { ...base, state: "sign-in-required", workspaceId: null, instanceId: null, name: null, identityObservedAt: null, installations: [], retrying: false };
    if (reading.sessionStatus === "restoring") return { ...base, state: "loading", workspaceId: null, instanceId: null, name: null, identityObservedAt: null, installations: [], retrying: false };
    // 2. A refusal is an authorization judgment: it clears private content and is never a limit.
    if (runtimeStanding === "refused" || inventoryStanding === "refused" || attentionStanding === "refused" || (identity !== null && identity.state === "refused")) return { ...base, state: "access-denied", name: null, identityObservedAt: null, installations: [], retrying: false };
    // 3. A signed-in owner whose access cannot be established: retryable, and it asks for no sign-in.
    if (reading.session === "access-unestablished") return { ...base, state: "access-unverified", retrying: false };
    const operations: ReadonlyArray<AgentOSShellOperationView> = reading.sources.flatMap(source => {
        const sourceIdentity = source.identity;
        if (sourceIdentity.kind !== "receiver") return [];
        const receiver = installations.find(installation => installation.installationId === sourceIdentity.installationId);
        return [{
            installationId: sourceIdentity.installationId,
            intentId: sourceIdentity.intentId,
            commandId: payloadText(source.payload, "commandId"),
            receiverName: receiver === undefined ? sourceIdentity.installationId : receiver.displayName,
            standing: operationStandingOf(source),
            observedAt: source.observedAt
        }];
    });
    const settledView = { ...base, operations };
    const settled = [identity, inventory, runtime].filter(observation => observation !== null && !isSettling(observation.state)).length;
    const settling = [identity, inventory, runtime].some((observation): boolean => observation === null || isSettling(observation.state));
    if (settled === 0) return { ...settledView, state: "loading", name: null, identityObservedAt: null, installations: [], operations: [], retrying: false };
    // 4. Nothing but an outage: every whole-selection source answered the same way, so this is a
    //    verification failure to retry rather than a permission decision to accept.
    if (!settling && identity !== null && inventory !== null
        && (identity.state === "unavailable" || identity.state === "unsupported")
        && (inventoryStanding === "unavailable" || inventoryStanding === "unsupported")) {
        return { ...settledView, state: "access-unverified", name: null, identityObservedAt: null, installations: [], operations: [], retrying: false };
    }
    const contentState: AgentOSShellViewState = (() => {
        // 5. A facet that is still reading while its siblings settled is the retried facet, not a fresh load.
        if (settling) return "retrying";
        // 6. An authorized workspace whose runtime is absent keeps its identity and says so plainly.
        if (base.runtimeAvailability === "not_provisioned") return "no-runtime";
        // 7. Only a current, complete, authorized observation may call the installation list empty.
        if (inventoryStanding === "current" && inventory !== null && inventory.completeness === "complete" && installations.length === 0) return "installed-empty";
        if (installations.length > 0 && (inventoryStanding === "current" || inventoryStanding === "partial")) {
            const limited = inventoryStanding !== "current" || runtimeStanding !== "current" || attentionStanding !== "unsupported" || installations.some(installation => installation.configuration !== null && installation.configuration.standing !== "current");
            return limited ? "evidence-limited" : "installed-current";
        }
        // 8. A stale observation is shown as last-known, never as current.
        if (inventoryStanding === "stale") return "last-known";
        return "evidence-limited";
    })();
    // 9. A returned operation owns the situation once the selection settled: its receiver source,
    //    not a sibling facet, decides pending, confirmed or uncertain - and never a success claim.
    const operationState = operations.some(operation => operation.standing === "uncertain") ? "operation-uncertain"
        : operations.some(operation => operation.standing === "pending") ? "operation-pending"
        : operations.length > 0 && operations.every(operation => operation.standing === "confirmed") ? "operation-confirmed"
        : null;
    return { ...settledView, state: operationState ?? contentState, retrying: contentState === "retrying" };
};

/** The one sentence a limited facet owes its reader, chosen by that source's own standing. */
const facetLimitOf = (standing: AgentOSShellFacetStanding, labels: AgentOSWorkspaceControlCenterShellLabels): string => {
    if (standing === "stale") return labels.inventoryLimitStale;
    if (standing === "unavailable") return labels.inventoryLimitUnavailable;
    if (standing === "unsupported") return labels.inventoryLimitUnsupported;
    if (standing === "refused") return labels.inventoryLimitRefused;
    if (standing === "loading" || standing === "unresolved") return labels.inventoryLimitLoading;
    return labels.inventoryLimitPartial;
};

/** The runtime facet's own value: what the runtime source said, never what a neighbour implied. */
const runtimeValueOf = (view: AgentOSShellView, labels: AgentOSWorkspaceControlCenterShellLabels): string => {
    if (view.runtimeStanding === "unsupported" || view.runtimeStanding === "refused") return facetLimitOf(view.runtimeStanding, labels);
    if (view.runtimeAvailability === "provisioned") return labels.runtimeProvisioned;
    if (view.runtimeAvailability === "not_provisioned") return labels.runtimeNotProvisioned;
    if (view.runtimeAvailability === "unavailable") return labels.runtimeUnavailable;
    return labels.runtimeUnknown;
};

/** One source-qualified fact: the label names its source, the value is what that source answered. */
type ShellFacetProps = {
    readonly label: string;
    readonly value: string;
    readonly fact?: string;
};
const ShellFacet = (props: ShellFacetProps) => <SurfaceCard label={props.label} {...(props.fact === undefined ? {} : { fact: props.fact })}><Text size="md">{props.value}</Text></SurfaceCard>;

/** The one sentence an operation's own receipt owes its reader, chosen by its settled standing. */
const operationValueOf = (operation: AgentOSShellOperationView, labels: AgentOSWorkspaceControlCenterShellLabels): string => {
    if (operation.standing === "pending") return labels.resultPending;
    if (operation.standing === "confirmed") return labels.resultConfirmed;
    if (operation.standing === "uncertain") return labels.resultUncertain;
    return facetLimitOf(operation.standing, labels);
};

/** One returned operation's own result card: exact receiver, its standing and its source time. */
export type AgentOSShellOperationRegionProps = {
    readonly operations: ReadonlyArray<AgentOSShellOperationView>;
    readonly labels: AgentOSWorkspaceControlCenterShellLabels;
    readonly formatDate: (value: string) => string;
    readonly onRecheck?: (installationId: string, intentId: string) => void;
    readonly recheckPending?: boolean;
};
/**
 * The returned operations' own result region: each receiver receipt is its own card, and a recheck
 * is only ever a fresh read of that same receipt - a confirmed standing offers no further action.
 */
export const AgentOSShellOperationRegion = (props: AgentOSShellOperationRegionProps) => {
    const { operations, labels, formatDate, onRecheck, recheckPending }: AgentOSShellOperationRegionProps = props;
    return <>
        {operations.map(operation => <SurfaceCard key={`receiver:{${operation.installationId},${operation.intentId}}`} label={`${labels.resultSection} · ${operation.receiverName}`} fact={operation.observedAt === null ? undefined : formatDate(operation.observedAt)}>
            <Text size="md">{operationValueOf(operation, labels)}</Text>
            <Text size="sm" tone="muted">{[operation.installationId, operation.intentId, operation.commandId].filter((part): part is string => part !== null).join(" · ")}</Text>
            {onRecheck === undefined || operation.standing === "confirmed" ? null : <TextAction onPress={() => onRecheck(operation.installationId, operation.intentId)} isPending={recheckPending === true}>{labels.resultRecheck}</TextAction>}
        </SurfaceCard>)}
    </>;
};

/**
 * The connected shell's own regions: the installation peer list, the permitted empty notice and the
 * separate source-qualified facets. It draws only what the projection settled.
 */
type AgentOSShellRegionsProps = {
    readonly view: AgentOSShellView;
    readonly labels: AgentOSWorkspaceControlCenterShellLabels;
    readonly formatDate: (value: string) => string;
    readonly onRetry?: () => void;
    readonly retrying?: boolean;
    readonly onRecheckOperation?: (installationId: string, intentId: string) => void;
};
/** The connected shell's own regions: the installation peer list, the permitted empty notice and the separate source-qualified facets; it draws only what the projection settled. */
const AgentOSShellRegions = (props: AgentOSShellRegionsProps) => {
    const { view, labels, formatDate, onRetry, retrying, onRecheckOperation }: AgentOSShellRegionsProps = props;
    const inventoryFact = view.inventoryStanding === "current" && view.inventoryObservedAt !== null ? formatDate(view.inventoryObservedAt) : undefined;
    return <>
        <SurfaceListCard label={labels.inventorySection} {...(inventoryFact === undefined ? {} : { fact: inventoryFact })}>
            {view.installations.map(installation => <StaticStateRow key={installation.installationId} item={{
                id: installation.installationId,
                label: installation.displayName,
                description: [installation.moduleKey, installation.status, installation.installationId].filter((part): part is string => part !== null).join(" · ")
            }}/>)}
        </SurfaceListCard>
        {view.state === "installed-empty" ? <EmptyNotice message={labels.inventoryEmpty} description={labels.inventoryEmptyDescription}/> : null}
        {view.inventoryStanding !== "current" ? <SurfaceCard label={labels.inventorySection}><Text size="md" tone="muted">{facetLimitOf(view.inventoryStanding, labels)}</Text>{onRetry === undefined ? null : <TextAction onPress={onRetry} isPending={retrying === true}>{labels.retry}</TextAction>}</SurfaceCard> : null}
        <AgentOSShellOperationRegion operations={view.operations} labels={labels} formatDate={formatDate} onRecheck={onRecheckOperation} recheckPending={retrying}/>
        <div className={SHELL_FACETS_CLASS_NAME}>
            <ShellFacet label={labels.runtimeSection} fact={view.runtimeObservedAt === null ? undefined : formatDate(view.runtimeObservedAt)} value={runtimeValueOf(view, labels)}/>
            {view.installations.map(installation => <ShellFacet key={"configuration-" + installation.installationId} label={labels.configurationSection + " · " + installation.displayName} fact={installation.configuration?.observedAt === null || installation.configuration === null ? undefined : formatDate(installation.configuration.observedAt)} value={installation.configuration === null ? labels.configurationUnsupported : installation.configuration.standing === "current" ? labels.configurationCurrent.replace("{desired}", installation.configuration.desiredDigest ?? "-").replace("{tested}", installation.configuration.testedDigest ?? "-").replace("{applied}", installation.configuration.appliedDigest ?? "-") : installation.configuration.standing === "unsupported" ? labels.configurationUnsupported : labels.configurationAbsent}/>)}
            <ShellFacet label={labels.attentionSection} fact={view.attentionObservedAt === null ? undefined : formatDate(view.attentionObservedAt)} value={view.attentionStanding === "unsupported" || view.attentionStanding === "unresolved" ? labels.attentionUnsupported : facetLimitOf(view.attentionStanding, labels)}/>
            {view.operations.length === 0 ? <ShellFacet label={labels.resultSection} value={labels.resultUnavailable}/> : null}
        </div>
    </>;
};

/** One settled access state: a retryable verification failure, a refusal, or a sign-in affordance. */
type AgentOSShellAccessNoticeProps = {
    readonly state: AgentOSShellViewState;
    readonly labels: AgentOSWorkspaceControlCenterShellLabels;
    readonly onRetry?: () => void;
    readonly retrying?: boolean;
};
/** One settled access state: a retryable verification failure, a refusal, or a sign-in affordance that discloses no scope. */
const AgentOSShellAccessNotice = (props: AgentOSShellAccessNoticeProps) => {
    const { state, labels, onRetry, retrying }: AgentOSShellAccessNoticeProps = props;
    if (state === "sign-in-required") return <div className={SHELL_NOTICE_CLASS_NAME}><Text size="md" tone="muted">{labels.signInRequired}</Text><TextAction href={AGENT_OS_SIGN_IN_HREF}>{labels.signInAction}</TextAction></div>;
    return <EmptyNotice message={state === "access-denied" ? labels.accessDenied : labels.accessUnverified} actionLabel={onRetry === undefined ? undefined : labels.retry} isActionPending={retrying === true} onAction={onRetry}/>;
};

/** Page-level compositions available inside one workspace control center. */
type AgentOSWorkspaceControlCenterProps = AgentOSWorkspaceControlCenterViewProps;
/** Public API role for AgentOSWorkspacePageState. */
export type AgentOSWorkspacePageState = "overview" | "solutions" | "ai-knowledge" | "applications" | "infrastructure" | "operations" | "access";
/** Request-owned situations for the workspace control-center aggregate. */
export type AgentOSWorkspaceControlCenterState = "loading" | "refused" | "ready";
/** Fully resolved bilingual copy passed into the pure workspace page. */
export type AgentOSWorkspaceControlCenterLabels = {
    readonly titleFallback: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly stateSection?: string;
    readonly readyStatus?: string;
    readonly loadingTitle?: string;
    readonly refusedTitle?: string;
    readonly retry?: string;
    readonly loading: string;
    readonly accessUnavailable: string;
    readonly tabsLabel: string;
    readonly shell: AgentOSWorkspaceControlCenterShellLabels;
    readonly tabs: ReadonlyArray<{
        readonly id: AgentOSWorkspacePageState;
        readonly label: string;
    }>;
    readonly summary: Parameters<typeof AgentOSWorkspaceSummary>[0]["labels"];
    readonly applications: Parameters<typeof AgentOSWorkspaceApplications>[0]["labels"];
    readonly runtime: Parameters<typeof AgentOSWorkspaceRuntime>[0]["labels"];
    readonly stack: Parameters<typeof HelmStackSnapshot>[0]["labels"];
    readonly operations: Parameters<typeof AgentOSWorkspaceOperations>[0]["labels"];
};
/** Settled view state consumed by the pure workspace page twin. */
export type AgentOSWorkspaceControlCenterViewProps = {
    readonly workspaceId?: string;
    readonly pageState: AgentOSWorkspacePageState;
    readonly controlCenterState: AgentOSWorkspaceControlCenterState;
    readonly message?: string;
    readonly data?: AgentWorkspaceControlCenter;
    readonly shell: AgentOSShellView;
    readonly labels: AgentOSWorkspaceControlCenterLabels;
    readonly onSelectPageState: (pageState: AgentOSWorkspacePageState) => void;
    readonly onOpenAgentConsole: () => void;
    readonly onRetry?: () => void;
    readonly onRetryShell?: () => void;
    readonly onRetryOperation?: (installationId: string, intentId: string) => void;
    readonly retryPending?: boolean;
    readonly isShellRetrying?: boolean;
    readonly openClawLaunchHref: string;
    readonly launchState: Parameters<typeof AgentOSWorkspaceApplications>[0]["launchState"];
    readonly formatDate: (value: string) => string;
};
/** Compose one AgentOS workspace from domain blocks; the page owns no API or operational JSX. */
export const AgentOSWorkspaceControlCenterBase = (props: AgentOSWorkspaceControlCenterProps) => {
    const { workspaceId, pageState, controlCenterState, message, data, shell, labels, launchState, openClawLaunchHref, onSelectPageState, onOpenAgentConsole, onRetry, onRetryShell, onRetryOperation, retryPending, isShellRetrying, formatDate }: AgentOSWorkspaceControlCenterViewProps = props;
    // The connected shell owns the identity scope, so an unsettled or refused access state decides
    // the page before any tab is offered - and a sign-in-required state discloses no scope at all.
    const accessState = shell.state === "sign-in-required" || shell.state === "access-unverified" || shell.state === "access-denied";
    const title = accessState ? labels.titleFallback : shell.state === "loading" ? workspaceId ?? labels.titleFallback : shell.name ?? shell.workspaceId ?? workspaceId ?? labels.titleFallback;
    const pageCopy = {
        eyebrow: labels.eyebrow ?? labels.titleFallback,
        description: labels.description ?? labels.accessUnavailable,
        stateSection: labels.stateSection ?? labels.titleFallback,
        loadingTitle: labels.loadingTitle ?? labels.loading,
        refusedTitle: labels.refusedTitle ?? labels.titleFallback,
        retry: labels.retry ?? "Retry"
    };
    /** The one tab list; a settling page still shows its chrome, an unsettled access state shows none. */
    const tabs = <DirectionTabs label={labels.tabsLabel} selectedKey={pageState} items={labels.tabs} onSelect={key => onSelectPageState(key as AgentOSWorkspacePageState)} panelId={key => "workspace-panel-" + key} labelVisibility="always" inset="none"/>;
    const sourceTime = shell.identityObservedAt === null || accessState ? null : <div className={SHELL_SOURCE_TIME_CLASS_NAME}><Badge tone="neutral">{labels.shell.sourceTime}</Badge><Text size="sm" tone="muted">{formatDate(shell.identityObservedAt)}{shell.instanceId === null ? "" : " · " + labels.shell.identityInstance + " " + shell.instanceId}</Text></div>;
    if (accessState) return <DirectionPage measure="product"><div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><DirectionHeader level={1} eyebrow={pageCopy.eyebrow} title={title} description={<Text size="md" tone="muted">{pageCopy.description}</Text>}/><AgentOSShellAccessNotice state={shell.state} labels={labels.shell} onRetry={onRetryShell} retrying={isShellRetrying}/></div></DirectionPage>;
    /** One tab decides one list of projections; the overview belongs to the connected shell. */
    const sectionsOf = () => {
        if (controlCenterState !== "ready" || data === undefined) {
            const isRefused = controlCenterState === "refused";
            return [isRefused ? <EmptyNotice key="state" message={message ?? pageCopy.refusedTitle} actionLabel={pageCopy.retry} onAction={onRetry} isActionPending={retryPending}/> : <SurfaceCard key="state" label={pageCopy.stateSection}><Text live="polite">{pageCopy.loadingTitle}</Text></SurfaceCard>];
        }
        if (pageState === "applications") {
            return [<AgentOSWorkspaceApplications key="item-0" apps={data.apps} labels={labels.applications} launchState={launchState} openClawLaunchHref={openClawLaunchHref} onManageOpenClaw={onOpenAgentConsole}/>];
        }
        if (pageState === "solutions") {
            return [<AgentOSSolutionModuleCenter key="item-0" workspaceId={data.workspace.id}/>];
        }
        if (pageState === "ai-knowledge") {
            return [<AgentOSWorkspaceAiKnowledge key="item-0" workspaceId={data.workspace.id}/>];
        }
        if (pageState === "access") {
            return [<EmptyNotice key="item-0" message={labels.accessUnavailable}/>];
        }
        if (pageState === "infrastructure") {
            return [<DirectionLayout key="infrastructure" primary={<AgentOSWorkspaceRuntime data={data} labels={labels.runtime} formatDate={formatDate}/>} rail={<HelmStackSnapshot runtime={data.runtime} labels={labels.stack}/>} align="start"/>];
        }
        return [<AgentOSWorkspaceOperations key="item-0" labels={labels.operations}/>];
    };
    const overview = [<AgentOSShellRegions key="shell" view={shell} labels={labels.shell} formatDate={formatDate} onRetry={onRetryShell} onRecheckOperation={onRetryOperation} retrying={isShellRetrying}/>, data === undefined ? null : <AgentOSWorkspaceSummary key="summary" data={data} labels={labels.summary}/>, data === undefined ? null : <AgentOSSolutionModuleCenter key="solutions" workspaceId={data.workspace.id}/>];
    const sections = pageState === "overview" ? overview : sectionsOf();
    return <DirectionPage measure="product"><div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><DirectionHeader level={1} eyebrow={pageCopy.eyebrow} title={title} description={<Text size="md" tone="muted">{pageCopy.description}</Text>}/>{sourceTime}{tabs}<section role="tabpanel" id={"workspace-panel-" + pageState} aria-label={labels.tabs.find(tab => tab.id === pageState)?.label}><div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">{sections}</div></section></div></DirectionPage>;
};