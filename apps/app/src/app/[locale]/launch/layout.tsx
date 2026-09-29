import type { ReactNode } from "react";

import { MessageScope } from "@/features/layouts/MessageScope";

/** The routed page this layout wraps. */
type LaunchRouteLayoutProps = { readonly children: ReactNode };

/** Route entry for the launch bridges: they open console surfaces, so they carry the console copy. */
const Layout = ({ children }: LaunchRouteLayoutProps) => <MessageScope scope="console">{children}</MessageScope>;

export default Layout;
