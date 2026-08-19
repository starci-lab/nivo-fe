"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { myExpertSites, type ExpertSiteRow } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import { _AcademyControlCenterPage, type AcademyControlCenterMode } from "./component"

/** Exact Academy identity supplied by the resource route. */
export type AcademyControlCenterPageProps = { readonly siteId: string }

/** Resolve ownership and page identity; each block resolves its own domain state. */
export const AcademyControlCenterPage = ({ siteId }: AcademyControlCenterPageProps) => {
    const t = useTranslations("console.academyControlCenter")
    const session = useSession()
    const isSignedIn = session.state.status === "signed-in"
    const [mounted, setMounted] = useState(false)
    const [site, setSite] = useState<ExpertSiteRow | null | undefined>(undefined)
    const [mode, setMode] = useState<AcademyControlCenterMode>("growth")

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        if (!isSignedIn) return
        let cancelled = false
        void myExpertSites().then((answer) => {
            if (!cancelled) setSite(answer.ok ? answer.data.find((item) => item.id === siteId) ?? null : null)
        })
        return () => { cancelled = true }
    }, [isSignedIn, siteId])

    const publicHost = site === null || site === undefined
        ? undefined
        : site.customDomain ?? `${site.slug}${process.env.NEXT_PUBLIC_ACADEMY_HOST_SUFFIX ?? ".nivo.vn"}`
    if (!mounted) return null
    const settledState = site === null ? "refused" : "ready"
    return (
        <_AcademyControlCenterPage
            state={site === undefined ? "restoring" : settledState}
            title={site?.slug ?? t("title")}
            siteId={siteId}
            publicHost={publicHost}
            mode={mode}
            labels={{
                loading: t("loading"),
                refused: t("refused"),
                openSite: t("openSite"),
                tabsLabel: t("tabsLabel"),
                tabs: (["growth", "system"] as const).map((id) => ({ id, label: t(`tabs.${id}`) })),
            }}
            onSelectMode={setMode}
            onOpenPublicSite={() => {
                if (publicHost !== undefined) window.open(`https://${publicHost}`, "_blank", "noopener,noreferrer")
            }}
        />
    )
}

/** Source-level tier marker for the connected Academy page twin. */
export const meta = { shape: "page", world: "connected" } as const
