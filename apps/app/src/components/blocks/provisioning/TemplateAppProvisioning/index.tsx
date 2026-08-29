"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutateCreateAndPublishExpertSiteSwr, useQueryCatalogItemsSwr, useQueryMyExpertSiteDeploymentSwr } from "@/hooks/swr";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import type { ExpertDeploymentSnapshot } from "@/modules/api/console";
import useProvisioningRealtime, { type ProvisioningTarget } from "@/modules/realtime/provisioning";
import { TemplateAppProvisioningBase, type TemplateAppProvisioningViewProps } from "./component";

/** Route identity owned by the template-app provisioning block. */
export type TemplateAppProvisioningProps = {
  readonly context: {
    readonly mode: "new";
    readonly templateKey: string;
  } | {
    readonly mode: "resume";
    readonly siteId: string;
  };
};
type TemplateFlow = {
  readonly phase: "catalog_loading";
} | {
  readonly phase: "unsupported";
  readonly name: string;
} | {
  readonly phase: "request";
  readonly name: string;
} | {
  readonly phase: "submitting";
  readonly name: string;
} | {
  readonly phase: "accepted";
  readonly siteId: string;
  readonly subject: string;
} | {
  readonly phase: "preparing";
  readonly siteId: string;
  readonly deploymentId: string;
  readonly publicHost: string | null;
} | {
  readonly phase: "ready";
  readonly siteId: string;
  readonly deploymentId: string;
  readonly publicHost: string | null;
} | {
  readonly phase: "failed";
  readonly subject: string;
  readonly reason: string;
};

/** Map backend deployment vocabulary onto the flow's visible state. */
const deploymentPhase = (status: string): "preparing" | "ready" | "failed" => {
  if (status === "running" || status === "ready") return "ready";
  if (status === "failed") return "failed";
  return "preparing";
};

/** Map the durable deployment projection into the provisioning state machine. */
const settleDeployment = (siteId: string, subject: string, snapshot: ExpertDeploymentSnapshot | null, failedProvision: string): TemplateFlow => {
  if (snapshot === null) return {
    phase: "accepted",
    siteId,
    subject
  };
  const phase = deploymentPhase(snapshot.status);
  if (phase === "failed") return {
    phase: "failed",
    subject,
    reason: failedProvision
  };
  return {
    phase,
    siteId,
    deploymentId: snapshot.id,
    publicHost: snapshot.publicHost
  };
};

/**
 * Which of the four visible steps each flow phase is standing on.
 *
 * A TABLE RATHER THAN A CHAIN, because the mapping is a fact about the vocabulary and not a
 * decision: a reader checking "where does `failed` sit" reads one line instead of unpicking two
 * conditions.
 */
const PHASE_INDEX: Readonly<Record<TemplateFlow["phase"], number>> = {
  catalog_loading: 0,
  unsupported: 0,
  request: 0,
  submitting: 0,
  accepted: 2,
  preparing: 2,
  failed: 2,
  ready: 3
};

/** How one step reads against the step the flow is standing on. */
type StepState = "done" | "current" | "upcoming";

/** Settle one step against the current position. */
const stepState = (index: number, phaseIndex: number): StepState => {
  if (index < phaseIndex) return "done";
  if (index === phaseIndex) return "current";
  return "upcoming";
};

/** Own academy creation, K8s deployment snapshots and the matching deployment stream. */
export const TemplateAppProvisioning = (props: TemplateAppProvisioningProps) => {
  const {
    context
  }: TemplateAppProvisioningProps = props;
  const t = useTranslations("console.provisioningFlows");
  const router = useRouter();
  const session = useSession();
  const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
  const [slug, setSlug] = useState("");
  const createAndPublish = useMutateCreateAndPublishExpertSiteSwr();
  const [flow, setFlow] = useState<TemplateFlow>({
    phase: "catalog_loading"
  });
  const isNew = context.mode === "new";
  const templateKey = context.mode === "new" ? context.templateKey : null;
  const resumeSiteId = context.mode === "resume" ? context.siteId : null;
  const trackedSiteId = resumeSiteId ?? (flow.phase === "accepted" || flow.phase === "preparing" || flow.phase === "ready" ? flow.siteId : undefined);
  const catalogueQuery = useQueryCatalogItemsSwr("site_from_template", isNew);
  const deploymentQuery = useQueryMyExpertSiteDeploymentSwr(trackedSiteId ?? undefined, flow.phase === "accepted" || flow.phase === "preparing");
  const refreshDeployment = deploymentQuery.mutate;
  useEffect(() => {
    if (!isNew || templateKey === null || catalogueQuery.data === undefined) return;
    if (!catalogueQuery.data.ok) {
      setFlow({
        phase: "failed",
        subject: templateKey,
        reason: t("failedLoad")
      });
      return;
    }
    const item = catalogueQuery.data.data.find(candidate => candidate.templateKey === templateKey);
    if (item === undefined || templateKey !== "ai_academy") {
      setFlow({
        phase: "unsupported",
        name: item?.name ?? templateKey
      });
      return;
    }
    setFlow(current => current.phase === "catalog_loading" ? {
      phase: "request",
      name: item.name
    } : current);
  }, [catalogueQuery.data, isNew, t, templateKey]);
  useEffect(() => {
    const deployment = deploymentQuery.data;
    if (trackedSiteId === undefined || accessToken === null || deployment === undefined) return;
    if (!deployment.ok) {
      setFlow({
        phase: "failed",
        subject: trackedSiteId,
        reason: t("failedLoad")
      });
      return;
    }
    setFlow(current => {
      const subject = current.phase === "accepted" ? current.subject : trackedSiteId;
      const settled = settleDeployment(trackedSiteId, subject, deployment.data, t("failedProvision"));
      if (current.phase === settled.phase && current.phase !== "accepted") return current;
      return settled;
    });
  }, [accessToken, deploymentQuery.data, t, trackedSiteId]);
  const target: ProvisioningTarget | null = flow.phase === "preparing" || flow.phase === "ready" ? {
    kind: "deployment",
    id: flow.deploymentId
  } : null;
  const realtime = useProvisioningRealtime({
    accessToken,
    target
  });
  useEffect(() => {
    if (realtime.status !== "event" || realtime.event.kind !== "deployment") return;
    const phase = deploymentPhase(realtime.event.status);
    if (phase === "failed") {
      setFlow({
        phase: "failed",
        subject: realtime.event.id,
        reason: realtime.event.reason ?? t("failedProvision")
      });
      return;
    }
    setFlow(current => current.phase === "preparing" || current.phase === "ready" ? {
      ...current,
      phase
    } : current);
  }, [realtime, t]);
  useEffect(() => {
    if (realtime.status !== "connected" || trackedSiteId === undefined) return;
    void refreshDeployment();
  }, [realtime.status, refreshDeployment, trackedSiteId]);
  const submit = async () => {
    if (flow.phase !== "request" || slug.trim() === "") return;
    setFlow({
      phase: "submitting",
      name: flow.name
    });
    try {
      const published = await createAndPublish.trigger(slug.trim());
      if (!published.ok) {
        setFlow({
          phase: "failed",
          subject: slug.trim(),
          reason: published.reason
        });
        return;
      }
      setFlow({
        phase: "accepted",
        siteId: published.data.id,
        subject: published.data.slug
      });
      router.replace(`/apps/${published.data.id}/provisioning`);
    } catch {
      setFlow({
        phase: "failed",
        subject: slug.trim(),
        reason: t("failedLoad")
      });
    }
  };
  const phaseIndex = PHASE_INDEX[flow.phase];
  const stepLabels = [t("steps.request"), t("steps.createApp"), t("steps.infrastructure"), t("steps.manage")];
  const stepStateLabels: Readonly<Record<StepState, string>> = {
    done: t("stepState.done"),
    current: t("stepState.current"),
    upcoming: t("stepState.upcoming")
  };
  const steps = stepLabels.map((label, index) => {
    const state = stepState(index, phaseIndex);
    return {
      ordinal: String(index + 1),
      label,
      state,
      stateLabel: stepStateLabels[state]
    };
  });
  const subject = (): string => {
    switch (flow.phase) {
      case "catalog_loading":
        return t("template.productName");
      case "request":
      case "submitting":
      case "unsupported":
        return flow.name;
      case "failed":
      case "accepted":
        return flow.subject;
      case "preparing":
      case "ready":
        return flow.publicHost ?? flow.siteId;
    }
  };
  const detail = (): string => {
    if (flow.phase === "preparing" || flow.phase === "ready") return flow.deploymentId;
    if (flow.phase === "accepted") return flow.siteId;
    return t("template.detail");
  };
  const view = (): TemplateAppProvisioningViewProps => {
    const common = {
      steps,
      subject: subject(),
      detail: detail(),
      slugLabel: t("template.slugLabel"),
      slugPlaceholder: t("template.slugPlaceholder"),
      slugHint: t("template.slugHint"),
      submitLabel: t("template.submit")
    };
    if (flow.phase === "unsupported") return {
      state: "unsupported",
      props: {
        ...common,
        statusTitle: t("unsupportedTitle"),
        statusText: t("unsupportedText"),
        actionLabel: t("backToApps")
      },
      on: {
        act: () => router.push("/apps")
      }
    };
    if (flow.phase === "failed") return {
      state: "failed",
      props: {
        ...common,
        statusTitle: t("failedTitle"),
        statusText: flow.reason,
        actionLabel: t("backToApps")
      },
      on: {
        act: () => router.push("/apps")
      }
    };
    if (flow.phase === "request" || flow.phase === "submitting") return {
      state: flow.phase,
      props: {
        ...common,
        statusTitle: t("template.requestTitle"),
        statusText: t("template.requestText")
      },
      on: {
        changeSlug: setSlug,
        submit: () => void submit()
      }
    };
    if (flow.phase === "ready") return {
      state: "ready",
      props: {
        ...common,
        statusTitle: t("readyTitle"),
        statusText: t("template.readyText"),
        actionLabel: t("manageApps")
      },
      on: {
        act: () => router.push(`/apps/${flow.siteId}`)
      }
    };
    if (flow.phase === "accepted") return {
      state: "accepted",
      props: {
        ...common,
        statusTitle: t("template.acceptedTitle"),
        statusText: t("template.acceptedText")
      }
    };
    const isCatalogLoading = flow.phase === "catalog_loading";
    const waitingText = realtime.status === "connecting" ? t("connecting") : t("template.preparingText");
    return {
      state: flow.phase,
      props: {
        ...common,
        statusTitle: isCatalogLoading ? t("loadingTitle") : t("preparingTitle"),
        statusText: isCatalogLoading ? t("loadingText") : waitingText
      }
    };
  };
  return <TemplateAppProvisioningBase {...view()} />;
};
