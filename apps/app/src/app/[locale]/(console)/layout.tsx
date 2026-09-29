import type { ReactNode } from "react"

import { ConsoleLayout } from "@/features/layouts/ConsoleLayout"
import { MessageScope } from "@/features/layouts/MessageScope"

/** The routed page this layout wraps. */
type ConsoleRouteLayoutProps = { readonly children: ReactNode }

/** Route-group entry for the authenticated Nivo console: a server layout that ships the console copy and seats the routed page in the client frame. */
const Layout = ({ children }: ConsoleRouteLayoutProps) => (
    <MessageScope scope="console">
        <ConsoleLayout>{children}</ConsoleLayout>
    </MessageScope>
)

export default Layout
