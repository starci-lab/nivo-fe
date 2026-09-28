"use client";

import { useLocale, useTranslations } from "next-intl";
import { useAccountingWorkbench } from "@/hooks";
import { AccountingWorkbenchBlockBase } from "./component";

/** The installed Accounting workbench's open-registry entry: kind identity only, no caller wiring. */
export type AccountingWorkbenchBlockProps = { readonly moduleId: string; readonly kindKey: string; readonly workbenchVersion: string };

/** Connect the Accounting workbench to its resolved installation scope and render the settled view. */
export const AccountingWorkbenchBlock = (props: AccountingWorkbenchBlockProps) => {
  const translate = useTranslations("console.agentos.modules.runtime.workbench.accountingWorkbench");
  const locale = useLocale();
  const view = useAccountingWorkbench(props.moduleId, locale, (key, values) => translate(key as never, values as never));
  return <AccountingWorkbenchBlockBase props={{ view }} />;
};