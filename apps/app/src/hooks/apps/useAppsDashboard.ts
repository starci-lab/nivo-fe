"use client"

import { useFormatter, useTranslations } from "next-intl"
import { fleetResourceHref } from "@/components/blocks/provisioning/FleetRow"
import {
    useQueryCatalogItemsSwr,
    useQueryMyCatalogOrdersSwr,
    useQueryMyExpertSitesSwr,
    useQueryMyInstancesSwr,
    useRouter,
} from "@/hooks"
import {
    catalogueSectionFor,
    ownedSectionFor,
    type AppsDashboardCopy,
    type AppsDashboardData,
} from "@/modules/apps/apps-dashboard"
import { ACADEMY_HOST_SUFFIX, BILLING_CURRENCY } from "@/modules/config"

/** Read the account's apps and catalogue, then resolve their settled view values. */
export const useAppsDashboard = () => {
    const t = useTranslations("console")
    const format = useFormatter()
    const router = useRouter()
    const sites = useQueryMyExpertSitesSwr()
    const instances = useQueryMyInstancesSwr()
    const orders = useQueryMyCatalogOrdersSwr()
    const catalogue = useQueryCatalogItemsSwr("site_from_template")
    const money = (amountVnd: number) =>
        format.number(amountVnd, { style: "currency", currency: BILLING_CURRENCY, maximumFractionDigits: 0 })
    const copy: AppsDashboardCopy = {
        listLabel: t("apps.listLabel"),
        catalogueLabel: t("apps.catalogueLabel"),
        catalogueFact: t("apps.catalogueFact"),
        unknownKind: t("kind.unknown"),
        refusalUnknown: t("refusal.unknown"),
        emptyDescription: t("apps.emptyDescription"),
        orderInProgress: t("apps.orderInProgress"),
        provisioningStatus: t("status.provisioning"),
        viewDns: t("apps.viewDns"),
        open: t("apps.open"),
        kindTemplateApp: t("apps.kindTemplateApp"),
        build: t("apps.build"),
        unavailable: t("apps.unavailable"),
        statusLabel: (status) => {
            if (status === "not_provisioned") return t("status.notProvisioned")
            if (status === "awaiting_dns") return t("status.awaitingDns")
            if (status === "provisioning") return t("status.provisioning")
            if (status === "ready") return t("status.ready")
            if (status === "failed") return t("status.failed")
            if (status === "active") return t("status.active")
            return t("status.suspended")
        },
        priceTier: (values) => t("apps.priceTier", values),
    }
    const props: AppsDashboardData = {
        title: t("apps.title"),
        lede: t("apps.lede"),
        buildAppLabel: t("apps.buildApp"),
        attentionGroupLabel: t("apps.attentionGroup"),
        steadyGroupLabel: t("apps.steadyGroup"),
        owned: ownedSectionFor(sites.data, instances.data, orders.data, catalogue.data, ACADEMY_HOST_SUFFIX, copy),
        catalogue: catalogueSectionFor(catalogue.data, money, copy),
    }
    const onBuildTemplate = (templateKey: string) => router.push(`/apps/create/${encodeURIComponent(templateKey)}`)
    const onOpenOwnedApp = (siteId: string) => router.push(fleetResourceHref("site", siteId))
    return { props, on: { onBuildTemplate, onOpenOwnedApp } }
}
