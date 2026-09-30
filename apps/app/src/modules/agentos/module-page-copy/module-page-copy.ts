import { buildSetupCopy, type SetupModulePageMessageKey } from "./setup"
import { buildTestCopy, type TestModulePageMessageKey } from "./test"
import { buildOperateCopy, type OperateModulePageMessageKey } from "./operate"
import { buildSettingsCopy, type SettingsModulePageMessageKey } from "./settings"
import { buildDiagnosticsCopy, type DiagnosticsModulePageMessageKey } from "./diagnostics"
import { buildChatbotCopy, type ChatbotModulePageMessageKey } from "./chatbot"
import { buildShellCopy, type ShellModulePageMessageKey } from "./shell"

/** Catalog keys resolved only by the connected owner or a real-provider fixture. */
export type ModulePageMessageKey =
    | SetupModulePageMessageKey
    | TestModulePageMessageKey
    | OperateModulePageMessageKey
    | SettingsModulePageMessageKey
    | DiagnosticsModulePageMessageKey
    | ChatbotModulePageMessageKey
    | ShellModulePageMessageKey

/** Existing next-intl namespace translator; never passed into a drawing component. */
export type ModulePageTranslator = (
    key: ModulePageMessageKey,
    values?: Readonly<Record<string, string | number>>,
) => string

/** Build the complete settled copy tree from the connected module catalog translator. */
export const buildModulePageCopy = (t: ModulePageTranslator) => ({
    ...buildSetupCopy(t),
    ...buildTestCopy(t),
    ...buildOperateCopy(t),
    ...buildSettingsCopy(t),
    ...buildDiagnosticsCopy(t),
    ...buildChatbotCopy(t),
    ...buildShellCopy(t),
})

/** Complete settled display copy carried through the page drawing tree. */
export type ModulePageCopy = ReturnType<typeof buildModulePageCopy>

/** Add this to the page Base and State contracts, not to their domain-only screen union. */
export type ModulePageCopyProps = { readonly copy: ModulePageCopy }

/** Internal body props; preserve the original exported domain types used by owner projections. */
export type WithModulePageCopy<Props extends object> = Props & ModulePageCopyProps
