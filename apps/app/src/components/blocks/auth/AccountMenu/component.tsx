import { Icon, defineLeafComponent } from "@nivo/ui"
import { DropdownBranch } from "@nivo/ui/components/branches/DropdownBranch"

/** Resolved signed-in account action shown in the global navbar. */
export type AccountMenuViewProps = {
    readonly props: {
        readonly label: string
        readonly signOutLabel: string
        readonly isSigningOut?: boolean
    }
    readonly on?: {
        readonly signOut?: () => void
    }
}

const accountTrigger = defineLeafComponent("icon", {}, () => (
    <Icon props={{ name: "account", role: "leading" }} />
))

/** Pure account menu: vendor mechanics stay in DropdownBranch, session behavior stays above. */
export const AccountMenuBase = (input: AccountMenuViewProps) => (
    <DropdownBranch
        props={{
            label: input.props.label,
            sections: [{ items: [{
                id: "sign-out",
                label: input.props.signOutLabel,
                tone: "danger",
                isDisabled: input.props.isSigningOut,
            }] }],
        }}
        on={{ action: () => input.on?.signOut?.() }}
        trigger={accountTrigger}
    />
)

/** Source-level tier marker for the pure account block half. */
export const meta = { shape: "block", world: "pure", domain: "auth" } as const
