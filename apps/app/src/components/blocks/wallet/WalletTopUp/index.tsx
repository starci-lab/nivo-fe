import { ModalBranch } from "@nivo/ui"
import { Badge, Button, Input, Text, Heading } from "@starci/grammar/common"
import type { PaymentResultView, TopUpView, WalletControlCenterActions } from "@/modules/wallet/wallet-center/types"

type TopUpContentProps = {
    readonly topUp: TopUpView
    readonly on?: WalletControlCenterActions
}

const TopUpContent = ({ topUp, on }: TopUpContentProps) =>
    topUp.checkout === undefined ? (
        <div>
            <Input
                id="wallet-top-up-amount"
                name="amountVnd"
                label={topUp.amountLabel}
                kind="text"
                placeholder={topUp.amountPlaceholder}
                isDisabled={topUp.pending}
                variant="secondary"
                isError={topUp.refusal !== undefined}
                onValueChange={on?.changeTopUpAmount}
            />
            <Text size="xs" tone="muted">
                {topUp.hint}
            </Text>
            <Button variant="primary" isPending={topUp.pending} onPress={on?.submitTopUp}>
                {topUp.submitLabel}
            </Button>
            {topUp.refusal === undefined ? undefined : (
                <Text size="sm" tone="muted" live="assertive">
                    {topUp.refusal ?? ""}
                </Text>
            )}
        </div>
    ) : (
        <div>
            <Text size="sm">{topUp.checkout.reference}</Text>
            <Text size="sm" weight="semibold">
                {topUp.checkout.amount}
            </Text>
            <Text size="xs" tone="muted">
                {topUp.checkout.note}
            </Text>
        </div>
    )

type ResultContentProps = {
    readonly result: PaymentResultView
    readonly on?: WalletControlCenterActions
}

const ResultContent = ({ result, on }: ResultContentProps) => (
    <div>
        <Badge tone={result.tone}>{result.state}</Badge>
        <Heading level={2}>{result.amount}</Heading>
        {result.reference === undefined ? undefined : (
            <Text size="sm" tone="muted">
                {result.reference}
            </Text>
        )}
        <Text size="sm" tone="muted">
            {result.note}
        </Text>
        <Button variant="primary" onPress={on?.closeResult}>
            {result.actionLabel}
        </Button>
    </div>
)

type WalletTopUpProps = {
    readonly topUp: TopUpView
    readonly result: PaymentResultView
    readonly on?: WalletControlCenterActions
}

/** Draw the top-up and provider-return overlays. */
export const WalletTopUp = (props: WalletTopUpProps) => {
    const { topUp, result, on } = props
    return (
    <>
        <ModalBranch
            isOpen={topUp.overlayState === "open"}
            title={topUp.title}
            closeLabel={topUp.closeLabel}
            content={TopUpContent}
            contentProps={{ topUp, on }}
            onDismiss={() => on?.closeTopUp?.()}
        />
        <ModalBranch
            isOpen={result.overlayState === "open"}
            title={result.title}
            closeLabel={result.closeLabel}
            content={ResultContent}
            contentProps={{ result, on }}
            onDismiss={() => on?.closeResult?.()}
        />
    </>
    )
}
