import type { AgentWorkspaceAppCapability } from "@/modules/api/console";
import { Badge as DirectionBadge, Button as DirectionButton, SectionHeader as DirectionHeader, Text as DirectionText, SurfaceCard } from "@starci/grammar/common";
/** Workspace capabilities and resolved copy consumed by the application block. */
export type AgentOSWorkspaceApplicationsProps = {
    readonly apps: ReadonlyArray<AgentWorkspaceAppCapability>;
    readonly labels: {
        readonly section: string;
        readonly openclaw: string;
        readonly n8n: string;
        readonly openclawDescription: string;
        readonly n8nDescription: string;
        readonly available: string;
        readonly unavailable: string;
        readonly manage: string;
        readonly unavailableAction: string;
        readonly securityUpgradeRequired: string;
        readonly unavailableDetail: string;
        readonly opening: string;
        readonly openAgain: string;
        readonly blocked: string;
        readonly expired: string;
        readonly disconnected: string;
    };
    readonly launchState: "idle" | "opening" | "connected" | "blocked" | "expired" | "disconnected";
    readonly openClawLaunchHref: string;
    readonly onManageOpenClaw: () => void;
};
/** The resolved copy this block draws with. */
type ApplicationLabels = AgentOSWorkspaceApplicationsProps["labels"];
/** How far the OpenClaw launch has got. */
type LaunchState = AgentOSWorkspaceApplicationsProps["launchState"];
/**
 * The launch states that speak for themselves on the card's detail line.
 *
 * `idle`, `opening` and `connected` are deliberately absent: they are reported by the action label
 * rather than the detail line, and a missing entry here means "the detail line has nothing to add".
 */
const LAUNCH_DETAIL_LABEL: Partial<Record<LaunchState, keyof ApplicationLabels>> = {
    blocked: "blocked",
    expired: "expired",
    disconnected: "disconnected"
};
/**
 * What the card's detail line says, in the order the reasons outrank each other.
 *
 * A refused capability outranks a stalled launch, which outranks the version an available app
 * reports, which outranks the generic unavailable note.
 *
 * @param app - The capability the card is drawn for.
 * @param labels - Resolved copy.
 * @param launchState - How far the OpenClaw launch has got.
 * @param openClaw - Whether this card is the OpenClaw one.
 * @returns The detail line, or `undefined` when there is nothing to say.
 */
const detailFor = (app: AgentWorkspaceAppCapability, labels: ApplicationLabels, launchState: LaunchState, openClaw: boolean): string | undefined => {
    if (app.reason === "SECURITY_UPGRADE_REQUIRED") {
        return labels.securityUpgradeRequired;
    }
    const launchLabel = openClaw ? LAUNCH_DETAIL_LABEL[launchState] : undefined;
    if (launchLabel !== undefined) {
        return labels[launchLabel];
    }
    return app.available ? app.observedVersion ?? undefined : labels.unavailableDetail;
};
/** Render application capability only; no credential or one-time code enters this boundary. */
export const AgentOSWorkspaceApplications = (props: AgentOSWorkspaceApplicationsProps) => {
    const { apps, labels, launchState, openClawLaunchHref, onManageOpenClaw } = props;
    return <SurfaceCard label={labels.section}><div className="flex min-w-0 flex-col gap-2" data-contract="GAP-2">{apps.map(app => {
            const openClaw = app.app === "OPENCLAW";
            const label = launchState === "expired" ? labels.openAgain : labels.manage;
            const action = openClaw ? <DirectionButton variant="primary" href={openClawLaunchHref} target="_blank" rel="noopener noreferrer" onFollow={onManageOpenClaw} isDisabled={!app.available} isPending={launchState === "opening"}>{label}</DirectionButton> : <DirectionButton variant="secondary" type="button" isDisabled>{labels.unavailableAction}</DirectionButton>;
            return <div key={app.app} className="flex min-w-0 flex-col gap-2" data-contract="GAP-2"><DirectionHeader level={2} title={openClaw ? labels.openclaw : labels.n8n} description={<DirectionText size="sm" tone="muted">{openClaw ? labels.openclawDescription : labels.n8nDescription}</DirectionText>} action={action}/><DirectionBadge tone={app.available ? "success" : "warning"}>{app.available ? labels.available : labels.unavailable}</DirectionBadge><DirectionText size="sm" tone="muted" live={openClaw ? "polite" : "off"}>{detailFor(app, labels, launchState, openClaw)}</DirectionText></div>;
        })}</div></SurfaceCard>;
};
