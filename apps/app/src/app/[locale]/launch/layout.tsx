import type { ReactNode } from "react"

import { MessageScope } from "@/features/layouts/MessageScope"

/** The routed page this layout wraps. */
type LaunchRouteLayoutProps = { readonly children: ReactNode }

/** Route entry for the launch bridges: they open AgentOS surfaces, so they carry the AgentOS copy. */
const Layout = ({ children }: LaunchRouteLayoutProps) => <MessageScope scope="agentos">{children}</MessageScope>

export default Layout
