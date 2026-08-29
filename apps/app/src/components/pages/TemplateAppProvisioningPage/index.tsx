"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { TemplateAppProvisioningPageBase, type TemplateAppProvisioningPageProps } from "./component";

/** Resolve route-level copy and navigation around the connected lifecycle block. */
export const TemplateAppProvisioningPage = (props: TemplateAppProvisioningPageProps) => {
  const t = useTranslations("console");
  const router = useRouter();
  return <TemplateAppProvisioningPageBase {...props} labels={{
    path: t("navigationLabel"),
    apps: t("apps.title"),
    createTitle: t("apps.createTitle"),
    createDescription: t("apps.createDescription"),
    provisioningTitle: t("apps.provisioningTitle"),
    provisioningDescription: t("apps.provisioningDescription")
  }} onOpenApps={() => router.push("/apps")} />;
};
