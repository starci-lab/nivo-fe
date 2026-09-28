import { AgentOSKnowledgeOriginListBase, type AgentOSKnowledgeOriginListLabels } from "./component";
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/console";

/** Keep provenance presentation independently reusable inside workspace AI surfaces. */
type AgentOSKnowledgeOriginListProps = {
    readonly origins: AgentosAiKnowledgeReadiness["origins"];
    readonly labels: AgentOSKnowledgeOriginListLabels;
    readonly loading?: boolean;
};
/** Public API role for AgentOSKnowledgeOriginList. */
export const AgentOSKnowledgeOriginList = (props: AgentOSKnowledgeOriginListProps) => <AgentOSKnowledgeOriginListBase props={{
    origins: props.origins,
    labels: {
        title: props.labels.title,
        current: props.labels.current,
        unknownVersion: props.labels.unknownVersion
    },
    loading: props.loading
}} on={{ documents: props.labels.documents }} />;
