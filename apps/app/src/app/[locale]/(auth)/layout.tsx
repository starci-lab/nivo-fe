import type { ReactNode } from "react"

import { MessageScope } from "@/features/layouts/MessageScope"

/** The routed page this layout wraps. */
type AuthRouteLayoutProps = { readonly children: ReactNode }

/** Route-group entry for the sign-in door: ships only the sign-in copy to the browser. */
const Layout = ({ children }: AuthRouteLayoutProps) => <MessageScope scope="authentication">{children}</MessageScope>

export default Layout
