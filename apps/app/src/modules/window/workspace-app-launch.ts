/** Message sent by the short-lived same-origin launch bridge to the owning Nivo page. */
export type WorkspaceAppLaunchMessage =
    | { readonly status: "issued"; readonly workspaceId: string; readonly launchId: string }
    | { readonly status: "failed"; readonly workspaceId: string }

/** One collision-free same-origin channel per workspace launch surface. */
export const workspaceAppLaunchChannelName = (workspaceId: string): string => `nivo-workspace-app-launch:${workspaceId}`

/** Accept only an HTTPS callback, with localhost allowed for a future local gateway fixture. */
export const safeWorkspaceAppRedirect = (redirectUrl: string): string | null => {
    try {
        const destination = new URL(redirectUrl)
        if (destination.protocol !== "https:" && destination.hostname !== "localhost") return null
        return destination.href
    } catch {
        return null
    }
}

/** Navigate with a native anchor so embedded browsers do not need Location.replace support. */
export const followWorkspaceAppRedirect = (redirectUrl: string): void => {
    const anchor = document.createElement("a")
    anchor.href = redirectUrl
    anchor.target = "_self"
    anchor.rel = "noopener"
    anchor.hidden = true
    document.body.append(anchor)
    window.requestAnimationFrame(() => anchor.click())
}
