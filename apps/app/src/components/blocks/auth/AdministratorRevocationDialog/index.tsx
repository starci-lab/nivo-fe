"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useMutateEndPrincipalSessionsSwr } from "@/hooks";
import { AdministratorRevocationDialogBase, type AdministratorRevocationStage } from "./component";

/** Props for the console's scoped administrator session ending. */
export type AdministratorRevocationDialogProps = {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
};

/** A fresh identity for one logical ending request, so a retry resends this exact value. */
const newRequestId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `principal-ending-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Connected scoped administrator ending: the resolve half of the confirmation above it.
 *
 * THE SCOPE IS THE ROUTE'S WORKSPACE, and only when the route has one. That is the single authority
 * context this surface acts under: no operator context is offered, because no accepted record names
 * an operator signal, and this half resolves only what the dialog is allowed to draw.
 *
 * ONE REQUEST IDENTITY PER LOGICAL REQUEST. It is minted on the first submission, kept while the
 * answer is unknown, and resent unchanged by the retry in the undecided state - so a timeout or a
 * lost response continues the same request instead of starting a second one. A named target that
 * changes is a *different* request, so the identity is dropped with it; the two settled endings drop
 * it as well, since neither can be continued.
 *
 * AN UNANSWERED AUTHORITY IS NEVER DRAWN AS A REFUSAL. A transport answer that is not a decided kind
 * - a refusal sentence, a malformed body, a request that never arrived - lands on the undecided
 * state, which claims no effect and keeps the identity for its retry.
 */
export const AdministratorRevocationDialog = (props: AdministratorRevocationDialogProps) => {
  const { isOpen, onOpenChange } = props;
  const t = useTranslations("console");
  const { workspaceId } = useParams<{ readonly workspaceId?: string }>();
  const workspace = workspaceId === undefined || workspaceId.length === 0 ? null : workspaceId;
  const [target, setTarget] = useState("");
  const [stage, setStage] = useState<AdministratorRevocationStage>("ready");
  const requestId = useRef<string | null>(null);
  const ending = useMutateEndPrincipalSessionsSwr();
  const submit = (): void => {
    if (stage === "pending" || workspace === null) {
      return;
    }
    const identity = requestId.current ?? newRequestId();
    requestId.current = identity;
    setStage("pending");
    void ending.trigger({ requestId: identity, targetPrincipal: target, workspaceId: workspace }).then((answer) => {
      if (answer.ok && answer.data.kind === "scopeApplied") {
        requestId.current = null;
        setStage("applied");
        return;
      }
      if (answer.ok && answer.data.kind === "refused") {
        requestId.current = null;
        setStage("refused");
        return;
      }
      setStage("undecided");
    });
  };
  return <AdministratorRevocationDialogBase props={{
    title: stage === "ready" ? t("account.endSessionsForPerson") : t("account.administratorEnding.title", {
      target
    }),
    description: t("account.administratorEnding.description"),
    targetLabel: t("account.administratorEnding.targetLabel"),
    target,
    contextLabel: t("account.administratorEnding.contextLabel"),
    context: t("account.administratorEnding.workspaceContext", {
      workspace: workspace ?? ""
    }),
    cancelLabel: t("account.administratorEnding.cancel"),
    confirmLabel: t("account.administratorEnding.confirm"),
    pendingLabel: t("account.administratorEnding.pending"),
    appliedLabel: t("account.administratorEnding.applied"),
    refusedLabel: t("account.administratorEnding.refused"),
    undecidedLabel: t("account.administratorEnding.undecided"),
    retryLabel: t("account.administratorEnding.retry"),
    stage
  }} on={{
    targetChange: (next: string) => {
      if (next !== target) {
        requestId.current = null;
      }
      setTarget(next);
    },
    confirm: () => {
      if (stage === "ready") {
        setStage("confirm");
        return;
      }
      submit();
    },
    retry: submit
  }} isOpen={isOpen} onOpenChange={(next: boolean) => {
    if (!next) {
      setStage("ready");
    }
    onOpenChange(next);
  }} />;
};