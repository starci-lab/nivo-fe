import { createLocalizeHref, createNavigation } from "@nivo/i18n/navigation"
import { routing } from "./routing"

const navigation = createNavigation(routing)

/** Locale-aware link, redirect and pathname helpers bound to this app routing. */
export const { Link, redirect, getPathname } = navigation
/** Prefixes a path with the locale the way this app routing does. */
export const localizeHref = createLocalizeHref(navigation.getPathname)
export { navigation }
