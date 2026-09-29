import type { ReactNode } from "react";

import { MessageScope } from "@/features/layouts/MessageScope";

/** Route entry for the launch bridges: they open console surfaces, so they carry the console copy. */
const Layout = ({ children }: { readonly children: ReactNode }) => <MessageScope scope="console">{children}</MessageScope>;

export default Layout;
