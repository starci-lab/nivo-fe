"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useQueryCatalogItemsSwr, useQueryMyAgentosAiKnowledgeReadinessSwr, useQueryMyAgentWorkspacesSwr, useQueryMyCatalogOrdersSwr, useQueryMyInvoicesSwr, useMutateOrderAgentosSwr, useMutateRunAgentosAiReadinessTestSwr } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { type AgentWorkspaceRow, type CatalogItemRow, type CatalogOrderRow, type CatalogTierRow, type InvoiceRow } from "@/modules/api/console";
import { nivoQueryData } from "@/modules/query";
import useProvisioningRealtime, { type ProvisioningTarget } from "@/modules/realtime/provisioning";
import { BILLING_CURRENCY } from "@/modules/config";
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
  readonly item: CatalogItemRow;
  readonly tier: CatalogTierRow | null;
} | {
  readonly phase: "submitting";
  readonly item: CatalogItemRow;
  readonly tier: CatalogTierRow | null;
} | {
  readonly phase: "awaiting_payment";
  readonly orderId: string;
  readonly invoiceId: string | null;
  readonly subject: string;
  readonly detail: string;
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
const workspacePhase = (status: string): "preparing" | "ready" | "failed" => {
  if (status === "active" || status === "ready") return "ready";
  if (status === "failed") return "failed";
  return "preparing";
};

/** The namespaced copy reader, so the settlement below can read the same strings off the surface. */
type ProvisioningCopy = ReturnType<typeof useTranslations>;

/** The three owner-scoped snapshots one order is settled against. */
type ProvisioningSnapshot = {
  readonly orders: ReadonlyArray<CatalogOrderRow>;
  readonly invoices: ReadonlyArray<InvoiceRow>;
  readonly workspaces: ReadonlyArray<AgentWorkspaceRow>;
};

/**
 * Read one order out of a settled snapshot and say which phase it leaves the flow in.
 *
 * The workspace answers first because it is the later fact: once one exists, the order and the
 * invoice behind it have already been spent and no longer decide anything.
 */
const settleOrder = (orderId: string, snapshot: ProvisioningSnapshot, t: ProvisioningCopy, productName: string): AgentOSFlow => {
  const order = snapshot.orders.find(candidate => candidate.id === orderId);
  if (order === undefined) {
    return {
      phase: "failed",
      orderId,
      subject: productName,
      detail: orderId,
      reason: t("agentos.orderMissing"),
      atStep: 0
    };
  }
  const detail = order.catalogTier?.name ?? orderId;
  const workspace = snapshot.workspaces.find(candidate => candidate.catalogOrder?.id === orderId);
  if (workspace !== undefined) {
    const phase = workspacePhase(workspace.status);
    if (phase === "failed") {
      return {
        phase: "failed",
        orderId,
        subject: productName,
        detail: workspace.id,
        reason: t("failedProvision"),
        atStep: 2
      };
    }
    return {
      phase,
      orderId,
      workspaceId: workspace.id,
      subject: productName,
      detail: workspace.name ?? workspace.id
    };
  }
  const invoice = snapshot.invoices.find(candidate => candidate.catalogOrder?.id === orderId);
  if (order.status === "pending_payment" || invoice?.status === "unpaid") {
    return {
      phase: "awaiting_payment",
      orderId,
      invoiceId: invoice?.id ?? null,
      subject: productName,
      detail
    };
  }
  if (order.status === "cancelled") {
    return {
      phase: "failed",
      orderId,
      subject: productName,
      detail,
      reason: t("agentos.orderCancelled"),
      atStep: 1
    };
  }
  return {
    phase: "accepted",
    orderId,
    subject: productName,
    detail
  };
};

/** The one realtime subject a phase is waiting on, or nothing when it waits on no one. */
const realtimeTarget = (flow: AgentOSFlow): ProvisioningTarget | null => {
  if (flow.phase === "preparing" || flow.phase === "ready") return {
    kind: "workspace",
    id: flow.workspaceId
  };
  if (flow.phase === "awaiting_payment" || flow.phase === "accepted") return {
    kind: "order",
    id: flow.orderId
  };
  return null;
};

/** Which of the four customer outcomes the flow is standing on. A failure keeps its outcome. */
const phaseIndexOf = (flow: AgentOSFlow): number => {
  if (flow.phase === "catalog_loading" || flow.phase === "request" || flow.phase === "submitting") return 0;
  if (flow.phase === "awaiting_payment") return 1;
  if (flow.phase === "accepted") return 2;
  if (flow.phase === "preparing") return 2;
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
const walletTargetOf = (orderId: string, invoiceId: string | null): string | undefined => {
  if (invoiceId === null) return undefined;
  const returnTo = `/agentos/orders/${orderId}`;
  const query = new URLSearchParams({
    orderId,
    invoiceId,
    returnTo
  });
  return `/wallet?${query.toString()}`;
};

/** Own the real order → payment → workspace lifecycle and its matching Socket.IO target. */
export const AgentOSProvisioning = (props: AgentOSProvisioningProps) => {
  const {
    context
  }: AgentOSProvisioningProps = props;
  const t = useTranslations("console.provisioningFlows");
  const format = useFormatter();
  const router = useRouter();
  const session = useSession();
  const productName = t("agentos.productName");
  const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
  const [flow, setFlow] = useState<AgentOSFlow>({
    phase: "catalog_loading"
  });
  const [aiRetryPending, setAiRetryPending] = useState(false);
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
  const aiReadinessQuery = useQueryMyAgentosAiKnowledgeReadinessSwr(readyWorkspaceId, aiRetryPending);
  const retryReadiness = useMutateRunAgentosAiReadinessTestSwr(readyWorkspaceId);
  const refreshAiReadiness = aiReadinessQuery.mutate;
  const aiReadiness = nivoQueryData(aiReadinessQuery.data);
  const reconcile = useCallback(async (orderId: string) => {
    const [orders, invoices, workspaces] = await Promise.all([refreshOrders(), refreshInvoices(), refreshWorkspaces()]);
    if (orders?.ok !== true || invoices?.ok !== true || workspaces?.ok !== true) {
      setFlow({
        phase: "failed",
        orderId,
        subject: productName,
        detail: orderId,
        reason: t("failedLoad"),
        atStep: 0
      });
      return;
    }
    setFlow(settleOrder(orderId, {
      orders: orders.data,
      invoices: invoices.data,
      workspaces: workspaces.data
    }, t, productName));
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
        reason: t("failedLoad"),
        atStep: 0
      });
      return;
    }
    setFlow(current => {
      if (current.phase !== "catalog_loading") return current;
      const item = catalogue.data[0];
      const tier = [...(item.tiers ?? [])].sort((left, right) => left.orderIndex - right.orderIndex)[0] ?? null;
      return {
        phase: "request",
        item,
        tier
      };
    });
  }, [catalogQuery.data, isResume, productName, t]);
  useEffect(() => {
    if (!isResume || accessToken === null || resumeOrderId === null) return;
    if (ordersQuery.data === undefined || invoicesQuery.data === undefined || workspacesQuery.data === undefined) return;
    if (!ordersQuery.data.ok || !invoicesQuery.data.ok || !workspacesQuery.data.ok) {
      setFlow({
        phase: "failed",
        orderId: resumeOrderId,
        subject: productName,
        detail: resumeOrderId,
        reason: t("failedLoad"),
        atStep: 0
      });
      return;
    }
    setFlow(settleOrder(resumeOrderId, {
      orders: ordersQuery.data.data,
      invoices: invoicesQuery.data.data,
      workspaces: workspacesQuery.data.data
    }, t, productName));
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
    const phase = workspacePhase(event.status);
    setFlow(current => {
      if (current.phase !== "preparing" && current.phase !== "ready") return current;
      if (phase === current.phase) return current;
      if (phase === "failed") return {
        phase: "failed",
        orderId: current.orderId,
        subject: current.subject,
        detail: current.detail,
        reason: event.reason ?? t("failedProvision"),
        atStep: 3
      };
      return {
        ...current,
        phase
      };
    });
  }, [realtime, reconcile, t]);
  useEffect(() => {
    if (flow.phase !== "accepted") return;
    const timer = window.setInterval(() => {
      void reconcile(flow.orderId);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [flow, reconcile]);
  useEffect(() => {
    if (flow.phase !== "preparing") return;
    // Socket.IO is the fast path, while the owner-scoped GraphQL snapshot is the recovery path
    // for a tab that reconnects after a terminal Kafka event has already been relayed.
    const timer = window.setInterval(() => {
      void reconcile(flow.orderId);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [flow, reconcile]);
  useEffect(() => {
    if (contextMode !== "resume" || resumeOrderId === null || realtime.status !== "connected") return;
    void reconcile(resumeOrderId);
  }, [contextMode, realtime.status, reconcile, resumeOrderId]);
  const submit = async () => {
    if (flow.phase !== "request") return;
    setFlow({
      phase: "submitting",
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
      const next = {
        phase: "awaiting_payment" as const,
        orderId: order.data.id,
        invoiceId: null,
        subject: productName,
        detail: order.data.catalogTier?.name ?? flow.tier?.name ?? order.data.id
      };
      setFlow(next);
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
    let detail = requestFlow.tier?.name ?? requestFlow.item.slug;
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
        subject: productName,
        detail,
        statusTitle: t("agentos.requestTitle"),
        statusText: t("agentos.requestText"),
        requestActionLabel: t("agentos.submit"),
        isRequestPending: requestFlow.phase === "submitting"
      },
      on: {
        request: () => void submit()
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
        statusText: t("agentos.aiReady"),
        statusActionLabel: t("agentos.manage")
      },
      on: {
        statusAction: () => router.push(`/agentos/workspaces/${readyFlow.workspaceId}?view=ai-knowledge`)
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
          const walletTarget = walletTargetOf(flow.orderId, flow.invoiceId);
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
