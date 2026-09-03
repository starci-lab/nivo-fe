"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { fleetResourceHref, type FleetStatus } from "@/components/blocks/provisioning/FleetRow";
import { useQueryMyAgentWorkspacesSwr } from "@/hooks";
import { AgentOSWorkspaceListBase, type AgentOSWorkspaceListViewProps } from "./component";
/** Public API role for AgentOSWorkspaceListProps. */
export type AgentOSWorkspaceListProps = object;
const STATUS: Readonly<Record<string, FleetStatus | undefined>> = {
  active: "active",
  ready: "ready",
  provisioning: "provisioning",
  failed: "failed",
  suspended: "suspended"
};

/** Own the workspace query and dashboard continuations for the AgentOS collection. */
export const AgentOSWorkspaceList = (props: AgentOSWorkspaceListProps) => {
  void props;
  const t = useTranslations("console");
  const router = useRouter();
  const query = useQueryMyAgentWorkspacesSwr();
  const answer = query.data;
  const view = (): AgentOSWorkspaceListViewProps => {
    const label = t("agentos.workspacesLabel");
    const summary = {
      workspaces: t("agentos.summary.workspaces"),
      workspacesCaption: t("agentos.summary.workspacesCaption"),
      running: t("agentos.summary.running"),
      runningCaption: t("agentos.summary.runningCaption"),
      attention: t("agentos.summary.attention"),
      attentionCaption: t("agentos.summary.attentionCaption")
    };
    if (answer === undefined) return {
      state: "resting",
      props: {
        label,
        summary
      }
    };
    if (!answer.ok) return {
      state: "refused",
      props: {
        label,
        summary,
        message: t("refusal.unknown")
      }
    };
    if (answer.data.length === 0) {
      return {
        state: "empty",
        props: {
          label,
          summary,
          message: t("agentos.emptyDescription"),
          actionLabel: t("agentos.create")
        },
        on: {
          create: () => router.push("/agentos/create")
        }
      };
    }
    return {
      state: "answered",
      on: {
        openWorkspace: id => router.push(fleetResourceHref("workspace", id))
      },
      props: {
        label,
        summary,
        rows: answer.data.map(workspace => {
          const status = STATUS[workspace.status] ?? "not_provisioned";
          return {
            id: workspace.id,
            name: workspace.name ?? t("agentos.kindWorkspace"),
            detail: workspace.catalogOrder?.id ?? workspace.id,
            kindLabel: t("agentos.kindWorkspace"),
            status,
            statusLabel: t(`status.${status === "not_provisioned" ? "notProvisioned" : status}`)
          };
        })
      }
    };
  };
  return <AgentOSWorkspaceListBase {...view()} />;
};

