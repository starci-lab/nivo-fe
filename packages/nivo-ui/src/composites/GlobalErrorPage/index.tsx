import { readRouteFailureKind } from "../RouteStateView"
import useSWRImmutable from "swr/immutable"
import { GlobalErrorPageBase, type GlobalErrorPageBaseData } from "./component"

type GlobalErrorPageCopy = {
    readonly error: {
        readonly unexpected: { readonly message: string; readonly description: string }
        readonly staleBundle: { readonly message: string; readonly description: string }
        readonly retry: string
        readonly reload: string
    }
}

/** Props for {@link GlobalErrorPage}: the failure, address locale, lazy copy loader and retry callback. */
export type GlobalErrorPageProps = {
    readonly error: Error & { readonly digest?: string }
    readonly locale: string
    readonly loadBoundaryCopy: () => Promise<GlobalErrorPageCopy>
    readonly onRetry: () => void
}

/** A stale bundle needs a document reload so the browser fetches the current assets. */
const reloadDocument = () => window.location.reload()

/** Pick the message selected by the failure kind from the loaded boundary copy. */
const readMessage = (copy: GlobalErrorPageCopy, isStaleBundle: boolean): GlobalErrorPageBaseData =>
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

/** Render a root-layout failure without relying on a provider from the failed layout. */
export const GlobalErrorPage = ({ error, locale, loadBoundaryCopy, onRetry }: GlobalErrorPageProps) => {
    const { data: copy } = useSWRImmutable(["GLOBAL_ERROR_BOUNDARY_COPY", locale] as const, () => loadBoundaryCopy())
    const isStaleBundle = readRouteFailureKind(error) === "stale-bundle"
    return (
        <GlobalErrorPageBase
            props={copy === undefined ? undefined : readMessage(copy, isStaleBundle)}
            on={{ retry: isStaleBundle ? reloadDocument : onRetry }}
        />
    )
}
