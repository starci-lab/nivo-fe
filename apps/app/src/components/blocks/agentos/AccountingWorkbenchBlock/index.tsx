"use client";

import { useLocale, useTranslations } from "next-intl";
import { AccountingWorkbenchBlockBase } from "./component";
import { useAccountingWorkbench } from "./useAccountingWorkbench";

/** Registry input identifying the installed Accounting workbench. */
export type AccountingWorkbenchBlockProps = { readonly moduleId: string; readonly kindKey: string; readonly workbenchVersion: string };
export { accountingCorrectionAccess, accountingDocumentAction, accountingIntakePolicy, accountingNoticeLive, bytesToBase64, canonicalMonthKey, currencyAmountToMinor, eligibleCorrectionSourceEntries, formatMinorCurrency, maskParticipantId, type CorrectionAccessInput } from "./useAccountingWorkbench";

/** Connect one installed Accounting module to its responsive operational workbench. */
export const AccountingWorkbenchBlock = (props: AccountingWorkbenchBlockProps) => {
  const translate = useTranslations("console.agentos.modules.runtime.workbench.accountingWorkbench");
  const locale = useLocale();
  const view = useAccountingWorkbench(props.moduleId, locale, (key, values) => translate(key as never, values as never));
  return <AccountingWorkbenchBlockBase view={view} />;
};
