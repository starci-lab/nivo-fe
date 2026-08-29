"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "@/modules/auth/session";
import { AccountMenuBase } from "./component";

/** Connected session owner for the navbar account menu. */
export type AccountMenuProps = Record<string, never>;
/** Public API role for AccountMenu. */
export const AccountMenu = (props: AccountMenuProps) => {
  void props;
  const t = useTranslations("console");
  const session = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  return <AccountMenuBase props={{
    label: t("account.label"),
    signOutLabel: t("account.signOut"),
    isSigningOut
  }} on={{
    signOut: () => {
      setIsSigningOut(true);
      void session.end().finally(() => setIsSigningOut(false));
    }
  }} />;
};

