"use client";

import { useContext } from "react";
import { SessionContext, type Session } from "@/modules/auth/session";

/**
 * Read the session.
 *
 * The session itself - the provider, the context and the `Session` contract - stays in
 * `modules/auth/session`, because a module may not reach the hooks root. This file holds only the
 * component-facing door: reached as `useSession` from `@/hooks`, it reads the context the provider
 * above publishes.
 *
 * @returns The session held above this component.
 */
export const useSession = (): Session => {
    const session = useContext(SessionContext);
    if (session === null) {
        throw new Error("useSession was called outside SessionProvider");
    }
    return session;
};
