"use client";

import { useLocale, useTranslations } from "next-intl";
import { LOCALES, type Locale } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LanguageMenuBase } from "./component";

/** Connected locale owner for the global navbar. */
export type LanguageMenuProps = Record<string, never>;
/** Public API role for LanguageMenu. */
export const LanguageMenu = (props: LanguageMenuProps) => {
  void props;
  const t = useTranslations("console");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  return <LanguageMenuBase props={{
    label: t("locale.label"),
    selectedLocale: locale,
    options: LOCALES.map(id => ({
      id,
      label: t(`locale.options.${id}`)
    }))
  }} on={{
    select: next => {
      if (next !== locale) {
        router.replace(`${pathname}${globalThis.location?.search ?? ""}${globalThis.location?.hash ?? ""}`, {
          locale: next
        });
      }
    }
  }} />;
};
