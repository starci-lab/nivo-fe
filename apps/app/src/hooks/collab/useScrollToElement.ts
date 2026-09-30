
import { useEffect } from "react"
import { scrollToElement } from "./collab.shared"

/**
 * One deferred scroll request: which conversation element to bring into view
 * once the surface it belongs to has committed. The request is a fresh record
 * per ask, so a repeated request for the same element still scrolls again -
 * the effect keys on the record, not on the id's string value.
 */
export type CollabScrollRequest = { readonly elementId: string }

/**
 * Own the one-shot scroll a notice follow or a Tasks jump asks for. The timer
 * is scheduled in an effect and cleared by its cleanup, so a superseded request
 * or an unmount can never fire a scroll into a surface that already moved on.
 */
export const useScrollToElement = (request: CollabScrollRequest | null): void => {
    useEffect(() => {
        if (request === null) {
            return
        }
        const timer = window.setTimeout(() => scrollToElement(request.elementId), 50)
        return () => window.clearTimeout(timer)
    }, [request])
}
