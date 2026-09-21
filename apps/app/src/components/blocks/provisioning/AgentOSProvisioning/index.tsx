"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useQueryCatalogItemsSwr, useQueryMyAgentosAiKnowledgeReadinessSwr, useQueryMyAgentWorkspacesSwr, useQueryMyCatalogOrdersSwr, useQueryMyInvoicesSwr, useMutateIssueAgentWorkspaceAppLaunchSwr, useMutateOrderAgentosSwr, useMutateRunAgentosAiReadinessTestSwr } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { type AgentWorkspaceRow, type CatalogItemRow, type CatalogOrderRow, type CatalogTierRow, type InvoiceRow } from "@/modules/api/console";
import { type Result } from "@/modules/api/graphql";
import { type WorkspacePurchaseStatus } from "@/modules/api/workspace-controlplane";
import { nivoQueryData } from "@/modules/query";
import useProvisioningRealtime, { type ProvisioningTarget } from "@/modules/realtime/provisioning";
import { followWorkspaceAppRedirect, safeWorkspaceAppRedirect } from "@/modules/window/workspace-app-launch";
import { BILLING_CURRENCY } from "@/modules/config";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { AgentOSProvisioningBase, type AgentOSProvisioningViewProps } from "./component";

/** Route identity owned by the AgentOS provisioning block. */
export type AgentOSProvisioningProps = {
  readonly context: {
    readonly mode: "new";
  } | {
    readonly mode: "resume";
    readonly orderId: string;
  };
};
type AgentOSFlow = {
  readonly phase: "catalog_loading";
} | {
  readonly phase: "request";
  readonly catalogue: ReadonlyArray<CatalogItemRow>;
  readonly item: CatalogItemRow | null;
  readonly tier: CatalogTierRow | null;
} | {
  readonly phase: "submitting";
  readonly catalogue: ReadonlyArray<CatalogItemRow>;
  readonly item: CatalogItemRow;
  readonly tier: CatalogTierRow | null;
} | {
  readonly phase: "awaiting_payment";
  readonly orderId: string;
  readonly invoiceId: string | null;
  readonly subject: string;
  readonly detail: string;
} | {
  readonly phase: "payment_unknown";
  readonly orderId: string;
  readonly subject: string;
  readonly detail: string;
  readonly reason: string;
} | {
  readonly phase: "accepted";
  readonly orderId: string;
  readonly subject: string;
  readonly detail: string;
} | {
  readonly phase: "preparing";
  readonly orderId: string;
  readonly workspaceId: string;
  readonly subject: string;
  readonly detail: string;
} | {
  readonly phase: "provisioning_unknown";
  readonly orderId: string;
  readonly subject: string;
  readonly detail: string;
  readonly reason: string;
} | {
  readonly phase: "ready";
  readonly orderId: string;
  readonly workspaceId: string;
  readonly subject: string;
  readonly detail: string;
} | {
  readonly phase: "failed";
  readonly orderId: string | null;
  readonly subject: string;
  readonly detail: string;
  readonly reason: string;
  readonly atStep: 0 | 1 | 2 | 3;
};

/** The namespaced copy reader, so the settlement below can read the same strings off the surface. */
type ProvisioningCopy = ReturnType<typeof useTranslations>;

/** Order lifecycle positions an order row can only reach after its payment settled. */
const ORDER_SETTLED: ReadonlySet<string> = new Set(["active", "completed", "in_progress", "paid"]);

/**
 * Assemble one source-qualified purchase status out of the three owner-scoped snapshots.
 *
 * This mirrors `readWorkspacePurchaseStatus` in the workspace-controlplane seam fact for fact:
 * each source keeps its own name, a refused source reports "unavailable" rather than a verdict,
 * a missing invoice is "not-raised", a missing workspace is "not-admitted", and only a persisted
 * invoice status of "paid" reports paid. When no source answered at all the read fails closed.
 */
const purchaseStatusOf = (orderId: string, orders: Result<ReadonlyArray<CatalogOrderRow>> | undefined, invoices: Result<ReadonlyArray<InvoiceRow>> | undefined, workspaces: Result<ReadonlyArray<AgentWorkspaceRow>> | undefined): Result<WorkspacePurchaseStatus> => {
  if (orders?.ok !== true && invoices?.ok !== true && workspaces?.ok !== true) {
    return {
      ok: false,
      reason: orders?.ok === false ? orders.reason : invoices?.ok === false ? invoices.reason : workspaces?.ok === false ? workspaces.reason : "unavailable"
    };
  }
  const order = orders?.ok === true ? orders.data.find(candidate => candidate.id === orderId) : undefined;
  const invoice = invoices?.ok === true ? invoices.data.find(candidate => candidate.catalogOrder?.id === orderId) : undefined;
  const workspace = workspaces?.ok === true ? workspaces.data.find(candidate => candidate.catalogOrder?.id === orderId) : undefined;
  return {
    ok: true,
    data: {
      purchaseId: orderId,
      observedAt: new Date().toISOString(),
      order: orders?.ok !== true ? {
        state: "unavailable",
        code: orders?.ok === false ? orders.code ?? null : null
      } : order === undefined ? {
        state: "missing"
      } : {
        state: "observed",
        status: order.status,
        offerName: order.catalogItem?.name ?? null,
        tierName: order.catalogTier?.name ?? null
      },
      payment: invoices?.ok !== true ? {
        state: "unavailable",
        code: invoices?.ok === false ? invoices.code ?? null : null
      } : invoice === undefined ? {
        state: "not-raised"
      } : {
        state: "observed",
        invoiceId: invoice.id,
        status: invoice.status,
        amountVnd: invoice.amountVnd,
        paidAt: invoice.paidAt
      },
      provisioning: workspaces?.ok !== true ? {
        state: "unavailable",
        code: workspaces?.ok === false ? workspaces.code ?? null : null
      } : workspace === undefined ? {
        state: "not-admitted"
      } : {
        state: "observed",
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceStatus: workspace.status
      }
    }
  };
};

/**
 * Settle one source-qualified purchase status into the phase the flow is standing on.
 *
 * A refused read is an unknown phase with a safe reconcile action, never a terminal verdict; only
 * a persisted `paid` invoice or an order already past payment reports payment settled; and only a
 * bound ready workspace exposes the ready phase.
 */
const phaseFromStatus = (status: WorkspacePurchaseStatus, t: ProvisioningCopy, productName: string): AgentOSFlow => {
  const purchaseId = status.purchaseId;
  const order = status.order;
  if (order.state === "unavailable") {
    return {
      phase: "payment_unknown",
      orderId: purchaseId,
      subject: productName,
      detail: purchaseId,
      reason: order.code ?? t("failedLoad")
    };
  }
  if (order.state === "missing") {
    return {
      phase: "failed",
      orderId: purchaseId,
      subject: productName,
      detail: purchaseId,
      reason: t("agentos.orderMissing"),
      atStep: 0
    };
  }
  const detail = order.tierName ?? order.offerName ?? purchaseId;
  if (order.status === "cancelled" || order.status === "suspended") {
    return {
      phase: "failed",
      orderId: purchaseId,
      subject: productName,
      detail,
      reason: t("agentos.orderCancelled"),
      atStep: 1
    };
  }
  const payment = status.payment;
  if (payment.state === "observed" && payment.status === "unpaid") {
    return {
      phase: "awaiting_payment",
      orderId: purchaseId,
      invoiceId: payment.invoiceId,
      subject: productName,
      detail
    };
  }
  if (payment.state === "observed" && payment.status === "cancelled") {
    return {
      phase: "failed",
      orderId: purchaseId,
      subject: productName,
      detail,
      reason: t("agentos.orderCancelled"),
      atStep: 1
    };
  }
  const paid = payment.state === "observed" && payment.status === "paid" || ORDER_SETTLED.has(order.status);
  if (!paid) {
    if (payment.state === "unavailable") {
      return {
        phase: "payment_unknown",
        orderId: purchaseId,
        subject: productName,
        detail,
        reason: payment.code ?? t("failedLoad")
      };
    }
    return {
      phase: "awaiting_payment",
      orderId: purchaseId,
      invoiceId: null,
      subject: productName,
      detail
    };
  }
  const provisioning = status.provisioning;
  if (provisioning.state === "unavailable") {
    return {
      phase: "provisioning_unknown",
      orderId: purchaseId,
      subject: productName,
      detail,
      reason: provisioning.code ?? t("failedLoad")
    };
  }
  if (provisioning.state === "not-admitted") {
    return {
      phase: "accepted",
      orderId: purchaseId,
      subject: productName,
      detail
    };
  }
  const workspaceDetail = provisioning.workspaceName ?? provisioning.workspaceId;
  if (provisioning.workspaceStatus === "failed") {
    return {
      phase: "failed",
      orderId: purchaseId,
      subject: productName,
      detail: workspaceDetail,
      reason: t("failedProvision"),
      atStep: 2
    };
  }
  return {
    phase: provisioning.workspaceStatus === "active" || provisioning.workspaceStatus === "ready" ? "ready" : "preparing",
    orderId: purchaseId,
    workspaceId: provisioning.workspaceId,
    subject: productName,
    detail: workspaceDetail
  };
};

/** The one realtime subject a phase is waiting on, or nothing when it waits on no one. */
const realtimeTarget = (flow: AgentOSFlow): ProvisioningTarget | null => {
  if (flow.phase === "preparing" || flow.phase === "ready") return {
    kind: "workspace",
    id: flow.workspaceId
  };
  if (flow.phase === "awaiting_payment" || flow.phase === "payment_unknown" || flow.phase === "accepted" || flow.phase === "provisioning_unknown") return {
    kind: "order",
    id: flow.orderId
  };
  return null;
};

/** Which of the four customer outcomes the flow is standing on. A failure keeps its outcome. */
const phaseIndexOf = (flow: AgentOSFlow): number => {
  if (flow.phase === "catalog_loading" || flow.phase === "request" || flow.phase === "submitting") return 0;
  if (flow.phase === "awaiting_payment" || flow.phase === "payment_unknown") return 1;
  if (flow.phase === "accepted" || flow.phase === "preparing" || flow.phase === "provisioning_unknown") return 2;
  if (flow.phase === "failed") return flow.atStep;
  return 3;
};

/** Where one step sits relative to the step the flow is on. */
const stepState = (index: number, phaseIndex: number): "done" | "current" | "upcoming" => {
  if (index < phaseIndex) return "done";
  if (index === phaseIndex) return "current";
  return "upcoming";
};
const readinessMilestoneState = (index: number, current: number): "done" | "current" | "upcoming" => {
  if (current === -1) return index < 4 ? "done" : "current";
  return stepState(index, current);
};
const walletTargetOf = (orderId: string, invoiceId: string | null, locale: string): string | undefined => {
  if (invoiceId === null) return undefined;
  const returnTo = `${locale === DEFAULT_LOCALE ? "" : `/${locale}`}/agentos/orders/${orderId}`;
  const query = new URLSearchParams({
    orderId,
    invoiceId,
    returnTo
  });
  return `/wallet?${query.toString()}`;
};

/** Own the real purchase → payment → workspace lifecycle and its matching Socket.IO target. */
export const AgentOSProvisioning = (props: AgentOSProvisioningProps) => {
  const {
    context
  }: AgentOSProvisioningProps = props;
  const t = useTranslations("console.provisioningFlows");
  const tShared = useTranslations("console");
  const format = useFormatter();
  const locale = useLocale();
  const router = useRouter();
  const session = useSession();
  const productName = t("agentos.productName");
  const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
  const [flow, setFlow] = useState<AgentOSFlow>({
    phase: "catalog_loading"
  });
  const [aiRetryPending, setAiRetryPending] = useState(false);
  const [entryPending, setEntryPending] = useState(false);
  const [entryRefusal, setEntryRefusal] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const orderAgentos = useMutateOrderAgentosSwr();
  const contextMode = context.mode;
  const resumeOrderId = context.mode === "resume" ? context.orderId : null;
  const isResume = contextMode === "resume";
  const catalogQuery = useQueryCatalogItemsSwr("ai_agent", !isResume);
  const ordersQuery = useQueryMyCatalogOrdersSwr(isResume);
  const invoicesQuery = useQueryMyInvoicesSwr(isResume);
  const workspacesQuery = useQueryMyAgentWorkspacesSwr(isResume);
  const refreshOrders = ordersQuery.mutate;
  const refreshInvoices = invoicesQuery.mutate;
  const refreshWorkspaces = workspacesQuery.mutate;
  const readyWorkspaceId = flow.phase === "ready" ? flow.workspaceId : undefined;
  const issueWorkspaceLaunch = useMutateIssueAgentWorkspaceAppLaunchSwr(readyWorkspaceId ?? "");
  const aiReadinessQuery = useQueryMyAgentosAiKnowledgeReadinessSwr(readyWorkspaceId, aiRetryPending);
  const retryReadiness = useMutateRunAgentosAiReadinessTestSwr(readyWorkspaceId);
  const refreshAiReadiness = aiReadinessQuery.mutate;
  const aiReadiness = nivoQueryData(aiReadinessQuery.data);
  const reconcile = useCallback(async (orderId: string) => {
    setReconciling(true);
    try {
      const [orders, invoices, workspaces] = await Promise.all([refreshOrders(), refreshInvoices(), refreshWorkspaces()]);
      const status = purchaseStatusOf(orderId, orders, invoices, workspaces);
      setFlow(status.ok ? phaseFromStatus(status.data, t, productName) : {
        phase: "payment_unknown",
        orderId,
        subject: productName,
        detail: orderId,
        reason: status.reason
      });
    } catch {
      setFlow({
        phase: "payment_unknown",
        orderId,
        subject: productName,
        detail: orderId,
        reason: t("failedLoad")
      });
    } finally {
      setReconciling(false);
    }
  }, [productName, refreshInvoices, refreshOrders, refreshWorkspaces, t]);
  useEffect(() => {
    const catalogue = catalogQuery.data;
    if (isResume || catalogue === undefined) return;
    if (!catalogue.ok || catalogue.data.length === 0) {
      setFlow({
        phase: "failed",
        orderId: null,
        subject: productName,
        detail: "",
        reason: catalogue.ok ? t("failedLoad") : catalogue.reason,
        atStep: 0
      });
      return;
    }
    setFlow(current => {
      if (current.phase !== "catalog_loading") return current;
      return {
        phase: "request",
        catalogue: catalogue.data,
        item: null,
        tier: null
      };
    });
  }, [catalogQuery.data, isResume, productName, t]);
  useEffect(() => {
    if (!isResume || accessToken === null || resumeOrderId === null) return;
    if (ordersQuery.data === undefined || invoicesQuery.data === undefined || workspacesQuery.data === undefined) return;
    const status = purchaseStatusOf(resumeOrderId, ordersQuery.data, invoicesQuery.data, workspacesQuery.data);
    setFlow(status.ok ? phaseFromStatus(status.data, t, productName) : {
      phase: "payment_unknown",
      orderId: resumeOrderId,
      subject: productName,
      detail: resumeOrderId,
      reason: status.reason
    });
  }, [accessToken, invoicesQuery.data, isResume, ordersQuery.data, productName, resumeOrderId, t, workspacesQuery.data]);
  const target = realtimeTarget(flow);
  const realtime = useProvisioningRealtime({
    accessToken,
    target
  });
  useEffect(() => {
    if (realtime.status !== "event") return;
    if (realtime.event.kind === "order") {
      void reconcile(realtime.event.id);
      return;
    }
    if (realtime.event.kind !== "workspace") return;
    const event = realtime.event;
    setFlow(current => {
      if (current.phase !== "preparing" && current.phase !== "ready") return current;
      if (current.workspaceId !== event.id) return current;
      if (event.status === "failed") return {
        phase: "failed",
        orderId: current.orderId,
        subject: current.subject,
        detail: current.detail,
        reason: event.reason ?? t("failedProvision"),
        atStep: 2
      };
      const phase = event.status === "active" || event.status === "ready" ? "ready" : "preparing";
      if (phase === current.phase) return current;
      return {
        ...current,
        phase
      };
    });
  }, [realtime, reconcile, t]);
  useEffect(() => {
    if (flow.phase !== "awaiting_payment" && flow.phase !== "accepted" && flow.phase !== "preparing") return;
    // Socket.IO is the fast path, while the owner-scoped snapshot is the recovery path
    // for a tab that reconnects after a terminal event has already been relayed.
    const timer = window.setInterval(() => {
      void reconcile(flow.orderId);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [flow, reconcile]);
  useEffect(() => {
    if (contextMode !== "resume" || resumeOrderId === null || realtime.status !== "connected") return;
    void reconcile(resumeOrderId);
  }, [contextMode, realtime.status, reconcile, resumeOrderId]);
  useEffect(() => {
    if (flow.phase !== "ready") setEntryRefusal(null);
  }, [flow.phase]);
  const submit = async () => {
    if (flow.phase !== "request" || flow.item === null || (flow.item.tiers?.length ?? 0) > 0 && flow.tier === null) return;
    setFlow({
      phase: "submitting",
      catalogue: flow.catalogue,
      item: flow.item,
      tier: flow.tier
    });
    try {
      const order = await orderAgentos.trigger({
        catalogItemSlug: flow.item.slug,
        catalogTierId: flow.tier?.id
      });
      if (!order.ok) {
        setFlow({
          phase: "failed",
          orderId: null,
          subject: productName,
          detail: flow.tier?.name ?? flow.item.slug,
          reason: order.reason,
          atStep: 0
        });
        return;
      }
      setFlow({
        phase: "awaiting_payment",
        orderId: order.data.id,
        invoiceId: null,
        subject: productName,
        detail: order.data.catalogTier?.name ?? flow.tier?.name ?? order.data.id
      });
      router.replace(`/agentos/orders/${order.data.id}`);
    } catch {
      setFlow({
        phase: "failed",
        orderId: null,
        subject: productName,
        detail: flow.tier?.name ?? flow.item.slug,
        reason: t("failedLoad"),
        atStep: 0
      });
    }
  };
  const selectOffer = (id: string) => setFlow(current => {
    if (current.phase !== "request") return current;
    const item = current.catalogue.find(candidate => candidate.id === id) ?? null;
    return { ...current, item, tier: null };
  });
  const selectTier = (id: string) => setFlow(current => {
    if (current.phase !== "request" || current.item === null) return current;
    const tier = current.item.tiers?.find(candidate => candidate.id === id) ?? null;
    return { ...current, tier };
  });
  const enterWorkspace = async () => {
    if (readyWorkspaceId === undefined || entryPending) return;
    setEntryPending(true);
    setEntryRefusal(null);
    try {
      const grant = await issueWorkspaceLaunch.trigger();
      if (!grant.ok) {
        setEntryRefusal(grant.reason);
        return;
      }
      const destination = safeWorkspaceAppRedirect(grant.data.redirectUrl);
      if (destination === null) {
        setEntryRefusal(tShared("refusal.unknown"));
        return;
      }
      followWorkspaceAppRedirect(destination);
    } finally {
      setEntryPending(false);
    }
  };
  const phaseIndex = phaseIndexOf(flow);
  const stepLabels = [t("steps.request"), t("steps.payment"), t("steps.createWorkspace"), t("steps.ready")];
  const stateLabels = {
    done: t("stepState.done"),
    current: t("stepState.current"),
    upcoming: t("stepState.upcoming")
  } as const;
  let steps = stepLabels.map((label, index) => {
    const state = stepState(index, phaseIndex);
    return {
      ordinal: String(index + 1),
      label,
      state,
      stateLabel: stateLabels[state]
    };
  });
  if (flow.phase === "ready") {
    const milestones = [aiReadiness?.credentialStatus === "configured", Boolean(aiReadiness?.chatModel), (aiReadiness?.origins.length ?? 0) > 0 && aiReadiness?.knowledgeRecoveryOperationId === null, aiReadiness?.qdrantHealth === "healthy", aiReadiness?.aiReady === true];
    const current = milestones.findIndex(done => !done);
    const readinessLabels = [t("steps.credential"), t("steps.deepseek"), t("steps.knowledge"), t("steps.qdrant"), t("steps.aiTest")];
    steps = readinessLabels.map((label, index) => {
      const state = readinessMilestoneState(index, current);
      return {
        ordinal: String(index + 1),
        label,
        state,
        stateLabel: stateLabels[state]
      };
    });
  }
  const retryAiReadiness = async () => {
    setAiRetryPending(true);
    await retryReadiness.trigger(crypto.randomUUID());
    await refreshAiReadiness();
    setAiRetryPending(false);
  };
  const viewLabels = {
    progressLabel: t("agentos.progressLabel"),
    continuationLabel: t("agentos.continuationLabel")
  };
  const requestView = (requestFlow: Extract<AgentOSFlow, {
    readonly phase: "request" | "submitting";
  }>): AgentOSProvisioningViewProps => {
    const price = requestFlow.tier?.priceMonthlyVnd;
    let detail = requestFlow.item === null ? t("agentos.chooseOffer") : requestFlow.tier?.name ?? requestFlow.item.name;
    if (price !== null && price !== undefined) {
      const priceLabel = format.number(price, {
        style: "currency",
        currency: BILLING_CURRENCY,
        maximumFractionDigits: 0
      });
      detail = `${requestFlow.tier?.name ?? ""} · ${priceLabel}`;
    }
    return {
      state: requestFlow.phase,
      props: {
        ...viewLabels,
        steps,
        subject: requestFlow.item?.name ?? productName,
        detail,
        statusTitle: t("agentos.requestTitle"),
        statusText: t("agentos.requestText"),
        requestActionLabel: t("agentos.submit"),
        requestActionDisabled: requestFlow.item === null || (requestFlow.item.tiers?.length ?? 0) > 0 && requestFlow.tier === null,
        isRequestPending: requestFlow.phase === "submitting",
        selection: {
          label: t("agentos.selectionLabel"),
          chooseOffer: t("agentos.chooseOffer"),
          chooseTier: t("agentos.chooseTier"),
          selected: t("agentos.selected"),
          offers: requestFlow.catalogue.map(item => ({
            id: item.id,
            label: item.name,
            description: item.tagline ?? undefined,
            tiers: [...(item.tiers ?? [])].sort((left, right) => left.orderIndex - right.orderIndex).map(tier => ({
              id: tier.id,
              label: tier.name,
              detail: tier.priceMonthlyVnd === null ? undefined : format.number(tier.priceMonthlyVnd, {
                style: "currency",
                currency: BILLING_CURRENCY,
                maximumFractionDigits: 0
              })
            }))
          })),
          selectedOfferId: requestFlow.item?.id,
          selectedTierId: requestFlow.tier?.id
        }
      },
      on: {
        request: () => void submit(),
        selectOffer,
        selectTier
      }
    };
  };
  const readyView = (readyFlow: Extract<AgentOSFlow, {
    readonly phase: "ready";
  }>): AgentOSProvisioningViewProps => {
    if (aiReadiness?.aiReady === true) return {
      state: "ready",
      props: {
        ...viewLabels,
        steps,
        subject: readyFlow.subject,
        detail: readyFlow.detail,
        statusTitle: t("readyTitle"),
        statusText: entryRefusal ?? t("agentos.aiReady"),
        statusActionLabel: t("agentos.manage"),
        isRequestPending: entryPending
      },
      on: {
        statusAction: () => void enterWorkspace()
      }
    };
    const operationsSettled = aiReadiness?.readinessOperationId === null && aiReadiness.knowledgeRecoveryOperationId === null;
    if (aiReadiness === null || aiReadiness?.failureCode !== null && aiReadiness?.failureCode !== undefined && operationsSettled) return {
      state: "failed",
      props: {
        ...viewLabels,
        steps,
        subject: readyFlow.subject,
        detail: readyFlow.detail,
        statusTitle: t("failedTitle"),
        statusText: aiReadiness?.failureCode ?? t("failedLoad"),
        statusActionLabel: t("agentos.retryAi"),
        isRequestPending: aiRetryPending
      },
      on: {
        statusAction: () => void retryAiReadiness()
      }
    };
    let statusText = t("agentos.aiTesting");
    if (aiReadiness === undefined) statusText = t("agentos.aiLoading");else if (aiReadiness.knowledgeRecoveryOperationId !== null) statusText = t("agentos.aiRecovering");
    return {
      state: "preparing",
      props: {
        ...viewLabels,
        steps,
        subject: readyFlow.subject,
        detail: readyFlow.detail,
        statusTitle: t("preparingTitle"),
        statusText,
        statusActionLabel: t("agentos.watchProvisioning"),
        statusActionDisabled: true
      }
    };
  };
  const unknownView = (unknownFlow: Extract<AgentOSFlow, {
    readonly phase: "payment_unknown" | "provisioning_unknown";
  }>): AgentOSProvisioningViewProps => ({
    state: unknownFlow.phase,
    props: {
      ...viewLabels,
      steps,
      subject: unknownFlow.subject,
      detail: unknownFlow.detail,
      statusTitle: unknownFlow.phase === "payment_unknown" ? t("agentos.paymentTitle") : t("agentos.acceptedTitle"),
      statusText: unknownFlow.reason,
      statusActionLabel: tShared("agentos.retry"),
      isRequestPending: reconciling
    },
    on: {
      statusAction: () => void reconcile(unknownFlow.orderId)
    }
  });
  const view = (): AgentOSProvisioningViewProps => {
    switch (flow.phase) {
      case "catalog_loading":
        return {
          state: flow.phase,
          props: {
            ...viewLabels,
            steps,
            subject: productName,
            detail: t("loadingText"),
            statusTitle: t("loadingTitle"),
            statusText: t("loadingText")
          }
        };
      case "request":
      case "submitting":
        return requestView(flow);
      case "failed":
        return {
          state: "failed",
          props: {
            ...viewLabels,
            steps,
            subject: flow.subject,
            detail: flow.detail,
            statusTitle: t("failedTitle"),
            statusText: flow.reason,
            statusActionLabel: t("agentos.startAgain")
          },
          on: {
            statusAction: () => router.push("/agentos")
          }
        };
      case "awaiting_payment":
        {
          const walletTarget = walletTargetOf(flow.orderId, flow.invoiceId, locale);
          return {
            state: flow.phase,
            props: {
              ...viewLabels,
              steps,
              subject: flow.subject,
              detail: flow.detail,
              statusTitle: t("agentos.paymentTitle"),
              statusText: t("agentos.paymentText"),
              statusActionLabel: t("agentos.openWallet"),
              statusActionDisabled: walletTarget === undefined
            },
            on: {
              statusAction: walletTarget === undefined ? undefined : () => router.push(walletTarget)
            }
          };
        }
      case "payment_unknown":
      case "provisioning_unknown":
        return unknownView(flow);
      case "ready":
        return readyView(flow);
      case "accepted":
      case "preparing":
        {
          const isAccepted = flow.phase === "accepted";
          const settledText = isAccepted ? t("agentos.acceptedText") : t("agentos.preparingText");
          const statusText = realtime.status === "connecting" ? t("connecting") : settledText;
          return {
            state: flow.phase,
            props: {
              ...viewLabels,
              steps,
              subject: flow.subject,
              detail: flow.detail,
              statusTitle: isAccepted ? t("agentos.acceptedTitle") : t("preparingTitle"),
              statusText,
              statusActionLabel: isAccepted ? t("agentos.watchFulfillment") : t("agentos.watchProvisioning"),
              statusActionDisabled: true
            }
          };
        }
    }
  };
  return <AgentOSProvisioningBase {...view()} />;
};
