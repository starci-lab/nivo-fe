import { Button, EmptyNotice } from "@starci/grammar/common"

/** The settled copy of one failed read, already phrased; the sign-in door and the retry are each optional. */
export type QueryNoticeViewData = {
    readonly message: string
    readonly description?: string
    /** Present for a refused session: the door the reader walks through instead of a retry. */
    readonly signIn?: { readonly label: string; readonly href: string }
    /** Present when the answer allows a re-read: the label the retry action carries. */
    readonly retryLabel?: string
    readonly retryPending?: boolean
}

/** The re-read a retryable failure may take. Absent, no retry is offered. */
export type QueryNoticeViewActions = { readonly retry?: () => void }

/** Props for {@link QueryNoticeView}. */
export type QueryNoticeViewProps = { readonly props: QueryNoticeViewData; readonly on?: QueryNoticeViewActions }

/**
 * Composite: the ONE drawing of a settled query failure. A sign-in door replaces the retry for a
 * refused session; otherwise the retry is drawn only when the copy carries a label for it.
 */
export const QueryNoticeView = ({ props, on }: QueryNoticeViewProps) =>
    props.signIn === undefined ? (
        <EmptyNotice
            message={props.message}
            description={props.description}
            actionLabel={props.retryLabel}
            actionVariant="secondary"
            isActionPending={props.retryPending}
            onAction={on?.retry}
        />
    ) : (
        <>
            <EmptyNotice message={props.message} description={props.description} />
            <Button href={props.signIn.href} variant="secondary">
                {props.signIn.label}
            </Button>
        </>
    )
