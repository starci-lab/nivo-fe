import type { Messages } from "next-intl"

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

/**
 * Keep only the named top-level namespaces of a catalogue.
 *
 * @param messages - The whole catalogue of the request locale.
 * @param namespaces - The top-level namespaces to keep; one the catalogue lacks is skipped.
 * @returns The catalogue reduced to those namespaces.
 */
export const pickMessages = (messages: Messages, namespaces: ReadonlyArray<string>): Messages =>
    Object.fromEntries(
        namespaces.filter((namespace) => namespace in messages).map((namespace) => [namespace, messages[namespace]]),
    ) as Messages
