"use client"

import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useSalesWorkbench } from "@/hooks/agentos"
import type { Formatter } from "@/modules/i18n/formatter"
import { translationValuesForNextIntl } from "../translation-values"
import { SalesWorkbenchBlockBase } from "./component"

/** The installed Sales workbench's open-registry entry: the one prop it addresses its installation by. */
export type SalesWorkbenchBlockProps = { readonly moduleId: string }

/** Connect the Sales workbench to its resolved installation scope and render the settled view. */
export const SalesWorkbenchBlock = (props: SalesWorkbenchBlockProps) => {
    const translate = useTranslations("console.agentos.modules.runtime.workbench.salesWorkbench")
    const shared = useTranslations("console.agentos.modules.runtime.workbench.shared")
    const locale = useLocale()
    const format: Formatter = useFormatter()
    const view = useSalesWorkbench(props.moduleId, locale, (key, values) =>
        translate(key, translationValuesForNextIntl(values)),
    )
    return (
        <SalesWorkbenchBlockBase
            props={{ view, format, shared: { loadMore: shared("loadMore"), surfaceUnavailable: shared("surfaceUnavailable") } }}
            on={{
                selectOpportunity: view.wait.setOpportunityId,
                setFactKind: view.ambiguity.setFactKind,
                setOutcome: view.closure.setOutcome,
            }}
        />
    )
}
