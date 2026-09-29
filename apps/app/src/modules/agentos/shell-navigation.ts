/*
 * Registered installation navigation for the AgentOS shell (CU-SHELL-NAVIGATION).
 *
 * A NAME GOES IN, A NAME COMES OUT, AND ONLY THEN DOES A ROUTE EXIST. Core resolves a destination
 * server-side and answers with a registered view name, never a URL, because a browser that composed
 * a host from a name would be an open redirect with extra steps. This module holds the other half of
 * that bargain: the closed table of surfaces this app actually serves, and the rule that nothing is
 * opened until a destination answered for the selection that is still on screen.
 *
 * WHAT THIS FILE DELIBERATELY CANNOT DO.
 *
 * - It cannot open anything a caller supplied. The path is derived from the resolved destination's
 *   route name and the identities Core echoed back, so no caller string can become a URL.
 * - It cannot be reached by authority. There is no permission, role or grant parameter anywhere in
 *   its signature: what the shell displays about receiver authority is display, and destination
 *   resolution is Core's re-authorization on the current request. A shell that navigated on its own
 *   authority would be the second authority the contract forbids.
 * - It cannot replay an effect. The only request it can cause is `navigation.resolve@1`, which
 *   resolves where an already-authorized entry lives; a refusal, an unsupported grammar, an obsolete
 *   selection, a failed renewal or a cancelled entry all leave the current view exactly as it was.
 * - It cannot restore a former selection. A return carries the AgentOS selector as CONTEXT only -
 *   authorization and every read start again from scratch on return, which is why the return value
 *   here is a selection rather than a restored observation.
 */

import {
    getPathname
} from "@/modules/i18n/navigation";
import type {
    Locale
} from "@/modules/i18n/config";
import type {
    ShellReadScope,
    ShellRegisteredDestination
} from "@/modules/api/agentos-shell";
import type { FailureKind, Outcome } from "@/modules/api/outcome";

/** What the shell may do with one navigation answer. */
export type ShellNavigationDecision =
    | {
        readonly open: true;
        readonly href: string;
        readonly returnSelection: ShellReadScope;
    }
    | {
        /**
         * Why a destination was not opened: the failure kind and code that decided it, so the caller
         * can label the outcome without re-deriving it. There is deliberately no `cancelled` case: an
         * entry the owner abandons is the absence of a decision, not a decision, and giving it a value
         * here would invite a caller to report a refusal it never received.
         */
        readonly open: false;
        readonly kind: FailureKind;
        readonly code: string;
    };

/**
 * The app-relative path of one installation surface.
 *
 * WHY THE DOMAIN VIEWS SHARE THE OPERATION SURFACE. Core resolves a destination inside an
 * installation, and this app serves an installation's surfaces from one route tree: the module home
 * itself, its diagnostics, and the operation surface that renders the installed module's own UI.
 * The domain views (`sales-*`, `accounting-*`, `chatbot-*`) are that module's internal surfaces, so
 * they open the operation surface, where the owning module re-resolves its opaque item under its own
 * authority - the resolved resource reference is deliberately never disclosed to the browser, so
 * there is nothing here that could address it directly.
 *
 * @param destination - A destination Core resolved and the client validated.
 * @returns The app-relative path of the surface the destination names.
 */
export const shellNavigationPath = (destination: ShellRegisteredDestination): string => {
    const installation = `/agentos/workspaces/${destination.workspaceId}/modules/${destination.installationId}`;
    if (destination.routeName === "module-home") return installation;
    if (destination.routeName === "module-diagnostics") return `${installation}/diagnostics`;
    return `${installation}/operate`;
};

/**
 * The AgentOS selection a return restores as context.
 *
 * @param destination - The destination the owner visited.
 * @returns The workspace and instance to re-enter. It carries no observation: return starts fresh
 *   authorization and fresh reads rather than restoring anything the browser was holding.
 */
export const shellReturnSelection = (destination: ShellRegisteredDestination): ShellReadScope => ({
    workspaceId: destination.returnContext.workspaceId,
    instanceId: destination.returnContext.instanceId
});

/**
 * Decide what to do with one navigation answer.
 *
 * @param outcome - What the registered resolution returned.
 * @param locale - The reader's locale, so the opened path is the localized route.
 * @returns The one case that opens a registered surface, or the closed reason the current view stays
 *   exactly as it is. A destination resolved for a selection that is no longer displayed is
 *   `obsolete` and is never opened, which is what keeps a late answer from replacing the context the
 *   owner is actually looking at.
 */
export const shellNavigationDecision = (outcome: Outcome<ShellRegisteredDestination>, locale: Locale): ShellNavigationDecision => {
    if (!outcome.ok) return { open: false, kind: outcome.kind, code: outcome.code };
    return {
        open: true,
        href: getPathname({ locale, href: shellNavigationPath(outcome.data) }),
        returnSelection: shellReturnSelection(outcome.data)
    };
};