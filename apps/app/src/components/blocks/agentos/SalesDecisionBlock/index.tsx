"use client";

import { useTranslations } from "next-intl";
import type { SalesTranslation } from "@/modules/sales/sales-workbench";
import { SalesDecisionBlockBase, type SalesDecisionBlockView } from "./component";

/** The route identities the decision surface is reached by; the read's own selector arrives with it. */
export type SalesDecisionBlockProps = { readonly workspaceId: string; readonly installationId: string };

/*
 * The surface's first standing. The route discloses where the surface is drafted against, and nothing
 * else is known: the instance coordinate, the proposal and the basis an answer is bound to are all
 * reads, so every region holds its loading standing with no fact shown and no press addressable. An
 * unreadable surface that draws a proposal, a version or a fingerprint it never read would be worse
 * than one that says it is still reading.
 */
const unconnected = (props: SalesDecisionBlockProps, t: SalesTranslation): SalesDecisionBlockView => ({
  t,
  scopeWorkspace: props.workspaceId,
  scopeInstallation: props.installationId,
  scopeReady: false,
  scopeStanding: "loading",
  notice: null,
  proposal: {
    standing: "loading",
    model: null,
    decisionRequestId: "",
    setDecisionRequestId: () => undefined,
    isLoading: false,
    reload: () => undefined
  },
  answer: {
    standing: "loading",
    choice: "approve",
    setChoice: () => undefined,
    expectedRevision: "",
    setExpectedRevision: () => undefined,
    isAnswering: false,
    addressable: false,
    stale: false,
    onSubmit: () => undefined
  }
});

/** Draw the decision surface reached at its own route for its own installation. */
export const SalesDecisionBlock = (props: SalesDecisionBlockProps) => {
  const translate = useTranslations("agentos.sales.decision");
  const t: SalesTranslation = (key, values) => translate(key as never, values as never);
  return <SalesDecisionBlockBase view={unconnected(props, t)} />;
};