"use client";

import { useTranslations } from "next-intl";
import { AccountingWorkbenchBlockBase } from "./component";
import { useAccountingWorkbench } from "./useAccountingWorkbench";

/** Registry input identifying the installed Accounting workbench. */
export type AccountingWorkbenchBlockProps = { readonly moduleId: string; readonly kindKey: string; readonly workbenchVersion: string };
export { accountingCorrectionAccess, type CorrectionAccessInput } from "./useAccountingWorkbench";

/** Connect one installed Accounting module to its responsive operational workbench. */
export const AccountingWorkbenchBlock = (props: AccountingWorkbenchBlockProps) => {
  const translate = useTranslations("console.agentos.modules.runtime.workbench.accountingWorkbench");
  const view = useAccountingWorkbench(props.moduleId, (key, values) => translate(key as never, values as never));
  return <AccountingWorkbenchBlockBase view={view} />;
};
