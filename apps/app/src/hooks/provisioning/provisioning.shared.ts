import type { useTranslations } from "next-intl"
import type { AgentOSCopy } from "@/modules/provisioning/agentos-flow"

/** Translation function type used by the provisioning hook family. */
type ProvisioningTranslation = ReturnType<typeof useTranslations>

/** Adapt the two catalogues to the pure AgentOS phase derivations. */
export const agentOSCopyOf = (flow: ProvisioningTranslation, shared: ProvisioningTranslation): AgentOSCopy => ({
    flow: (key) => flow(key),
    shared: (key) => shared(key),
    hasShared: (key) => shared.has(key),
})
