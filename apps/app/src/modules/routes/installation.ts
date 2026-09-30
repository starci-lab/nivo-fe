/** Dynamic route values supplied to every installed-module page. */
export type InstallationRoute = {
    readonly workspaceId: string
    readonly installationId: string
}

/** The App Router props shared by pages nested under one module installation. */
export type InstallationRouteProps = {
    readonly params: Promise<InstallationRoute>
}

const isInstallationRoute = (value: unknown): value is InstallationRoute => {
    if (
        typeof value !== "object" ||
        value === null ||
        !("workspaceId" in value) ||
        !("installationId" in value)
    ) {
        return false
    }
    return (
        typeof value.workspaceId === "string" &&
        value.workspaceId.trim() !== "" &&
        typeof value.installationId === "string" &&
        value.installationId.trim() !== ""
    )
}

/** Resolve and validate the two identities that address one module installation. */
export const readInstallationRoute = async (params: Promise<unknown>): Promise<InstallationRoute> => {
    const route = await params
    if (!isInstallationRoute(route)) {
        throw new Error("Installation route parameters must be non-empty")
    }
    return { workspaceId: route.workspaceId, installationId: route.installationId }
}
