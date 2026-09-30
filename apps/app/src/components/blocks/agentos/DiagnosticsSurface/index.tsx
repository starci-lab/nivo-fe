"use client"

import { useFormatter } from "next-intl"
import type { DiagnosticsSurfaceProps as DiagnosticsSurfaceDataProps } from "../../../../modules/agentos/module-page/surface-types"
import type { WithModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import type { Formatter } from "../../../../modules/i18n/formatter"
import { DiagnosticsSurfaceBase } from "./component"

/** Diagnostic signal filters, runtime health and persisted trace evidence, with copy resolved. */
export type DiagnosticsSurfaceProps = WithModulePageCopy<DiagnosticsSurfaceDataProps>

/** Resolve the locale formatter and hand the settled surface to its pure half. */
export const DiagnosticsSurface = (props: DiagnosticsSurfaceProps) => {
    const format: Formatter = useFormatter()
    const { onSelectSignal, onSelectPane, ...data } = props
    return (
        <DiagnosticsSurfaceBase
            props={{ ...data, format }}
            on={{ selectSignal: onSelectSignal, selectPane: onSelectPane }}
        />
    )
}
