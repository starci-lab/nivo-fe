"use client";

import { approveSupportReply, bindChatbotChannel, reconcileChatbotDelivery, reconcileSupportDelivery, resolveChatbotHandoff, setChatbotHandoff, setSupportTakeover, startChatbotZaloOauth } from "@/modules/api/workspace-controlplane";
import { useSession } from "@/modules/auth/session";
import { useNivoMutation } from "../use-nivo-mutation";
import { chatbotWorkbenchQueryKey, supportConversationsQueryKey, supportImportantFactsQueryKey, supportMessagesQueryKey, supportTicketsQueryKey, type SupportQueryIdentity } from "../queries/workspace-controlplane";
type SupportMutationIdentity = SupportQueryIdentity & {
  readonly conversationId: string | null;
};
type AcceptedAnswer = {
  readonly ok: boolean;
};
const accepted = (answer: AcceptedAnswer) => answer.ok;
const useSupportAccessToken = (): string | null => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};
const supportInvalidations = (identity: SupportMutationIdentity) => [supportConversationsQueryKey(identity), supportTicketsQueryKey(identity), supportImportantFactsQueryKey(identity), ...(identity.conversationId === null ? [] : [supportMessagesQueryKey(identity, identity.conversationId)])];
const chatbotInvalidations = (identity: SupportQueryIdentity) => [chatbotWorkbenchQueryKey(identity)];

/** Bind an already-sealed channel reference, then re-read only this installation. */
export const useMutateBindChatbotChannelSwr = (identity: SupportQueryIdentity) => {
  const accessToken = useSupportAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "bind-channel", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => bindChatbotChannel(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Begin the installation-qualified Zalo OAuth redirect handshake. */
export const useMutateStartChatbotZaloOauthSwr = (identity: SupportQueryIdentity) => {
  const accessToken = useSupportAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "zalo-oauth", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => startChatbotZaloOauth(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Enter human handoff with readback on the exact installation cache key. */
export const useMutateSetChatbotHandoffSwr = (identity: SupportQueryIdentity) => {
  const accessToken = useSupportAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "handoff", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => setChatbotHandoff(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Return a human-owned conversation to automation through explicit authority. */
export const useMutateResolveChatbotHandoffSwr = (identity: SupportQueryIdentity) => {
  const accessToken = useSupportAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "resolve-handoff", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => resolveChatbotHandoff(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Settle ambiguous evidence explicitly; this path never retries a provider send. */
export const useMutateReconcileChatbotDeliverySwr = (identity: SupportQueryIdentity) => {
  const accessToken = useSupportAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["chatbot", "reconcile-delivery", identity.workspaceId, identity.installationId] : null, (input: Readonly<Record<string, unknown>>) => reconcileChatbotDelivery(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input), {
    invalidates: chatbotInvalidations(identity), shouldInvalidate: accepted
  });
};

/** Approve one AI reply while keeping credentials and support cache ownership out of the page. */
export const useMutateApproveSupportReplySwr = (identity: SupportMutationIdentity) => {
  const accessToken = useSupportAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["support", "approve-reply", identity.workspaceId, identity.installationId] : null, (decisionId: string) => approveSupportReply(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", decisionId), {
    invalidates: supportInvalidations(identity),
    shouldInvalidate: accepted
  });
};
type SupportTakeoverCommand = {
  readonly conversationId: string;
  readonly takeover: boolean;
};

/** Toggle human takeover for one customer conversation. */
export const useMutateSetSupportTakeoverSwr = (identity: SupportMutationIdentity) => {
  const accessToken = useSupportAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["support", "set-takeover", identity.workspaceId, identity.installationId] : null, (input: SupportTakeoverCommand) => setSupportTakeover(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input.conversationId, input.takeover), {
    invalidates: supportInvalidations(identity),
    shouldInvalidate: accepted
  });
};
type SupportDeliveryCommand = {
  readonly outboxId: string;
  readonly delivered: boolean;
};

/** Reconcile one provider delivery outcome and refresh the exact support projections. */
export const useMutateReconcileSupportDeliverySwr = (identity: SupportMutationIdentity) => {
  const accessToken = useSupportAccessToken();
  return useNivoMutation(identity.enabled && identity.hostname !== null && accessToken !== null ? ["support", "reconcile-delivery", identity.workspaceId, identity.installationId] : null, (input: SupportDeliveryCommand) => reconcileSupportDelivery(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input.outboxId, input.delivered), {
    invalidates: supportInvalidations(identity),
    shouldInvalidate: accepted
  });
};
