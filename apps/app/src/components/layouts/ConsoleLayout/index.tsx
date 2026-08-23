"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { useSession } from "@/modules/auth/session"
import { ConsoleLayoutBase } from "./component"

/** Connected console frame input already projected by the framework route boundary. */
export type ConsoleLayoutProps = { readonly body: ReactNode }

/** Guard the authenticated console and hand drawing to its pure layout twin. */
export const ConsoleLayout = ({ body }: ConsoleLayoutProps) => {
    const locale = useLocale()
    const router = useRouter()
    const status = useSession().state.status
    useEffect(() => {
        if (status === "anonymous") router.replace(locale === DEFAULT_LOCALE ? "/authentication" : `/${locale}/authentication`)
    }, [status, locale, router])
    return <ConsoleLayoutBase body={body} />
}

/** Registry identity for the connected console layout twin. */
export const meta = { shape: "layout", world: "connected" } as const
