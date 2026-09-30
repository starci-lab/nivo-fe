import type { SettingsFormContentProps as SettingsFormDataProps } from "@/modules/agentos/module-page/surface-types"
import type { WithModulePageCopy } from "@/modules/agentos/module-page-copy"

/** Resolved module settings, credential values, copy, and edit actions. */
export type SettingsFormContentProps = WithModulePageCopy<SettingsFormDataProps>
