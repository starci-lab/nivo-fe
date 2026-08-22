"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "@/modules/auth/session"
import { AccountMenuBase } from "./component"

/** Connected session owner for the navbar account menu. */
export const AccountMenu = () => {
    const t = useTranslations("console")
    const session = useSession()
    const [isSigningOut, setIsSigningOut] = useState(false)

    return (
        <AccountMenuBase
            props={{
                label: t("account.label"),
                signOutLabel: t("account.signOut"),
                isSigningOut,
            }}
            on={{
                signOut: () => {
                    setIsSigningOut(true)
                    void session.end().finally(() => setIsSigningOut(false))
                },
            }}
        />
    )
}

/** Source-level tier marker for the connected account block. */
export const meta = { shape: "block", world: "connected", domain: "auth" } as const
