import type { ReactNode } from "react";

import { ConsoleLayout } from "@/features/layouts/ConsoleLayout";
import { MessageScope } from "@/features/layouts/MessageScope";

/** Route-group entry for the authenticated Nivo console: a server layout that ships the console copy and seats the routed page in the client frame. */
const Layout = ({ children }: { readonly children: ReactNode }) => <MessageScope scope="console"><ConsoleLayout>{children}</ConsoleLayout></MessageScope>;

export default Layout;
