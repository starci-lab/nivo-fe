import { Icon, OtpInput, Text } from "@starci/grammar/common"
import { RefusalGlyph } from "../RefusalGlyph"
import { AUTH_PANEL_OTP_FIELD_CLASS_NAME } from "./classNames"

/** What the labelled six-slot code field needs. */
export type OtpFieldProps = {
    readonly id: string
    readonly label: string
    readonly statusId: string
    readonly message: string
    readonly isError: boolean
    readonly isPending: boolean
    readonly onValue: (value: string) => void
}

/** The control draws its own label; the app supplies only its hint or refusal line. */
export const OtpField = (props: OtpFieldProps) => (
    <div className={AUTH_PANEL_OTP_FIELD_CLASS_NAME}>
        <OtpInput
            id={props.id}
            name="otp"
            label={props.label}
            disabled={props.isPending}
            invalid={props.isError}
            describedBy={props.statusId}
            onChange={props.onValue}
        />
        <Text
            id={props.statusId}
            size="sm"
            tone={props.isError ? "accent" : "muted"}
            live={props.isError ? "assertive" : "polite"}
            startContent={props.isError ? <Icon source={RefusalGlyph} usage="chip" /> : undefined}
        >
            {props.message}
        </Text>
    </div>
)
