"use client";

import type { ComponentProps } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useQueryMyAgentosModuleInstallationsSwr } from "@/hooks";
import { nivoQueryData } from "@/modules/query";
import type { AgentosModuleInstallation } from "@/modules/api/console";
import { RouteTabs, SelectionList, type SelectionListGroup, type SelectionListItem } from "@nivo/ui";

/** The nested route body rendered under this installation's shared subnavigation and tabs. */
export type AgentOSModuleInstallationLayoutProps = {
    readonly children: ComponentProps<"div">["children"];
};

/** The routed module sections in shell rev-17 order. */
const MODULE_TAB_SEGMENTS = ["setup", "operate", "test", "settings", "diagnostics"] as const;
type ModuleTabSegment = (typeof MODULE_TAB_SEGMENTS)[number];

/** Module keys the owner-delegated ruling names under the Chatbot and Accounting kind labels. */
const MODULE_KIND_BY_KEY: Readonly<Record<string, "chatbot" | "accounting">> = {
    "chatbot": "chatbot",
    "agentos-chatbot": "chatbot",
    "multichannel-chatbot": "chatbot",
    "accounting": "accounting",
    "finance-copilot": "accounting"
};

/** The routed module section answering one nested pathname; the bare installation route hosts setup. */
const moduleSegmentFor = (pathname: string, moduleRoot: string): ModuleTabSegment =>
    MODULE_TAB_SEGMENTS.find(segment => pathname === `${moduleRoot}/${segment}`) ?? "setup";

/** Group each evidenced installation under its declared module-kind label, siblings kept distinct. */
const installationGroups = (
    installations: ReadonlyArray<Pick<AgentosModuleInstallation, "id" | "moduleKey" | "displayName">>,
    labelFor: (kind: "chatbot" | "accounting") => string,
    unknownLabelFor: (moduleKey: string) => string
): ReadonlyArray<SelectionListGroup> => {
    const groupsById = new Map<string, { readonly label: string; readonly items: Array<SelectionListItem> }>();
    for (const installation of installations) {
        const kind = MODULE_KIND_BY_KEY[installation.moduleKey];
        const groupId = kind ?? `module-${installation.moduleKey}`;
        const group = groupsById.get(groupId) ?? {
            label: kind === undefined ? unknownLabelFor(installation.moduleKey) : labelFor(kind),
            items: []
        };
        group.items.push({
            id: installation.id,
            label: installation.displayName || installation.moduleKey,
            icon: "agentos"
        });
        groupsById.set(groupId, group);
    }
    return [...groupsById.entries()].map(([id, group]) => ({
        id,
        label: group.label,
        items: group.items
    }));
};

/**
 * Add the module subnavigation of this workspace's installations and the setup/operate/test/
 * settings/diagnostics route tabs, all bound to the exact workspace and installation segments.
 */
const AgentOSModuleInstallationLayout = ({ children }: AgentOSModuleInstallationLayoutProps) => {
    const { workspaceId, installationId } = useParams<{ readonly workspaceId: string; readonly installationId: string }>();
    const t = useTranslations("console.agentos.modules.shell");
    const pathname = usePathname();
    const router = useRouter();
    const installationsQuery = useQueryMyAgentosModuleInstallationsSwr(workspaceId);
    const installations = nivoQueryData(installationsQuery.data) ?? [];
    const moduleRoot = `/agentos/workspaces/${workspaceId}/modules/${installationId}`;
    const groups = installationGroups(
        installations,
        (kind): string => t(`kind.${kind}`),
        (moduleKey): string => t("unknownKind", { kind: moduleKey })
    );
    const listedIds = new Set(groups.flatMap(group => group.items.map(item => item.id)));
    const navigationGroups: ReadonlyArray<SelectionListGroup> = listedIds.has(installationId) ? groups : [...groups, {
        id: "current",
        items: [{
            id: installationId,
            label: installationId,
            icon: "agentos" as const
        }]
    }];
    return <div className="flex flex-col gap-4" data-region="installation-nested-layout">
        <nav aria-label={t("modules")} data-region="module-subnavigation">
            <SelectionList props={{
                label: t("modules"),
                selectedKey: installationId,
                groups: navigationGroups
            }} on={{
                activate: id => {
                    if (id !== installationId) router.push(`/agentos/workspaces/${workspaceId}/modules/${id}`);
                }
            }} />
        </nav>
        <RouteTabs props={{
            label: t("sections"),
            selectedKey: moduleSegmentFor(pathname, moduleRoot),
            tabs: MODULE_TAB_SEGMENTS.map(segment => ({
                id: segment,
                label: t(segment)
            }))
        }} on={{
            select: segment => router.push(`${moduleRoot}/${segment}`)
        }} />
        {children}
    </div>;
};

export default AgentOSModuleInstallationLayout;
