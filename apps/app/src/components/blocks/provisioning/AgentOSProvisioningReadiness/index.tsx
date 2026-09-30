import { Text } from "@starci/grammar/common"
import { CONTENT_CLASS_NAME } from "./classNames"

/** Localized readiness status already settled by the connected flow. */
type AgentOSProvisioningReadinessProps = { readonly title: string; readonly text: string }

/** Draw readiness status copy inside the existing AgentOS status card. */
export const AgentOSProvisioningReadiness = (props: AgentOSProvisioningReadinessProps) => (
    <div className={CONTENT_CLASS_NAME}>
        <Text weight="medium">{props.title}</Text>
        <Text size="sm" live="polite">
            {props.text}
        </Text>
    </div>
)
