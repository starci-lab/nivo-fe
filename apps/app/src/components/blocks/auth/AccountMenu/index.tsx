"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useQueryCollabOfficeSwr, useSession } from "@/hooks";
import { AdministratorRevocationDialog } from "@/components/blocks/auth/AdministratorRevocationDialog";
import { ReturnNotice } from "@/components/blocks/auth/ReturnNotice";
import { SessionEndingDialog } from "@/components/blocks/auth/SessionEndingDialog";
import { AccountMenuBase } from "./component";

/** The navbar account menu resolves everything it draws, so it takes no props of its own. */
export type AccountMenuProps = {
  readonly [key: string]: never;
};

/**
 * Connected session owner for the navbar account menu.
 *
 * THE ADMINISTRATOR ENTRY IS A PRESENTATION HINT, NEVER A GRANT. It appears only while the route is
 * a workspace route AND the server-derived Collab membership read answers a current Owner or Manager
 * role for the signed-in member in that workspace; the command rechecks the actor's authority at
 * commit, so a stale menu row can never widen anything.
 *
 * NO OPERATOR CONTEXT IS OFFERED HERE. A platform-operator scope would need a signal no accepted
 * record names, and inventing one would put a control in the chrome that nothing authorizes.
 *
 * THE LANDING'S NOTICE IS MOUNTED HERE because this control is the only Login-owned mount point the
 * authenticated console has: the chrome, the shell and the landing page all belong to other owners,
 * so a notice that has to appear on the landing has to ride along with the session controls that are
 * already there.
 */
export const AccountMenu = (props: AccountMenuProps) => {
  void props;
  const t = useTranslations("console");
  const session = useSession();
  const { workspaceId } = useParams<{ readonly workspaceId?: string }>();
  const workspace = workspaceId === undefined || workspaceId.length === 0 ? null : workspaceId;
  const office = useQueryCollabOfficeSwr(workspace);
  const viewer = office.data?.ok === true ? office.data.data.viewer : null;
  const mayEndPrincipalSessions = viewer !== null && (viewer.role === "owner" || viewer.role === "manager");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSessionEndingOpen, setIsSessionEndingOpen] = useState(false);
  const [isAdministratorEndingOpen, setIsAdministratorEndingOpen] = useState(false);
  return <AccountMenuBase state={{
    sessionEndingControl: SessionEndingDialog,
    sessionEndingControlProps: {
      isOpen: isSessionEndingOpen,
      onOpenChange: setIsSessionEndingOpen
    },
    administratorRevocationControl: AdministratorRevocationDialog,
    administratorRevocationControlProps: {
      isOpen: isAdministratorEndingOpen,
      onOpenChange: setIsAdministratorEndingOpen
    },
    returnNoticeControl: ReturnNotice,
    returnNoticeControlProps: {}
  }} props={{
    label: t("account.label"),
    signOutLabel: t("account.signOut"),
    signOutEverywhereLabel: t("account.signOutEverywhere"),
    isSigningOut,
    ...(mayEndPrincipalSessions ? {
      administratorEnding: {
        label: t("account.endSessionsForPerson")
      }
    } : {}),
  }} on={{
    signOut: () => {
      setIsSigningOut(true);
      void session.end().finally(() => setIsSigningOut(false));
    },
    signOutEverywhere: () => setIsSessionEndingOpen(true),
    administratorEnding: () => setIsAdministratorEndingOpen(true)
  }} />;
};
