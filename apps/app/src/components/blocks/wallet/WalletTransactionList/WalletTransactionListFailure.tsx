import { QueryNotice } from "@/components/blocks/query/QueryNotice"
import type { NivoQueryFailure } from "@/modules/query"
import { SurfaceCard, Text } from "@starci/grammar/common"

/** Settled read failure, including the row or order context when one is in view. */
type WalletTransactionListFailureProps = {
    readonly label: string
    readonly failure: NivoQueryFailure
    readonly retry?: () => void
    readonly detail?: string
}

/** Draw one ledger read failure with the kind-specific retry or sign-in path. */
export const WalletTransactionListFailure = (props: WalletTransactionListFailureProps) => (
    <SurfaceCard label={props.label}>
        <div>
            {props.detail === undefined ? null : (
                <Text size="xs" tone="muted">
                    {props.detail}
                </Text>
            )}
            <QueryNotice
                props={{ failure: props.failure }}
                on={props.retry === undefined ? undefined : { retry: props.retry }}
            />
        </div>
    </SurfaceCard>
)
