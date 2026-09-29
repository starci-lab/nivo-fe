"use client"

import { useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import { useQueryMyExpertSitesSwr } from "@/hooks"
import { nivoQueryData } from "@/modules/query"
import { ACADEMY_HOST_SUFFIX } from "@/modules/config"
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
    const sites = nivoQueryData(answer.data)
    const site = sites === null || sites === undefined ? sites : (sites.find((item) => item.id === siteId) ?? null)
    const publicHost =
        site === null || site === undefined ? undefined : (site.customDomain ?? `${site.slug}${ACADEMY_HOST_SUFFIX}`)
    if (!mounted) return null
    const settledState = site === null ? "refused" : "ready"
    return (
        <AcademyControlCenterBase
            state={site === undefined ? "restoring" : settledState}
            props={{
                title: site?.slug ?? t("title"),
                siteId,
                publicHost,
                mode,
                labels: {
                    loading: t("loading"),
                    refused: t("refused"),
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
