"use client";

import { useTranslations } from "next-intl";
import type { SalesTranslation } from "@/modules/sales/sales-workbench";
import { SalesHandoffBlockBase, type SalesHandoffBlockView } from "./component";

/** The route identities the handoff surface is reached by; the read's own selector arrives with it. */
export type SalesHandoffBlockProps = { readonly workspaceId: string; readonly installationId: string };

/*
 * The surface's first standing. The route discloses where the surface is drafted against, and nothing
 * else is known: the instance coordinate, the handoff and the content a submission claims are all
 * reads, so every region holds its loading standing with no fact shown and no press addressable. An
 * unreadable surface that draws a handoff, a revision or an admission it never read would be worse
 * than one that says it is still reading.
 */
const unconnected = (props: SalesHandoffBlockProps, t: SalesTranslation): SalesHandoffBlockView => ({
  t,
  scopeWorkspace: props.workspaceId,
  scopeInstallation: props.installationId,
  scopeReady: false,
  scopeStanding: "loading",
  notice: null,
  handoff: {
    standing: "loading",
    model: null,
    handoffId: "",
    setHandoffId: () => undefined,
    isLoading: false,
    reload: () => undefined
  },
  submission: {
    standing: "loading",
    fingerprint: "",
    setFingerprint: () => undefined,
    expectedRevision: "",
    setExpectedRevision: () => undefined,
    isSubmitting: false,
    addressable: false,
    lookupOnly: false,
    onSubmit: () => undefined
  }
});

/** Draw the handoff surface reached at its own route for its own installation. */
export const SalesHandoffBlock = (props: SalesHandoffBlockProps) => {
  const translate = useTranslations("agentos.sales.handoff");
  const t: SalesTranslation = (key, values): string => translate(key as never, values as never);
  return <SalesHandoffBlockBase view={unconnected(props, t)} />;
};