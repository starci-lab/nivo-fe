"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSalesWorkbench } from "@/hooks";
import { SalesWorkbenchBlockBase } from "./component";

/** The installed Sales workbench's open-registry entry: the one prop it addresses its installation by. */
export type SalesWorkbenchBlockProps = { readonly moduleId: string };

/** Connect the Sales workbench to its resolved installation scope and render the settled view. */
export const SalesWorkbenchBlock = (props: SalesWorkbenchBlockProps) => {
  const translate = useTranslations("console.agentos.modules.runtime.workbench.salesWorkbench");
  const locale = useLocale();
  const view = useSalesWorkbench(props.moduleId, locale, (key, values) => translate(key as never, values as never));
  return <SalesWorkbenchBlockBase props={{ view }} on={{
    selectOpportunity: view.wait.setOpportunityId,
    setFactKind: view.ambiguity.setFactKind,
    setOutcome: view.closure.setOutcome
  }} />;
};