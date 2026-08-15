/** Open a reusable blank popup synchronously so the browser does not block the later navigation. */
export const openWorkspaceAppPopup = (workspaceId: string): Window | null => {
    const width = Math.min(1280, window.screen.availWidth)
    const height = Math.min(900, window.screen.availHeight)
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))
    const popup = window.open(
        "about:blank",
        `nivo-openclaw-${workspaceId}`,
        `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    )
    popup?.focus()
    return popup
}

/** Navigate only to the exact callback URL returned by backend. */
export const navigateWorkspaceAppPopup = (popup: Window, redirectUrl: string): boolean => {
    const destination = new URL(redirectUrl)
    if (destination.protocol !== "https:" && destination.hostname !== "localhost") {
        popup.close()
        return false
    }
    popup.location.replace(destination.href)
    return true
}
