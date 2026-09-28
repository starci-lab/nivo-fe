"use client";

import { useTranslations } from "next-intl";
import { useSalesDecision } from "@/hooks";
import type { SalesTranslation } from "@/modules/sales/sales-workbench";
import { SalesDecisionBlockBase, answerOf } from "./component";

/** The route identities the decision surface is reached by; the read's own selector arrives with it. */
export type SalesDecisionBlockProps = { readonly workspaceId: string; readonly installationId: string };

/** Connect the decision surface to its resolved installation scope and render the settled view. */
export const SalesDecisionBlock = (props: SalesDecisionBlockProps) => {
  const translate = useTranslations("agentos.sales.decision");
  const t: SalesTranslation = (key, values): string => translate(key as never, values as never);
  const view = useSalesDecision(props.workspaceId, props.installationId, t);
  return <SalesDecisionBlockBase props={{ view }} on={{ selectChoice: key => view.answer.setChoice(answerOf(key)) }} />;
};