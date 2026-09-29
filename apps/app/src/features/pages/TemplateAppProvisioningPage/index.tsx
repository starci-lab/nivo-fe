"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/hooks"
import {
    TemplateAppProvisioningPageBase,
    type TemplateAppProvisioningPageLabels,
    type TemplateAppProvisioningRouteProps,
} from "./component"

/** Route identity plus the optional resolutions this page always fills. */
export type TemplateAppProvisioningPageProps = TemplateAppProvisioningRouteProps & {
    readonly labels?: TemplateAppProvisioningPageLabels
    readonly onOpenApps?: () => void
}

/** Resolve route-level copy and navigation around the connected lifecycle block. */
export const TemplateAppProvisioningPage = (props: TemplateAppProvisioningPageProps) => {
    const t = useTranslations("console")
    const router = useRouter()
    const route =
        props.mode === "new"
            ? { mode: "new" as const, templateKey: props.templateKey }
            : { mode: "resume" as const, siteId: props.siteId }
    return (
        <TemplateAppProvisioningPageBase
            props={{
                ...route,
                labels: {
                    path: t("navigationLabel"),
                    apps: t("apps.title"),
                    createTitle: t("apps.createTitle"),
                    createDescription: t("apps.createDescription"),
                    provisioningTitle: t("apps.provisioningTitle"),
                    provisioningDescription: t("apps.provisioningDescription"),
                },
            }}
            on={{ openApps: () => router.push("/apps") }}
        />
    )
}
