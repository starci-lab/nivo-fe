"use client"

import { useTranslations } from "next-intl"
import { useSalesDecision } from "@/hooks"
import type { SalesTranslation } from "@/modules/sales/sales-workbench"
import { translationValuesForNextIntl } from "../translation-values"
import { SalesDecisionBlockBase, answerOf } from "./component"

/** The route identities the decision surface is reached by; the read's own selector arrives with it. */
export type SalesDecisionBlockProps = { readonly workspaceId: string; readonly installationId: string }

/** Connect the decision surface to its resolved installation scope and render the settled view. */
export const SalesDecisionBlock = (props: SalesDecisionBlockProps) => {
    const translate = useTranslations("agentos.sales.decision")
    const rail = useTranslations("agentos.sales.rail")
    const t: SalesTranslation = (key, values): string => {
        const translatedValues = translationValuesForNextIntl(values)
        if (key === "rail.scope") return rail("scope")
        if (key === "rail.scopeReady") return rail("scopeReady")
        if (key === "rail.installation")
            return rail("installation", {
                workspace: String(values?.workspace ?? ""),
                installation: String(values?.installation ?? ""),
            })
        if (key === "refusal.malformed") return rail("refusal.malformed")
        if (key === "refusal.unreachable") return rail("refusal.unreachable")
        return translate(key, translatedValues)
    }
    const view = useSalesDecision(props.workspaceId, props.installationId, t)
    return (
        <SalesDecisionBlockBase props={{ view }} on={{ selectChoice: (key) => view.answer.setChoice(answerOf(key)) }} />
    )
}
