"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useQueryMyExpertSitesSwr } from "@/hooks/swr"
import { AcademyControlCenterBase, type AcademyControlCenterMode } from "./component"

/** Exact Academy identity supplied by the resource route. */
export type AcademyControlCenterProps = {
    readonly siteId: string
    readonly mode: AcademyControlCenterMode
    readonly onSelectMode: (mode: AcademyControlCenterMode) => void
}

/** Resolve ownership and page identity; each block resolves its own domain state. */
export const AcademyControlCenter = ({ siteId, mode, onSelectMode }: AcademyControlCenterProps) => {
    const t = useTranslations("console.academyControlCenter")
    const [mounted, setMounted] = useState(false)
    const answer = useQueryMyExpertSitesSwr()
    const site = answer.data === undefined
        ? undefined
        : answer.data.ok
            ? answer.data.data.find((item) => item.id === siteId) ?? null
            : null

    useEffect(() => { setMounted(true) }, [])

    const publicHost = site === null || site === undefined
        ? undefined
        : site.customDomain ?? `${site.slug}${process.env.NEXT_PUBLIC_ACADEMY_HOST_SUFFIX ?? ".nivo.vn"}`
    if (!mounted) return null
    const settledState = site === null ? "refused" : "ready"
    return (
        <AcademyControlCenterBase
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
            onSelectMode={onSelectMode}
            onOpenPublicSite={() => {
                if (publicHost !== undefined) window.open(`https://${publicHost}`, "_blank", "noopener,noreferrer")
            }}
        />
    )
}

/** Source-level tier marker for the connected Academy page twin. */
export const meta = { shape: "block", world: "connected" } as const
