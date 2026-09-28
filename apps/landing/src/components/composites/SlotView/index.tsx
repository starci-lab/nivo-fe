import type { ReactNode } from "react"
import { EmptyNotice } from "@starci/grammar/common"
import type { Slot, SlotLabels } from "@/modules/slot"

/** Props for the shared slot status view. */
export type SlotViewProps<T> = { readonly slot: Slot<T>; readonly placeholder: T; readonly labels: SlotLabels; readonly forbidden?: "hide" | "notice"; readonly onRetry?: () => void; readonly children: (data: T, isSkeleton: boolean) => ReactNode }

/** Renders the shared loading, forbidden, error, empty and ready slot states. */
export const SlotView = <T,>(props: SlotViewProps<T>) => {
  const { slot, labels } = props
  if (slot.isLoading) return <>{props.children(props.placeholder, true)}</>
  if (slot.isForbidden) return props.forbidden === "hide" ? null : <EmptyNotice message={labels.forbidden} />
  if (slot.isError) return <EmptyNotice message={labels.error} actionLabel={labels.retry} actionVariant="secondary" onAction={props.onRetry} />
  const isEmpty = slot.items === undefined || (Array.isArray(slot.items) && slot.items.length === 0)
  if (isEmpty) return <EmptyNotice message={labels.empty} />
  return <>{props.children(slot.items as T, false)}</>
}
