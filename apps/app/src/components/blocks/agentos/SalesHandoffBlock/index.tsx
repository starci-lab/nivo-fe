"use client"

import { useTranslations } from "next-intl"
import { useSalesHandoff } from "@/hooks"
import type { SalesTranslation } from "@/modules/sales/sales-workbench"
import { translationValuesForNextIntl } from "../translation-values"
import { SalesHandoffBlockBase } from "./component"

/** The route identities the handoff surface is reached by; the read's own selector arrives with it. */
export type SalesHandoffBlockProps = { readonly workspaceId: string; readonly installationId: string }

/** Connect the handoff surface to its resolved installation scope and render the settled view. */
export const SalesHandoffBlock = (props: SalesHandoffBlockProps) => {
    const translate = useTranslations("agentos.sales.handoff")
    const t: SalesTranslation = (key, values): string => translate(key, translationValuesForNextIntl(values))
    const view = useSalesHandoff(props.workspaceId, props.installationId, t)
    return <SalesHandoffBlockBase props={{ view }} />
}
