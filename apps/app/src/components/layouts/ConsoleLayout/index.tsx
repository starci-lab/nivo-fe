"use client"

import { useEffect } from "react"
import type { ComponentType } from "react"
import { useRouter } from "@/i18n/navigation"
import { useSession } from "@/modules/auth/session"
import { ConsoleLayoutBase } from "./component"

/** Connected console frame input already projected by the framework route boundary. */
export type ConsoleLayoutProps<P extends object> = { readonly body: ComponentType<P>; readonly bodyProps: P }

/** Guard the authenticated console and hand drawing to its pure layout twin. */
export const ConsoleLayout = <P extends object>({ body, bodyProps }: ConsoleLayoutProps<P>) => {
    const router = useRouter()
    const status = useSession().state.status
    useEffect(() => {
        if (status === "anonymous") router.replace("/authentication")
    }, [status, router])
    return <ConsoleLayoutBase body={body} bodyProps={bodyProps} />
}

/** Registry identity for the connected console layout twin. */
export const meta = { shape: "layout", world: "connected" } as const
