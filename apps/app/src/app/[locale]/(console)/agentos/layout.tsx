import type { ReactNode } from "react"

import { MessageScope } from "@/features/layouts/MessageScope"

/** The routed page this layout wraps. */
type AgentOSRouteLayoutProps = { readonly children: ReactNode }

/** Route entry for the AgentOS console routes: ships the AgentOS slice of the catalogue beneath the console frame. */
const Layout = ({ children }: AgentOSRouteLayoutProps) => <MessageScope scope="agentos">{children}</MessageScope>

export default Layout
