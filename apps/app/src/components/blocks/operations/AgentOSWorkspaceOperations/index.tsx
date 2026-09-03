import { CONTENT_CLASS_NAME } from "./classNames";
import { Button as DirectionButton, SurfaceCard, Text } from "@starci/grammar/common";
/** Resolved lifecycle labels consumed by the operations block. */
export type AgentOSWorkspaceOperationsProps = {
    readonly labels: {
        readonly section: string;
        readonly note: string;
        readonly update: string;
        readonly plan: string;
        readonly backup: string;
        readonly reset: string;
        readonly rebuild: string;
    };
};
/** Expose the approved lifecycle vocabulary without inventing mutations the public API does not own yet. */
export const AgentOSWorkspaceOperations = (props: AgentOSWorkspaceOperationsProps) => {
    const { labels } = props;
    return <SurfaceCard label={labels.section}><div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><Text size="sm" tone="muted">{labels.note}</Text>{[labels.update, labels.plan, labels.backup, labels.reset, labels.rebuild].map(label => <DirectionButton key={label} variant="secondary" type="button" isDisabled>{label}</DirectionButton>)}</div></SurfaceCard>;
};
