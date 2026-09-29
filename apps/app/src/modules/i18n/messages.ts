export { pickMessages } from "@nivo/i18n/messages"

/**
 * Which top-level catalogue namespaces each route group ships to the browser.
 *
 * The catalogue is one file per locale and the console alone is most of it, so handing every page the
 * whole thing made the sign-in screen carry the console copy. A route group server layout ships the
 * namespaces its components read and nothing else; a component that reads a namespace outside its
 * scope would render a raw key, which is why the table lists what the component graphs use.
 */
export const MESSAGE_SCOPES = {
    /** The document shell and the locale root page. */
    root: ["app"],
    /** The sign-in door. */
    authentication: ["app", "authentication"],
    /** The authenticated console and the launch bridges it opens. */
    console: ["app", "authentication", "agentos", "provisioning", "console", "metadata"],
} as const satisfies Readonly<Record<string, ReadonlyArray<string>>>

/** One route group message scope. */
export type MessageScopeName = keyof typeof MESSAGE_SCOPES
