"use client"

import { useFormatter } from "next-intl"
import type { WorkbenchProps } from "../../../../modules/agentos/kind-workbench"
import type { Formatter } from "../../../../modules/i18n/formatter"
import { KindWorkbenchContentBase, type KindWorkbenchContentData } from "./component"

/** Props for {@link KindWorkbenchContent}. */
type KindWorkbenchContentProps = { readonly props: WorkbenchProps; readonly mode: KindWorkbenchContentData["mode"] }

/** Connect one registered AgentOS workbench to the reader's formatter. */
export const KindWorkbenchContent = (props: KindWorkbenchContentProps) => {
    const format: Formatter = useFormatter()
    return <KindWorkbenchContentBase props={{ workbench: props.props, mode: props.mode, format }} />
}
