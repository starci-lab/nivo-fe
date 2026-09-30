"use client"

import { useState } from "react"
import { useIsHydrated } from "@nivo/ui"
import { useTranslations } from "next-intl"
import { useQueryMyExpertSitesSwr } from "@/hooks/swr"
import { useQueryNoticeData } from "@/hooks/query"
import { nivoQueryReading, type NivoQueryFailure } from "@/modules/query"
import { ACADEMY_HOST_SUFFIX } from "@/modules/config"
import { AcademyControlCenterBase, type AcademyControlCenterMode } from "./component"

/** Exact Academy identity supplied by the resource route. */
export type AcademyControlCenterProps = {
    readonly siteId: string
}

/** Resolve ownership and page identity; each block resolves its own domain state. */
export const AcademyControlCenter = (props: AcademyControlCenterProps) => {
    const { siteId }: AcademyControlCenterProps = props
    const [mode, setMode] = useState<AcademyControlCenterMode>("growth")
    const t = useTranslations("console.academyControlCenter")
    const mounted = useIsHydrated()
    const answer = useQueryMyExpertSitesSwr()
    const noticeOf = useQueryNoticeData()
    const reading = nivoQueryReading(answer.data)
    const site = reading.status === "ready" ? (reading.data.find((item) => item.id === siteId) ?? null) : undefined
    /* A settled list that does not name this site is a not-found of its own. */
    const failure: NivoQueryFailure | null =
        reading.status === "failed"
            ? reading
            : site === null
              ? { kind: "not-found", code: "ACADEMY_SITE_NOT_FOUND", reason: "", retryable: false }
              : null
    const publicHost =
        site === null || site === undefined ? undefined : (site.customDomain ?? `${site.slug}${ACADEMY_HOST_SUFFIX}`)
    if (!mounted) return null
    const settledState = failure === null ? "ready" : "failed"
    return (
        <AcademyControlCenterBase
            state={reading.status === "resting" ? "restoring" : settledState}
            props={{
                title: site?.slug ?? t("title"),
                siteId,
                publicHost,
                mode,
                notice: failure === null ? undefined : noticeOf(failure),
                labels: {
                    loading: t("loading"),
                    openSite: t("openSite"),
                    tabsLabel: t("tabsLabel"),
                    tabs: (["growth", "system"] as const).map((id) => ({
                        id,
                        label: t(`tabs.${id}`),
                    })),
                },
            }}
            on={{
                selectMode: setMode,
                retryNotice: () => void answer.mutate(),
                openPublicSite: () => {
                    if (publicHost !== undefined) window.open(`https://${publicHost}`, "_blank", "noopener,noreferrer")
                },
            }}
        />
    )
}
