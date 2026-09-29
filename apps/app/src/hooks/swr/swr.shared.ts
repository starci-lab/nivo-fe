import type { CatalogCategory } from "@/modules/api/commerce"
import type { CollabTaskStatus } from "@/modules/api/collab"

/** The optional narrowing an Office task list is read with; every field is part of its cache key. */
export type CollabTasksFilter = {
    readonly personMemberId?: string
    readonly moduleInstallationId?: string
    readonly status?: CollabTaskStatus
    readonly cursor?: string
    readonly limit?: number
}

/** The authenticated workspace scope a collab read needs, or `null` while either half is missing so the read stays idle. */
export const collabScope = (
    accessToken: string | null,
    workspaceId: string | null,
): { readonly accessToken: string; readonly workspaceId: string } | null =>
    accessToken !== null && workspaceId !== null && workspaceId !== "" ? { accessToken, workspaceId } : null

/** SWR cache key of the agent workspaces read. */
export const QUERY_AGENT_WORKSPACES_SWR_KEY = ["agent-workspaces"] as const
/** SWR cache key of the catalog orders read. */
export const QUERY_CATALOG_ORDERS_SWR_KEY = ["catalog-orders"] as const
/** SWR cache key of the invoices read. */
export const QUERY_INVOICES_SWR_KEY = ["invoices"] as const
/** SWR cache key of the expert sites read. */
export const QUERY_EXPERT_SITES_SWR_KEY = ["expert-sites"] as const
/** SWR cache key of the instances read. */
export const QUERY_INSTANCES_SWR_KEY = ["instances"] as const
/** SWR cache key of the domains read. */
export const QUERY_DOMAINS_SWR_KEY = ["domains"] as const
/** SWR cache key of the wallet read. */
export const QUERY_WALLET_SWR_KEY = ["wallet"] as const
/** SWR cache key of the wallet transactions read. */
export const QUERY_WALLET_TRANSACTIONS_SWR_KEY = ["wallet-transactions"] as const
/** SWR cache key of the pod openclaw status read. */
export const QUERY_POD_OPENCLAW_STATUS_SWR_KEY = ["pod-openclaw-status"] as const
/** SWR cache key of the agentos solution modules read. */
export const QUERY_AGENTOS_SOLUTION_MODULES_SWR_KEY = ["agentos", "solution-modules"] as const

/** SWR cache key of the catalog items read, scoped by category. */
export const QUERY_CATALOG_ITEMS_SWR_KEY = (category: CatalogCategory) => ["catalog-items", category] as const
/** SWR cache key of the agent workspace control center read, scoped by workspace id. */
export const QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY = (workspaceId: string) =>
    ["agentos", "workspace-control-center", workspaceId] as const
/** SWR cache key of the agentos module installations read, scoped by workspace id. */
export const QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY = (workspaceId: string) =>
    ["agentos", "module-installations", workspaceId] as const
/** SWR cache key of the agentos module studio read, scoped by workspace id and module id. */
export const QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY = (workspaceId: string, moduleId: string) =>
    ["agentos", "module-studio", workspaceId, moduleId] as const
/** SWR cache key of the agentos ai knowledge read, scoped by workspace id. */
export const QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY = (workspaceId: string) =>
    ["agentos", "ai-knowledge", workspaceId] as const
/** SWR cache key of the expert site deployment read, scoped by site id. */
export const QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY = (siteId: string) => ["expert-site-deployment", siteId] as const
/** SWR cache key of the agentos module installation read, scoped by workspace id and installation id. */
export const QUERY_AGENTOS_MODULE_INSTALLATION_SWR_KEY = (workspaceId: string, installationId: string) =>
    ["agentos", "module-installation", workspaceId, installationId] as const
/** SWR cache key of the agentos module runtime read, scoped by workspace id, installation id and whether diagnostics are included. */
export const QUERY_AGENTOS_MODULE_RUNTIME_SWR_KEY = (
    workspaceId: string,
    installationId: string,
    includeDiagnostics: boolean,
) => ["agentos", "module-runtime", workspaceId, installationId, includeDiagnostics] as const
/** SWR cache key of the agentos module test surface read, scoped by installation id. */
export const QUERY_AGENTOS_MODULE_TEST_SURFACE_SWR_KEY = (installationId: string) =>
    ["agentos", "module-test-surface", installationId] as const
/** SWR cache key of the agentos module test run read, scoped by installation id and run id. */
export const QUERY_AGENTOS_MODULE_TEST_RUN_SWR_KEY = (installationId: string, runId: string) =>
    ["agentos", "module-test-run", installationId, runId] as const
/** SWR cache key of the academy growth read, scoped by site id. */
export const QUERY_ACADEMY_GROWTH_SWR_KEY = (siteId: string) => ["academy", "growth", siteId] as const
/** SWR cache key of the academy students read, scoped by site id. */
export const QUERY_ACADEMY_STUDENTS_SWR_KEY = (siteId: string) => ["academy", "students", siteId] as const
/** SWR cache key of the academy student detail read, scoped by site id and member id. */
export const QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY = (siteId: string, memberId: string) =>
    ["academy", "student", siteId, memberId] as const
/** SWR cache key of the academy integrations read, scoped by site id. */
export const QUERY_ACADEMY_INTEGRATIONS_SWR_KEY = (siteId: string) => ["academy", "integrations", siteId] as const
/** SWR cache key of the expert site leads read, scoped by site id. */
export const QUERY_EXPERT_SITE_LEADS_SWR_KEY = (siteId: string) => ["academy", "leads", siteId] as const

/** SWR cache key of the collab read. */
export const QUERY_COLLAB_SWR_KEY = ["collab"] as const
/** SWR cache key of the collab office read, scoped by workspace id. */
export const QUERY_COLLAB_OFFICE_SWR_KEY = (workspaceId: string) => ["collab", "office", workspaceId] as const
/** SWR cache key of the collab group read, scoped by workspace id and cursor. */
export const QUERY_COLLAB_GROUP_SWR_KEY = (workspaceId: string, cursor?: string | null) =>
    ["collab", "group", workspaceId, cursor ?? null] as const
/** SWR cache key of the collab tasks read, scoped by workspace id and filters. */
export const QUERY_COLLAB_TASKS_SWR_KEY = (workspaceId: string, filters?: CollabTasksFilter) =>
    [
        "collab",
        "tasks",
        workspaceId,
        filters?.personMemberId ?? null,
        filters?.moduleInstallationId ?? null,
        filters?.status ?? null,
        filters?.cursor ?? null,
        filters?.limit ?? null,
    ] as const
/** SWR cache key of the collab task read, scoped by workspace id and task id. */
export const QUERY_COLLAB_TASK_SWR_KEY = (workspaceId: string, taskId: string) =>
    ["collab", "task", workspaceId, taskId] as const
/** SWR cache key of the collab commands read, scoped by workspace id and module name. */
export const QUERY_COLLAB_COMMANDS_SWR_KEY = (workspaceId: string, moduleName: string) =>
    ["collab", "commands", workspaceId, moduleName] as const
/** SWR cache key of the collab notices read, scoped by workspace id and cursor. */
export const QUERY_COLLAB_NOTICES_SWR_KEY = (workspaceId: string, cursor?: string | null) =>
    ["collab", "notices", workspaceId, cursor ?? null] as const
/** SWR cache key of the collab notice read, scoped by workspace id and notice id. */
export const QUERY_COLLAB_NOTICE_SWR_KEY = (workspaceId: string, noticeId: string) =>
    ["collab", "notice", workspaceId, noticeId] as const
/** SWR cache key of the collab reconcile read, scoped by workspace id and intent id. */
export const QUERY_COLLAB_RECONCILE_SWR_KEY = (workspaceId: string, intentId: string) =>
    ["collab", "reconcile", workspaceId, intentId] as const

/** Build the SWR key matcher that selects every cached collab read of one workspace whose domain is listed, for targeted revalidation. */
export const collabDomainKeys =
    (workspaceId: string, domains: ReadonlyArray<string>) =>
    (key: unknown): boolean =>
        Array.isArray(key) &&
        key[0] === "NIVO_QUERY" &&
        key[2] === QUERY_COLLAB_SWR_KEY[0] &&
        key[4] === workspaceId &&
        domains.includes(key[3] as string)

/** SWR mutation key of the academy integration action, scoped by site id. */
export const MUTATION_ACADEMY_INTEGRATION_SWR_KEY = (siteId: string) => ["academy", "integration", siteId] as const
/** SWR mutation key of the academy student create action, scoped by site id. */
export const MUTATION_ACADEMY_STUDENT_CREATE_SWR_KEY = (siteId: string) =>
    ["academy", "student-create", siteId] as const
/** SWR mutation key of the academy student status action, scoped by site id. */
export const MUTATION_ACADEMY_STUDENT_STATUS_SWR_KEY = (siteId: string) =>
    ["academy", "student-status", siteId] as const
/** SWR mutation key of the academy course access grant action, scoped by site id. */
export const MUTATION_ACADEMY_COURSE_ACCESS_GRANT_SWR_KEY = (siteId: string) =>
    ["academy", "course-access-grant", siteId] as const
/** SWR mutation key of the academy course access revoke action, scoped by site id. */
export const MUTATION_ACADEMY_COURSE_ACCESS_REVOKE_SWR_KEY = (siteId: string) =>
    ["academy", "course-access-revoke", siteId] as const
/** SWR mutation key of the academy lead draft action, scoped by site id. */
export const MUTATION_ACADEMY_LEAD_DRAFT_SWR_KEY = (siteId: string) => ["academy", "lead-draft", siteId] as const
/** SWR mutation key of the academy lead update action, scoped by site id. */
export const MUTATION_ACADEMY_LEAD_UPDATE_SWR_KEY = (siteId: string) => ["academy", "lead-update", siteId] as const
/** SWR mutation key of the wallet top up pay link action. */
export const MUTATION_WALLET_TOP_UP_PAY_LINK_SWR_KEY = ["wallet-top-up-pay-link"] as const
/** SWR mutation key of the invoice pay action. */
export const MUTATION_INVOICE_PAY_SWR_KEY = ["invoice-pay"] as const
/** SWR mutation key of the agentos custom module intake action, scoped by workspace id. */
export const MUTATION_AGENTOS_CUSTOM_MODULE_INTAKE_SWR_KEY = (workspaceId: string) =>
    ["agentos", "custom-module-intake", workspaceId] as const
/** SWR mutation key of the agentos custom module answer action, scoped by workspace id and module id. */
export const MUTATION_AGENTOS_CUSTOM_MODULE_ANSWER_SWR_KEY = (workspaceId: string, moduleId: string) =>
    ["agentos", "custom-module-answer", workspaceId, moduleId] as const
/** SWR mutation key of the agentos module integration save action, scoped by workspace id and module id. */
export const MUTATION_AGENTOS_MODULE_INTEGRATION_SAVE_SWR_KEY = (workspaceId: string, moduleId: string) =>
    ["agentos", "module-integration-save", workspaceId, moduleId] as const
/** SWR mutation key of the agentos module integration remove action, scoped by workspace id and module id. */
export const MUTATION_AGENTOS_MODULE_INTEGRATION_REMOVE_SWR_KEY = (workspaceId: string, moduleId: string) =>
    ["agentos", "module-integration-remove", workspaceId, moduleId] as const
/** SWR mutation key of the agentos custom module publish action, scoped by workspace id and module id. */
export const MUTATION_AGENTOS_CUSTOM_MODULE_PUBLISH_SWR_KEY = (workspaceId: string, moduleId: string) =>
    ["agentos", "custom-module-publish", workspaceId, moduleId] as const
/** SWR mutation key of the agentos solution module install action, scoped by workspace id. */
export const MUTATION_AGENTOS_SOLUTION_MODULE_INSTALL_SWR_KEY = (workspaceId: string) =>
    ["agentos", "solution-module-install", workspaceId] as const
/** SWR mutation key of the agentos workspace app launch issue action, scoped by workspace id. */
export const MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_ISSUE_SWR_KEY = (workspaceId: string) =>
    ["agentos", "workspace-app-launch-issue", workspaceId] as const
/** SWR mutation key of the agentos workspace app launch revoke action, scoped by workspace id. */
export const MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_REVOKE_SWR_KEY = (workspaceId: string) =>
    ["agentos", "workspace-app-launch-revoke", workspaceId] as const
/** SWR mutation key of the agentos workspace app launch renew action, scoped by workspace id. */
export const MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_RENEW_SWR_KEY = (workspaceId: string) =>
    ["agentos", "workspace-app-launch-renew", workspaceId] as const
/** SWR mutation key of the agentos catalog order action. */
export const MUTATION_AGENTOS_CATALOG_ORDER_SWR_KEY = ["agentos", "catalog-order"] as const
/** SWR mutation key of the expert site create publish action. */
export const MUTATION_EXPERT_SITE_CREATE_PUBLISH_SWR_KEY = ["apps", "expert-site-create-publish"] as const
/** SWR mutation key of the agentos module runtime action, scoped by installation id. */
export const MUTATION_AGENTOS_MODULE_RUNTIME_SWR_KEY = (installationId: string) =>
    ["agentos", "module-runtime", installationId] as const
/** SWR mutation key of the agentos module test action, scoped by installation id. */
export const MUTATION_AGENTOS_MODULE_TEST_SWR_KEY = (installationId: string) =>
    ["agentos", "module-test", installationId] as const
/** SWR mutation key of the agentos workspace channel action, scoped by workspace id. */
export const MUTATION_AGENTOS_WORKSPACE_CHANNEL_SWR_KEY = (workspaceId: string) =>
    ["agentos", "workspace-channel", workspaceId] as const
/** SWR mutation key of the agentos module attachment upload action, scoped by workspace id and module id. */
export const MUTATION_AGENTOS_MODULE_ATTACHMENT_UPLOAD_SWR_KEY = (workspaceId: string, moduleId: string) =>
    ["agentos", "module-attachment-upload", workspaceId, moduleId] as const
/** SWR mutation key of the agentos module attachment finalize action, scoped by workspace id and module id. */
export const MUTATION_AGENTOS_MODULE_ATTACHMENT_FINALIZE_SWR_KEY = (workspaceId: string, moduleId: string) =>
    ["agentos", "module-attachment-finalize", workspaceId, moduleId] as const
/** SWR mutation key of the agentos module attachment remove action, scoped by workspace id and module id. */
export const MUTATION_AGENTOS_MODULE_ATTACHMENT_REMOVE_SWR_KEY = (workspaceId: string, moduleId: string) =>
    ["agentos", "module-attachment-remove", workspaceId, moduleId] as const
/** SWR mutation key of the agentos ai readiness test action, scoped by workspace id. */
export const MUTATION_AGENTOS_AI_READINESS_TEST_SWR_KEY = (workspaceId: string) =>
    ["agentos", "ai-readiness-test", workspaceId] as const
/** SWR mutation key of the agentos ai knowledge reindex action, scoped by workspace id. */
export const MUTATION_AGENTOS_AI_KNOWLEDGE_REINDEX_SWR_KEY = (workspaceId: string) =>
    ["agentos", "ai-knowledge-reindex", workspaceId] as const
/** SWR mutation key of the chatbot bind channel action, scoped by workspace id and installation id. */
export const MUTATION_CHATBOT_BIND_CHANNEL_SWR_KEY = (workspaceId: string, installationId: string) =>
    ["chatbot", "bind-channel", workspaceId, installationId] as const
/** SWR mutation key of the chatbot zalo oauth action, scoped by workspace id and installation id. */
export const MUTATION_CHATBOT_ZALO_OAUTH_SWR_KEY = (workspaceId: string, installationId: string) =>
    ["chatbot", "zalo-oauth", workspaceId, installationId] as const
/** SWR mutation key of the chatbot handoff action, scoped by workspace id and installation id. */
export const MUTATION_CHATBOT_HANDOFF_SWR_KEY = (workspaceId: string, installationId: string) =>
    ["chatbot", "handoff", workspaceId, installationId] as const
/** SWR mutation key of the chatbot resolve handoff action, scoped by workspace id and installation id. */
export const MUTATION_CHATBOT_RESOLVE_HANDOFF_SWR_KEY = (workspaceId: string, installationId: string) =>
    ["chatbot", "resolve-handoff", workspaceId, installationId] as const
/** SWR mutation key of the chatbot reconcile delivery action, scoped by workspace id and installation id. */
export const MUTATION_CHATBOT_RECONCILE_DELIVERY_SWR_KEY = (workspaceId: string, installationId: string) =>
    ["chatbot", "reconcile-delivery", workspaceId, installationId] as const
/** SWR mutation key of the agentos workspace provisioning retry action, scoped by workspace id. */
export const MUTATION_AGENTOS_WORKSPACE_PROVISIONING_RETRY_SWR_KEY = (workspaceId: string) =>
    ["agentos", "workspace-provisioning-retry", workspaceId] as const
/** SWR mutation key of the workspace checkout start action. */
export const MUTATION_WORKSPACE_CHECKOUT_START_SWR_KEY = ["workspace-checkout", "start"] as const
/** SWR mutation key of the workspace checkout recover action. */
export const MUTATION_WORKSPACE_CHECKOUT_RECOVER_SWR_KEY = ["workspace-checkout", "recover"] as const
