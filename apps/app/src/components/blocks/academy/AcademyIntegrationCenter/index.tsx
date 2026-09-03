"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutateAcademyIntegrationSwr, useQueryMyAcademyIntegrationsSwr } from "@/hooks";
import { nivoQueryData } from "@/modules/query";
import { AcademyIntegrationCenterBase, type AcademyIntegrationCard, type AcademyIntegrationFormField } from "./component";

/** Owner-scoped identity consumed by Integration Center. */
export type AcademyIntegrationCenterProps = {
  readonly siteId: string;
};
type ProviderId = "domain" | "google" | "smtp" | "payment" | "zalo" | "ga4" | "meta_pixel" | "webhook";
const knownStatuses = new Set(["absent", "connected", "verified", "live", "configured", "rejected", "failed", "expired", "pending", "unreachable", "authorizing"]);

/** Keep provider-defined wire states from escaping the resolved message catalog. */
const statusKeyOf = (status: string) => knownStatuses.has(status) ? status : "absent";

/** Convert provider wire states into semantic card tones. */
const toneOf = (status: string): "neutral" | "success" | "warning" | "danger" => {
  if (["connected", "verified", "live", "configured"].includes(status)) return "success";
  if (["rejected", "failed", "expired"].includes(status)) return "danger";
  if (["pending", "unreachable", "authorizing"].includes(status)) return "warning";
  return "neutral";
};

/** Own provider forms and write-only mutations; safe status is reloaded after each save. */
export const AcademyIntegrationCenter = (props: AcademyIntegrationCenterProps) => {
  const {
    siteId
  }: AcademyIntegrationCenterProps = props;
  const t = useTranslations("console.academyControlCenter.integrations");
  const query = useQueryMyAcademyIntegrationsSwr(siteId);
  const integrationMutation = useMutateAcademyIntegrationSwr(siteId);
  const answer = nivoQueryData(query.data);
  const [selectedId, setSelectedId] = useState<ProviderId>();
  const [values, setValues] = useState<Readonly<Record<string, string>>>({});
  const [pendingId, setPendingId] = useState<ProviderId>();
  const [outcome, setOutcome] = useState<string>();
  const provider = (id: ProviderId) => {
    if (answer === null || answer === undefined) return undefined;
    if (id === "google") return answer.google;
    if (id === "zalo") return answer.zalo;
    if (id === "ga4" || id === "meta_pixel") return answer.analytics.find(item => item.provider === id);
    return undefined;
  };
  const credentialDetail = (prefix: string) => {
    const count = answer?.credentials.filter(item => item.key.startsWith(prefix)).length ?? 0;
    return count === 0 ? t("notConfigured") : t("credentialCount", {
      count
    });
  };
  const paymentCredentialDetail = () => {
    const count = answer?.credentials.filter(item => item.key.startsWith("PAYOS_") || item.key.startsWith("SEPAY_")).length ?? 0;
    return count === 0 ? t("notConfigured") : t("credentialCount", {
      count
    });
  };
  /** A custom domain is live once DNS answers, absent until one is claimed, and pending in between. */
  const domainStatus = (): "live" | "absent" | "pending" => {
    if (answer?.customDomain?.dnsReady === true) return "live";
    if (answer?.customDomain?.domain === null || answer?.customDomain === undefined) return "absent";
    return "pending";
  };
  const cards: ReadonlyArray<AcademyIntegrationCard> = ([{
    id: "domain",
    status: domainStatus(),
    detail: answer?.customDomain?.domain === null || answer?.customDomain?.domain === undefined ? undefined : `${answer.customDomain.domain} → ${answer.customDomain.target}`
  }, {
    id: "google",
    status: provider("google")?.status ?? "absent",
    detail: provider("google")?.reason ?? provider("google")?.clientId
  }, {
    id: "smtp",
    status: answer?.credentials.some(item => item.key.startsWith("SMTP_") && item.verification === "verified") === true ? "verified" : "absent",
    detail: credentialDetail("SMTP_")
  }, {
    id: "payment",
    status: answer?.credentials.some(item => (item.key.startsWith("PAYOS_") || item.key.startsWith("SEPAY_")) && item.verification === "verified") === true ? "verified" : "absent",
    detail: paymentCredentialDetail()
  }, {
    id: "zalo",
    status: provider("zalo")?.status ?? "absent",
    detail: provider("zalo")?.reason
  }, {
    id: "ga4",
    status: provider("ga4")?.status ?? "absent",
    detail: provider("ga4")?.identifier
  }, {
    id: "meta_pixel",
    status: provider("meta_pixel")?.status ?? "absent",
    detail: provider("meta_pixel")?.identifier
  }, {
    id: "webhook",
    status: answer?.webhooks.some(item => item.enabled) === true ? "connected" : "absent",
    detail: answer === null || answer === undefined ? undefined : t("webhookCount", {
      count: answer.webhooks.length
    })
  }] as const).map(item => ({
    id: item.id,
    title: t(`providers.${item.id}.title`),
    description: t(`providers.${item.id}.description`),
    statusLabel: t(`status.${statusKeyOf(item.status)}`),
    statusTone: toneOf(item.status),
    detail: item.detail ?? undefined,
    actionLabel: t("configure")
  }));
  const fieldsOf = (id: ProviderId): ReadonlyArray<AcademyIntegrationFormField> => {
    if (id === "domain") return [{
      id: "academy-domain",
      name: "domain",
      label: t("fields.domain"),
      hint: answer?.customDomain?.target === undefined ? undefined : t("dnsTarget", {
        target: answer.customDomain.target
      })
    }];
    if (id === "google") return [{
      id: "academy-google-client-id",
      name: "clientId",
      label: t("fields.clientId")
    }, {
      id: "academy-google-client-secret",
      name: "clientSecret",
      label: t("fields.clientSecret"),
      kind: "password"
    }];
    if (id === "smtp" || id === "payment") return [{
      id: `academy-${id}-key`,
      name: "credentialKey",
      label: t("fields.credentialKey"),
      hint: t(`providers.${id}.keys`)
    }, {
      id: `academy-${id}-value`,
      name: "credentialValue",
      label: t("fields.credentialValue"),
      kind: "password"
    }];
    if (id === "zalo") return [];
    if (id === "ga4" || id === "meta_pixel") return [{
      id: `academy-${id}-identifier`,
      name: "identifier",
      label: t("fields.identifier")
    }, {
      id: `academy-${id}-consent`,
      name: "consentMode",
      label: t("fields.consentMode"),
      hint: "required | granted | denied"
    }];
    return [{
      id: "academy-webhook-endpoint",
      name: "endpoint",
      label: t("fields.endpoint")
    }, {
      id: "academy-webhook-events",
      name: "events",
      label: t("fields.events"),
      hint: "student.created, student.updated, student.status.changed, course.access.changed"
    }];
  };

  /** Consent mode is a closed vocabulary; anything else the field holds means the default. */
  const consentModeOf = (value: string | undefined) => value === "granted" || value === "denied" ? value : "required";

  /** Each provider writes through its own mutation; the caller owns the shared pending state. */
  const saveProvider = async (id: ProviderId) => {
    if (id === "domain") return integrationMutation.trigger({
      kind: "domain",
      domain: values.domain?.trim() || null
    });
    if (id === "google") return integrationMutation.trigger({
      kind: "google",
      clientId: values.clientId ?? "",
      clientSecret: values.clientSecret ?? ""
    });
    if (id === "smtp" || id === "payment") return integrationMutation.trigger({
      kind: "credential",
      key: values.credentialKey ?? "",
      value: values.credentialValue ?? ""
    });
    if (id === "zalo") return integrationMutation.trigger({
      kind: "zalo"
    });
    if (id === "ga4" || id === "meta_pixel") return integrationMutation.trigger({
      kind: "analytics",
      provider: id,
      identifier: values.identifier?.trim() || null,
      consentMode: consentModeOf(values.consentMode)
    });
    return integrationMutation.trigger({
      kind: "webhook",
      endpoint: values.endpoint ?? "",
      events: (values.events ?? "").split(",").map(event => event.trim()).filter(Boolean)
    });
  };

  /** A webhook reports the copied signing secret; every other provider reports a plain save. */
  const outcomeOf = (id: ProviderId, ok: boolean) => {
    if (!ok) return t("saveFailed");
    return id === "webhook" ? t("webhookSecretCopied") : t("saved");
  };
  const submit = async () => {
    if (selectedId === undefined) return;
    setPendingId(selectedId);
    setOutcome(undefined);
    const result = await saveProvider(selectedId);
    if (result.ok && selectedId === "zalo" && result.authorizationUrl !== undefined) window.open(result.authorizationUrl, "academy-zalo-oauth", "popup,width=520,height=720");
    if (result.ok && selectedId === "webhook" && result.signingSecret !== undefined) {
      try {
        await navigator.clipboard.writeText(result.signingSecret);
      } catch {/* Browser permission may refuse clipboard; never echo the secret into the DOM. */}
    }
    setOutcome(outcomeOf(selectedId, result.ok));
    setPendingId(undefined);
  };
  const settledState = answer === null ? "refused" : "answered";
  return <AcademyIntegrationCenterBase state={answer === undefined ? "resting" : settledState} sectionLabel={t("section")} refusedLabel={t("refused")} cards={cards} selected={selectedId === undefined ? undefined : {
    id: selectedId,
    label: t(`providers.${selectedId}.formLabel`),
    fields: fieldsOf(selectedId),
    submitLabel: selectedId === "zalo" ? t("authorize") : t("save")
  }} pendingId={pendingId} outcome={outcome} onSelect={id => {
    setSelectedId(id as ProviderId);
    setValues({});
    setOutcome(undefined);
  }} onChangeField={(name, value) => setValues(current => ({
    ...current,
    [name]: value
  }))} onSubmit={() => void submit()} />;
};
