import type { BadgeTone, IconSource } from "@starci/grammar/common"
import type { PurchaseStatusCheck, PurchaseStatusBadge } from "./checks"
import type { PurchasePhase } from "./phase"
import type { PurchaseStatusCopy } from "./copy"

/** One label/value pair in a fact grid. */
export type PurchaseStatusFact = {
    readonly label: string
    readonly value: string
}

/** One ordered evidence row; `at` renders only when a real source timestamp exists. */
export type PurchaseStatusTimelineRow = {
    readonly id: string
    readonly title: string
    readonly detail?: string
    readonly at?: string
    readonly mark: IconSource
}

/** The provisioning surface's current-operation panel. */
export type PurchaseStatusOperation = {
    readonly heading: string
    readonly name: string
    readonly word: string
    readonly tone: BadgeTone
    readonly mark?: IconSource
    readonly progressLabel: string
    /** Ordinal position 0-100; omitted draws the unresolved indeterminate bar. */
    readonly progressValue?: number
    readonly started?: string
    readonly lastObservation?: string
}

/** Resolved destinations the connected owner supplies; the view never builds a route. */
export type PurchaseStatusLinks = {
    readonly workspaces: string
    readonly offerSelection: string
}

/** Breadcrumb, heading and badge resolved for every state. */
export type PurchaseStatusHeadProps = {
    readonly copy: PurchaseStatusCopy
    readonly links: PurchaseStatusLinks
    readonly trail: ReadonlyArray<{
        readonly id: string
        readonly label: string
        readonly href?: string
        readonly isCurrent?: boolean
    }>
    readonly title: string
    readonly subtitle: string
    readonly badge?: PurchaseStatusBadge
}

/** The primary card: purchase facts on payment, the running order on provisioning. */
export type PurchaseStatusPrimary = {
    readonly label: string
    readonly fact?: string
    readonly banner?: ReadonlyArray<string>
    readonly facts: ReadonlyArray<PurchaseStatusFact>
    readonly cadenceFacts?: ReadonlyArray<PurchaseStatusFact>
    readonly timeline?: ReadonlyArray<PurchaseStatusTimelineRow>
    readonly operation?: PurchaseStatusOperation
    readonly footnote?: string
    readonly action?: {
        readonly label: string
        readonly pending?: boolean
    }
}

/** The rail: current verification on payment, confirmed facts on provisioning. */
export type PurchaseStatusRail = {
    readonly label: string
    readonly fact?: string
    readonly latestCheck?: string
    readonly checks: ReadonlyArray<PurchaseStatusCheck>
    readonly facts?: ReadonlyArray<PurchaseStatusFact>
    readonly notice?: string
    readonly outcome?: {
        readonly title: string
        readonly detail?: string
    }
    readonly action?: {
        readonly label: string
        readonly pending?: boolean
    }
    readonly actionCaption?: string
    readonly secondaryLink?: {
        readonly label: string
        readonly href: string
    }
    readonly refusalText?: string
}

/** Commands the connected owner binds; the view holds no request lifecycle. */
export type PurchaseStatusActions = {
    readonly primary?: () => void
    readonly returnToList?: () => void
}

/** Complete state/data/action contract for the purchase-status block. */
export type PurchaseStatusFlowViewProps =
    | {
          readonly state: "loading"
          readonly props: PurchaseStatusHeadProps & {
              readonly surface?: "provisioning"
          }
      }
    | {
          readonly state: "denied"
          readonly props: PurchaseStatusHeadProps & {
              readonly message: string
              readonly description?: string
          }
          readonly on: PurchaseStatusActions
      }
    | {
          readonly state: Exclude<PurchasePhase, "loading" | "denied">
          readonly props: PurchaseStatusHeadProps & {
              readonly primary: PurchaseStatusPrimary
              readonly rail: PurchaseStatusRail
              readonly escapeLink?: {
                  readonly label: string
                  readonly href: string
              }
          }
          readonly on: PurchaseStatusActions
      }

/** Public props contract consumed by the purchase-status renderer. */
export type PurchaseStatusFlowProps = PurchaseStatusFlowViewProps
