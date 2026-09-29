"use client";

import { bindChatbotChannel, reconcileChatbotDelivery, resolveChatbotHandoff, retryWorkspaceProvisioningOrder, setChatbotHandoff, startChatbotZaloOauth } from "@/modules/api/workspace-controlplane";
import { useAccessToken } from "../../auth/useAccessToken";
import { useNivoMutation } from "../useNivoMutation";
import { agentWorkspacesQueryKey } from "../queries/console";
import { chatbotWorkbenchQueryKey, type SupportQueryIdentity } from "../queries/useQueryChatbotWorkbenchSwr";
type AcceptedAnswer = {
  readonly ok: boolean;
};
const accepted = (answer: AcceptedAnswer) => answer.ok;
const chatbotInvalidations = (identity: SupportQueryIdentity) => [chatbotWorkbenchQueryKey(identity)];

/** Bind an already-sealed channel reference, then re-read only this installation. */
export const useMutateBindChatbotChannelSwr = (identity: SupportQueryIdentity) => {
  const accessToken = useAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "bind-channel", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => bindChatbotChannel(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Begin the installation-qualified Zalo OAuth redirect handshake. */
export const useMutateStartChatbotZaloOauthSwr = (identity: SupportQueryIdentity) => {
  const accessToken = useAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "zalo-oauth", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => startChatbotZaloOauth(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Enter human handoff with readback on the exact installation cache key. */
export const useMutateSetChatbotHandoffSwr = (identity: SupportQueryIdentity) => {
  const accessToken = useAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "handoff", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => setChatbotHandoff(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Return a human-owned conversation to automation through explicit authority. */
export const useMutateResolveChatbotHandoffSwr = (identity: SupportQueryIdentity) => {
  const accessToken = useAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "resolve-handoff", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => resolveChatbotHandoff(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Settle ambiguous evidence explicitly; this path never retries a provider send. */
export const useMutateReconcileChatbotDeliverySwr = (identity: SupportQueryIdentity) => {
  const accessToken = useAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "reconcile-delivery", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => reconcileChatbotDelivery(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Re-drive provisioning of one failed workspace; the workspace row is the fenced retry identity. */
export const useMutateRetryWorkspaceProvisioningOrderSwr = (workspaceId: string) => useNivoMutation(["agentos", "workspace-provisioning-retry", workspaceId], () => retryWorkspaceProvisioningOrder(workspaceId), {
  invalidates: [agentWorkspacesQueryKey], shouldInvalidate: accepted
});
