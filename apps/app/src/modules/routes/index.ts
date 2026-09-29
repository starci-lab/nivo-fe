/**
 * Every address the console owns and offers as a destination, written once.
 *
 * A ROUTE IS ONE FUNCTION HERE, NOWHERE ELSE. The canon rule is `no-hardcoded-route`: a page or a
 * block that writes `/agentos/workspaces/...` by hand owns a copy that silently points at a 404 the
 * day the route moves, and nothing type-checks the difference. Each builder returns the path
 * WITHOUT a locale prefix - the `[locale]` segment belongs to next-intl, and the `Link` and
 * `useRouter` it creates through `modules/i18n/navigation` put it back. A caller that needs the
 * localized string (a grammar primitive that renders a plain anchor) formats it with `getPathname`
 * instead of interpolating the locale itself.
 *
 * DYNAMIC SEGMENTS ARE ENCODED AT THE WALL. `encodeURIComponent` on every parameter is what keeps a
 * caller value - a slash, a space, a `?` - from becoming extra path or a second route, so a name
 * cannot address anything but the one destination it was passed for.
 */

/** One dynamic segment, encoded so its value stays exactly one segment. */
const segment = (value: string): string => encodeURIComponent(value)

/** The AgentOS dashboard: the shell's own home, which the create flow returns to. */
export const agentosHome = (): string => "/agentos"

/** The workspace collection. */
export const workspaces = (): string => "/agentos/workspaces"

/** The workspace creation flow, pre-persistence: the owner picks an offer before an order exists. */
export const newWorkspace = (): string => `${workspaces()}/new`

/**
 * The payment-review step of workspace creation, optionally carrying the selection the owner made.
 * The query arrives already composed by the caller - this builder appends it verbatim rather than
 * knowing which parameters a checkout reads.
 */
export const newWorkspaceCheckout = (query?: URLSearchParams): string => {
    const path = `${newWorkspace()}/checkout`
    const suffix = query?.toString() ?? ""
    return suffix === "" ? path : `${path}?${suffix}`
}

/** One workspace's own surface. */
export const workspace = (workspaceId: string): string => `${workspaces()}/${segment(workspaceId)}`

/** One workspace purchase, addressed by the durable order identity Core issued. */
export const purchase = (purchaseId: string): string => `${workspaces()}/purchases/${segment(purchaseId)}`

/** The provisioning progress of one workspace purchase. */
export const purchaseProvisioning = (purchaseId: string): string => `${purchase(purchaseId)}/provisioning`

/** A workspace's module collection: the installed modules and the catalog entry. */
export const workspaceModules = (workspaceId: string): string => `${workspace(workspaceId)}/modules`

/** The create screen inside a workspace's module collection, where an intake begins. */
export const moduleCreate = (workspaceId: string): string => `${workspaceModules(workspaceId)}/create`

/** The resumable studio of one custom module draft. */
export const moduleStudio = (workspaceId: string, moduleId: string): string =>
    `${workspaceModules(workspaceId)}/studio/${segment(moduleId)}`

/**
 * One installed module's surface inside a workspace - the root the setup, operate, test, settings
 * and diagnostics sections hang beneath.
 */
export const installation = (workspaceId: string, installationId: string): string =>
    `${workspaceModules(workspaceId)}/${segment(installationId)}`

/** The sites collection. */
export const apps = (): string => "/apps"

/** One provisioned site. */
export const app = (siteId: string): string => `${apps()}/${segment(siteId)}`

/** The provisioning progress of one site. */
export const appProvisioning = (siteId: string): string => `${app(siteId)}/provisioning`

/** The operations overview: the console's landing surface after sign-in. */
export const overview = (): string => "/overview"
