"use client";

import { readAccountingWorkbench, resolveAppliedAccountingContext } from "@/modules/api/accounting";
import { useNivoQuery } from "../use-nivo-query";

/** Cache identity for one applied Accounting context. */
export const accountingContextQueryKey = (installationId: string) => ["accounting", "context", installationId] as const;
/** Cache identity for an exact current or historical Accounting statement. */
export const accountingWorkbenchQueryKey = (installationId: string, currency: string, ledgerVersion?: string) => ["accounting", "workbench", installationId, currency, ledgerVersion ?? "current"] as const;

/** Read one installation's applied immutable Accounting context. */
export const useQueryAppliedAccountingContextSwr = (installationId: string) => useNivoQuery(accountingContextQueryKey(installationId), () => resolveAppliedAccountingContext(installationId));
/** Read one versioned Accounting workbench in the signed-in viewer cache. */
export const useQueryAccountingWorkbenchSwr = (installationId: string, currency?: string, ledgerVersion?: string) => useNivoQuery(currency === undefined ? null : accountingWorkbenchQueryKey(installationId, currency, ledgerVersion), () => readAccountingWorkbench(installationId, currency!, ledgerVersion));
