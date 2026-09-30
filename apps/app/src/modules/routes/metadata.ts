import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

/** Translation namespaces used by the installed-module route metadata. */
type ModuleMetadataNamespace =
    | "metadata.agentosModuleDiagnostics"
    | "metadata.agentosModuleOperate"
    | "metadata.agentosModuleSales"
    | "metadata.agentosModuleSalesDecisions"
    | "metadata.agentosModuleSalesHandoffs"
    | "metadata.agentosModuleSettings"
    | "metadata.agentosModuleSetup"
    | "metadata.agentosModuleTest"

/** Read the localized title and description shared by installed-module page metadata. */
export const readModuleMetadata = async (namespace: ModuleMetadataNamespace): Promise<Metadata> => {
    const t = await getTranslations(namespace)
    return {
        title: t("title"),
        description: t("description"),
    }
}
