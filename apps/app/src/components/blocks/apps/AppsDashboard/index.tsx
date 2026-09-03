"use client";

import { useFormatter, useTranslations } from "next-intl";
import { fleetResourceHref, type FleetStatus } from "@/components/blocks/provisioning/FleetRow";
import { useQueryCatalogItemsSwr, useQueryMyCatalogOrdersSwr, useQueryMyExpertSitesSwr, useQueryMyInstancesSwr } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import type { CatalogItemRow } from "@/modules/api/console";
import { AppsDashboardBase, type CatalogueSectionView, type OwnedAppRow, type OwnedSectionView } from "./component";

/**
 * PAGE (connected half) - the app set asks the world, and settles a situation per section.
 *
 * ONE EFFECT RATHER THAN TWO, BECAUSE THE TWO SECTIONS SHARE A QUERY. The owned rows name the
 * template each app was built from, and that name comes from the same `catalogItems` response the
 * catalogue section draws - so a second effect would be a second identical request whose only effect
 * would be to let the two sections disagree about the catalogue for a moment.
 *
 * NOTHING FIRES UNTIL THE SESSION IS SETTLED, for the reason `OverviewPage` records: a query sent
 * during the refresh round trip carries no credential and comes back `Authentication required`, which
 * would draw a permanent false refusal on first paint.
 *
 * THE REFUSED SITUATION IS A TRANSPORT FAILURE HERE, AND IT IS RECORDED AS ONE. None of the three
 * queries this page reads throws a domain exception - `myExpertSites`, `catalogItems` and
 * `myCatalogOrders` are plain finds - so the only way into that arm is a network, document or
 * envelope failure, and it says `refusal.unknown` rather than a business sentence. Minting a backend
 * exception to justify a nicer sentence is exactly what this case exists not to do.
 *
 * NO COUNT. Neither section states how many apps or how many templates there are.
 */

/** The statuses the fleet vocabulary holds, read off the wire's own words rather than asserted. */
export type AppsDashboardProps = Record<string, never>;
const WIRE_STATUS: Readonly<Record<string, FleetStatus | undefined>> = {
  not_provisioned: "not_provisioned",
  provisioning: "provisioning",
  awaiting_dns: "awaiting_dns",
  ready: "ready",
  failed: "failed",
  active: "active",
  suspended: "suspended"
};

/** Fleet status to catalogue key. The union is nivo-backend's, so there is nothing to invent. */
const STATUS_KEY: Readonly<Record<FleetStatus, string>> = {
  not_provisioned: "status.notProvisioned",
  provisioning: "status.provisioning",
  awaiting_dns: "status.awaitingDns",
  ready: "status.ready",
  failed: "status.failed",
  active: "status.active",
  suspended: "status.suspended"
};

/** Where the host of an academy with no custom domain is rooted. */
const ACADEMY_HOST_SUFFIX = process.env.NEXT_PUBLIC_ACADEMY_HOST_SUFFIX ?? ".nivo.vn";

/**
 * The cheapest rung of one template that publishes a monthly price.
 *
 * Rungs with no monthly price are skipped rather than read as free: a one-time rung publishes
 * `priceMonthlyVnd: null`, and sorting on that would put it first at zero dong.
 *
 * @param item - The catalogue item.
 * @returns The cheapest priced rung, or undefined when it publishes none.
 */
const cheapestTier = (item: CatalogItemRow) => {
  let cheapest: {
    readonly name: string;
    readonly priceMonthlyVnd: number;
  } | undefined;
  for (const tier of item.tiers ?? []) {
    const price = tier.priceMonthlyVnd;
    if (price === null) {
      continue;
    }
    if (cheapest === undefined || price < cheapest.priceMonthlyVnd) {
      cheapest = {
        name: tier.name,
        priceMonthlyVnd: price
      };
    }
  }
  return cheapest;
};

/**
 * The app set, and how a new one is started.
 *
 * @returns The page node.
 */
export const AppsDashboard = (props: AppsDashboardProps) => {
  void props;
  const t = useTranslations("console");
  const format = useFormatter();
  const router = useRouter();
  const sites = useQueryMyExpertSitesSwr();
  const instances = useQueryMyInstancesSwr();
  const orders = useQueryMyCatalogOrdersSwr();
  const catalogue = useQueryCatalogItemsSwr("site_from_template");
  const money = (amountVnd: number) => format.number(amountVnd, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  });
  const statusLabel = (wire: string) => {
    const status = WIRE_STATUS[wire];
    return status === undefined ? t("status.unknown") : t(STATUS_KEY[status]);
  };

  /*
   * AN UNRECOGNISED STATE TAKES THE MOST NEUTRAL TONE AND ITS OWN WORD. `FleetRow` owns the tone map
   * and `not_provisioned` is its neutral entry, so the tone says nothing while the label says
   * plainly that the state is not known.
   */
  const statusTone = (wire: string): FleetStatus => WIRE_STATUS[wire] ?? "not_provisioned";
  const ownedView = (): OwnedSectionView => {
    const label = t("apps.listLabel");
    if (sites.data === undefined) {
      return {
        phase: "resting",
        label
      };
    }
    if (!sites.data.ok) {
      return {
        phase: "refused",
        label,
        note: t("refusal.unknown")
      };
    }
    const catalogueRows = catalogue.data?.ok === true ? catalogue.data.data : [];
    const instanceRows = instances.data?.ok === true ? instances.data.data : [];
    const apps: Array<OwnedAppRow> = sites.data.data.map(site => {
      const instance = instanceRows.find(one => one.detailId === site.id);
      const template = instance === undefined ? undefined : catalogueRows.find(item => item.templateKey === instance.appKey);
      return {
        id: site.id,
        name: site.slug,
        detail: site.customDomain ?? `${site.slug}${ACADEMY_HOST_SUFFIX}`,
        kindLabel: template?.name ?? t("kind.unknown"),
        status: statusTone(site.provisionStatus),
        statusLabel: statusLabel(site.provisionStatus),
        actionLabel: site.provisionStatus === "awaiting_dns" ? t("apps.viewDns") : t("apps.open")
      };
    });
    /*
     * THE ROW WITH NOTHING TO PRESS. An order paid for and not yet built has only one identity -
     * the rung that was bought - because `myCatalogOrders` carries no slug for the app that does
     * not exist yet. The kind badge names the product and the tier names the row, so neither
     * repeats the other, and reading `in_progress` as `provisioning` is the one interpretation
     * here: it is the same moment in the same lifecycle under two vocabularies.
     */
    const standingUp: Array<OwnedAppRow> = (orders.data?.ok === true ? orders.data.data : []).filter(order => order.status === "in_progress").map(order => ({
      id: order.id,
      name: order.catalogTier?.name ?? t("kind.unknown"),
      detail: t("apps.orderInProgress"),
      kindLabel: order.catalogItem?.name ?? t("kind.unknown"),
      status: "provisioning",
      statusLabel: t("status.provisioning")
    }));
    const rows = [...apps, ...standingUp];
    return rows.length === 0 ? {
      phase: "empty",
      label,
      note: t("apps.emptyDescription")
    } : {
      phase: "answered",
      label,
      rows
    };
  };
  const catalogueView = (): CatalogueSectionView => {
    const label = t("apps.catalogueLabel");
    const fact = t("apps.catalogueFact");
    if (catalogue.data === undefined) {
      return {
        phase: "resting",
        label,
        fact
      };
    }
    if (!catalogue.data.ok) {
      return {
        phase: "refused",
        label,
        note: t("refusal.unknown")
      };
    }
    if (catalogue.data.data.length === 0) {
      return {
        phase: "empty",
        label,
        note: t("apps.emptyDescription")
      };
    }
    return {
      phase: "answered",
      label,
      fact,
      offers: catalogue.data.data.flatMap(item => {
        if (item.templateKey === null) {
          return [];
        }
        const tier = cheapestTier(item);
        return [{
          id: item.id,
          templateKey: item.templateKey,
          name: item.name,
          tagline: item.tagline ?? "",
          kindLabel: t("apps.kindTemplateApp"),
          priceLabel: tier === undefined ? "" : t("apps.priceTier", {
            tier: tier.name,
            price: money(tier.priceMonthlyVnd)
          }),
          actionLabel: item.templateKey === "ai_academy" ? t("apps.build") : t("apps.unavailable"),
          actionDisabled: item.templateKey !== "ai_academy"
        }];
      })
    };
  };
  const buildTemplate = (templateKey: string) => {
    const route = `/apps/create/${encodeURIComponent(templateKey)}`;
    router.push(route);
  };
  const openOwnedApp = (siteId: string) => {
    router.push(fleetResourceHref("site", siteId));
  };
  return <AppsDashboardBase title={t("apps.title")} lede={t("apps.lede")} buildAppLabel={t("apps.buildApp")} attentionGroupLabel={t("apps.attentionGroup")} steadyGroupLabel={t("apps.steadyGroup")} owned={ownedView()} catalogue={catalogueView()} onBuildTemplate={buildTemplate} onOpenOwnedApp={openOwnedApp} />;
};
