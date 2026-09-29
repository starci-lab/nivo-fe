import type { ReactNode } from "react";

import { MessageScope } from "@/features/layouts/MessageScope";

/** Route-group entry for the sign-in door: ships only the sign-in copy to the browser. */
const Layout = ({ children }: { readonly children: ReactNode }) => <MessageScope scope="authentication">{children}</MessageScope>;

export default Layout;
