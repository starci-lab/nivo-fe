"use client"

import { useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import { useQueryMyExpertSitesSwr } from "@/hooks"
import { nivoQueryReading, type NivoQueryFailure } from "@/modules/query"
import { ACADEMY_HOST_SUFFIX } from "@/modules/config"
import { QueryNotice } from "@/components/blocks/query/QueryNotice"
import { AcademyControlCenterBase, type AcademyControlCenterMode } from "./component"

/** The client mount read as an external store: no subscriptions, only the server/client snapshot split. */
const subscribeToMount = () => () => {}
const readClientMount = () => true
const readServerMount = () => false

/** Exact Academy identity supplied by the resource route. */
export type AcademyControlCenterProps = {
    readonly siteId: string
    readonly mode: AcademyControlCenterMode
    readonly onSelectMode: (mode: AcademyControlCenterMode) => void
}

/** Resolve ownership and page identity; each block resolves its own domain state. */
export const AcademyControlCenter = (props: AcademyControlCenterProps) => {
    const { siteId, mode, onSelectMode }: AcademyControlCenterProps = props
    const t = useTranslations("console.academyControlCenter")
    const mounted = useSyncExternalStore(subscribeToMount, readClientMount, readServerMount)
    const answer = useQueryMyExpertSitesSwr()
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
                notice:
                    failure === null ? undefined : (
                        <QueryNotice props={{ failure }} on={{ retry: () => void answer.mutate() }} />
                    ),
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
                selectMode: onSelectMode,
                openPublicSite: () => {
                    if (publicHost !== undefined) window.open(`https://${publicHost}`, "_blank", "noopener,noreferrer")
                },
            }}
        />
    )
}
