import { createLocalizeHref, createNavigation } from "@nivo/i18n/navigation"
import { routing } from "./routing"

const navigation = createNavigation(routing)

export const { Link, redirect, getPathname } = navigation
export const localizeHref = createLocalizeHref(navigation.getPathname)
export { navigation }
