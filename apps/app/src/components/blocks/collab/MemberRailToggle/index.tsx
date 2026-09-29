import { Button, Icon } from "@starci/grammar/common"
import { IconSource } from "@nivo/ui"

type MemberRailToggleProps = {
    readonly expanded: boolean
    readonly label: string
    readonly onClick: () => void
}

/** Render the compact control that opens or closes the member rail. */
export const MemberRailToggle = (props: MemberRailToggleProps) => {
    const { label, onClick } = props
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            startContent={<Icon source={IconSource("community", "chip")} usage="chip" />}
            endContent={<Icon source={IconSource("disclosure", "chip")} usage="chip" />}
            onPress={onClick}
        >
            {label}
        </Button>
    )
}
