import { DropdownBranch, IconSource, type DropdownBranchItemData } from "@nivo/ui"
import { Icon } from "@starci/grammar/common"
import { Suspense, type ComponentType } from "react"
import type { AdministratorRevocationDialogProps } from "@/components/blocks/auth/AdministratorRevocationDialog"
import type { ReturnNoticeProps } from "@/components/blocks/auth/ReturnNotice"
import type { SessionEndingDialogProps } from "@/components/blocks/auth/SessionEndingDialog"

/** Resolved signed-in account actions shown in the global navbar. */
export type AccountMenuBaseProps = {
    readonly state: {
        /** Child renderers and their resolved control atoms stay in the composition state. */
        readonly sessionEndingControl: ComponentType<SessionEndingDialogProps>
        readonly sessionEndingControlProps: SessionEndingDialogProps
        readonly administratorRevocationControl: ComponentType<AdministratorRevocationDialogProps>
        readonly administratorRevocationControlProps: AdministratorRevocationDialogProps
        readonly returnNoticeControl: ComponentType<ReturnNoticeProps>
        readonly returnNoticeControlProps: ReturnNoticeProps
    }
    readonly props: {
        readonly label: string
        readonly signOutLabel: string
        readonly signOutEverywhereLabel: string
        readonly isSigningOut?: boolean
        /**
         * The administrator ending entry. ABSENT UNTIL AN AUTHORITY OWNER HAS CONFIRMED THE ACTOR, which
         * is the whole of this slot: the row appears only when the connected half supplies a word for it.
         */
        readonly administratorEnding?: {
            readonly label: string
            readonly isDisabled?: boolean
        }
    }
    readonly on?: {
        readonly signOut?: () => void
        readonly signOutEverywhere?: () => void
        readonly administratorEnding?: () => void
    }
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type AccountMenuProps = AccountMenuBaseProps

/** Every action this menu can report, so the reported id is one of a closed set. */
type AccountMenuAction = "sign-out" | "sign-out-everywhere" | "administrator-ending"
const accountTrigger = <Icon source={IconSource("account", "leading")} usage="leading" />

/**
 * Pure account menu: vendor mechanics stay in DropdownBranch, session behavior stays above.
 *
 * The menu owns no state of its own, including the two Dialogs it opens and the landing's notice
 * that rides beside them - each is handed in as a resolved control, so every visible word and every
 * effect stays in the connected half.
 */
export const AccountMenuBase = (props: AccountMenuProps) => {
    const {
        label,
        signOutLabel,
        signOutEverywhereLabel,
        isSigningOut,
        administratorEnding,
    }: AccountMenuBaseProps["props"] = props.props
    const {
        sessionEndingControl: SessionEndingControl,
        sessionEndingControlProps,
        administratorRevocationControl: AdministratorRevocationControl,
        administratorRevocationControlProps,
        returnNoticeControl: ReturnNoticeControl,
        returnNoticeControlProps,
    } = props.state
    const items: ReadonlyArray<DropdownBranchItemData<AccountMenuAction>> = [
        {
            id: "sign-out",
            label: signOutLabel,
            tone: "danger",
            isDisabled: isSigningOut,
        },
        {
            id: "sign-out-everywhere",
            label: signOutEverywhereLabel,
            tone: "danger",
        },
        ...(administratorEnding === undefined
            ? []
            : [
                  {
                      id: "administrator-ending" as const,
                      label: administratorEnding.label,
                      tone: "danger" as const,
                      isDisabled: administratorEnding.isDisabled,
                  },
              ]),
    ]
    return (
        <>
            <DropdownBranch<AccountMenuAction>
                props={{
                    label,
                    sections: [
                        {
                            items,
                        },
                    ],
                }}
                on={{
                    action: (id: AccountMenuAction) => {
                        if (id === "sign-out") {
                            props.on?.signOut?.()
                            return
                        }
                        if (id === "sign-out-everywhere") {
                            props.on?.signOutEverywhere?.()
                            return
                        }
                        props.on?.administratorEnding?.()
                    },
                }}
                trigger={accountTrigger}
            />
            <SessionEndingControl {...sessionEndingControlProps} />
            <AdministratorRevocationControl {...administratorRevocationControlProps} />
            {/*
      THE NOTICE READS THE ADDRESS, SO IT NEEDS A BOUNDARY ABOVE IT. Next refuses to render a route
      statically when a component reads the query without a Suspense boundary over it, and the
      account control is the only Login-owned mount point the landing has - the chrome around it
      belongs to the shell. The boundary is drawn here, in the pure half, because it must be an
      ancestor of the read rather than a child of it; it draws nothing of its own, and the notice is
      the only thing inside it. It rests as nothing: the notice is usually absent, so a placeholder
      shape would flash a description of something that is not there.
    */}
            <Suspense>
                <ReturnNoticeControl {...returnNoticeControlProps} />
            </Suspense>
        </>
    )
}
