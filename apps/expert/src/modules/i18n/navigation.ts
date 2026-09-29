import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Locale-aware navigation owner: route replacement and locale cookie change together. */
const navigation = createNavigation(routing);

/**
 * The locale-aware navigation primitives a feature binds: `Link` renders the localised href,
 * `redirect` moves the request, `getPathname` formats a route for one locale.
 */
export const {
  Link,
  redirect,
  getPathname
} = navigation;

/**
 * The created navigation family the hooks layer binds its names from. `usePathname` and
 * `useRouter` are custom hooks, so their declarations live under `@/hooks`, not here.
 */
export { navigation };
