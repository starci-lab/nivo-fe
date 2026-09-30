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
