"use client";

import type { ComponentProps } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks";
import { nivoQueryData } from "@/modules/query";
import { RouteTabs } from "@nivo/ui";
import { Heading, Text } from "@starci/grammar/common";

/** The nested route body rendered under this workspace's shared header and tabs. */
export type AgentOSWorkspaceNestedLayoutProps = {
    readonly children: ComponentProps<"div">["children"];
};

/** The rev-17 workspace destination answering one nested pathname. */
const workspaceTabFor = (pathname: string, modulesRoute: string): "overview" | "modules" =>
    pathname === modulesRoute || pathname.startsWith(`${modulesRoute}/`) ? "modules" : "overview";

/**
 * Keep the visible console chrome and add the exact workspace identity plus its overview/modules
 * route tabs above every nested workspace and installed-module route. Sibling purchase and
 * creation routes live outside this segment, so they never enter this header.
 */
const AgentOSWorkspaceNestedLayout = ({ children }: AgentOSWorkspaceNestedLayoutProps) => {
    const { workspaceId } = useParams<{ readonly workspaceId: string }>();
    const t = useTranslations("console.agentos");
    const pathname = usePathname();
    const router = useRouter();
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId);
    const workspaceName = nivoQueryData(controlCenter.data)?.workspace.name ?? workspaceId;
    const overviewRoute = `/agentos/workspaces/${workspaceId}`;
    const modulesRoute = `${overviewRoute}/modules`;
    return <div className="flex flex-col gap-4" data-region="workspace-nested-layout">
        <header className="flex flex-col gap-1" data-region="workspace-context">
            <Text as="p" size="xs" tone="muted">{t("workspace.eyebrow")}</Text>
            <Heading level={2}>{workspaceName}</Heading>
            <Text as="p" size="xs" tone="muted">{t("workspaceReference", { id: workspaceId })}</Text>
        </header>
        <RouteTabs props={{
            label: t("workspace.tabsLabel"),
            selectedKey: workspaceTabFor(pathname, modulesRoute),
            tabs: [{
                id: "overview",
                label: t("workspace.tabs.overview")
            }, {
                id: "modules",
                label: t("workspace.tabs.modules")
            }]
        }} on={{
            select: key => router.push(key === "modules" ? modulesRoute : overviewRoute)
        }} />
        {children}
    </div>;
};

export default AgentOSWorkspaceNestedLayout;
