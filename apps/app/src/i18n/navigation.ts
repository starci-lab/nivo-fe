import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Locale-aware navigation owner: route replacement and locale cookie change together. */
export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname
} = createNavigation(routing);
