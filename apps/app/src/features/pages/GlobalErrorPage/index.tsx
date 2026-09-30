"use client"

import { readRouteFailureKind } from "@nivo/ui"
import useSWRImmutable from "swr/immutable"
import type en from "@/messages/en.json"
import { toLocaleFromPathname, type Locale } from "@/modules/i18n/config"
import { GlobalErrorPageBase, type GlobalErrorPageBaseData } from "./component"

/** Props for {@link GlobalErrorPage}: the failure, its retry callback and the locale read from the address. */
export type GlobalErrorPageProps = {
    readonly error: Error & { readonly digest?: string }
    readonly locale: Locale
    readonly onRetry: () => void
}

/** The catalogue's boundary namespace, typed from the source-of-truth catalogue. */
type BoundaryCopy = (typeof en)["boundary"]

/** The locale of the address the failed layout was serving, for the one boundary that has no provider above it. */
export const readGlobalErrorLocale = (pathname: string | null): Locale => toLocaleFromPathname(pathname)

/**
 * Fetch the boundary namespace of one locale's catalogue.
 *
 * It is a dynamic import on purpose: this page ships in the entry of every route, and a static
 * import would put the whole catalogue there. The catalogue chunk is only requested when the root
 * layout has already failed.
 */
const loadBoundaryCopy = async (locale: Locale): Promise<BoundaryCopy> => {
    const catalogue: { readonly default: { readonly boundary: BoundaryCopy } } = await import(
        `../../../messages/${locale}.json`
    )
    return catalogue.default.boundary
}

/** A stale bundle is repaired by fetching the new document, which the boundary's in-place retry cannot do. */
const reloadDocument = () => window.location.reload()

/** Pick the message a failure kind selects out of the loaded copy. */
const readMessage = (copy: BoundaryCopy, isStaleBundle: boolean): GlobalErrorPageBaseData =>
    isStaleBundle
        ? {
              message: copy.error.staleBundle.message,
              description: copy.error.staleBundle.description,
              actionLabel: copy.error.reload,
          }
        : {
              message: copy.error.unexpected.message,
              description: copy.error.unexpected.description,
              actionLabel: copy.error.retry,
          }

/**
 * PAGE - the answer to a failure of the root layout.
 *
 * The layout owns the translation provider, so when it fails nothing above can hand copy down: the
 * page reads (through SWR, so it is cached and cancelled with the page) the `boundary` namespace of the catalogue for the locale of the address itself.
 */
export const GlobalErrorPage = ({ error, locale, onRetry }: GlobalErrorPageProps) => {
    const { data: copy } = useSWRImmutable(["GLOBAL_ERROR_BOUNDARY_COPY", locale] as const, ([, forLocale]) =>
        loadBoundaryCopy(forLocale),
    )
    const isStaleBundle = readRouteFailureKind(error) === "stale-bundle"
    return (
        <GlobalErrorPageBase
            props={copy === undefined ? undefined : readMessage(copy, isStaleBundle)}
            on={{ retry: isStaleBundle ? reloadDocument : onRetry }}
        />
    )
}
