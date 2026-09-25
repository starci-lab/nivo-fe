"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/modules/auth/session";
import { SessionEndingDialogBase } from "./component";

/**
 * Where a person is left once their sessions have been ended.
 *
 * THE AUTHORITY-SIDE ANSWER TRAVELS ON THE ADDRESS, and it has nowhere else to go: ending every
 * session clears this browser's custody first, so the console this confirmation sits in - and the
 * confirmation with it - is gone before the answer arrives. The sign-in surface the person lands on
 * is the only place left that can report the ending, and the address is how the console already
 * hands it a state it must state (`ConsoleLayout` carries the interrupted route the same way). A
 * confirmed ending and an unconfirmed one therefore land on different addresses, and neither
 * address claims more than the sign-out envelope actually stated.
 */
const SIGN_IN_HREF = "/authentication";
const ENDING_PARAM = "sessionEnding";
const APPLIED_VALUE = "applied";
const UNCONFIRMED_VALUE = "unconfirmed";

/** Connected owner of the every-browser confirmation over the console. */
export type SessionEndingDialogProps = {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
};

/**
 * Ask for every-browser scope, end the sessions once, and leave for the sign-in surface.
 *
 * ONE ENDING PER CONFIRMATION. The pending flag is set before the request and is the only gate: a
 * second press while the first is unanswered returns here and sends nothing, and the confirming
 * control wears that same flag so no press is offered.
 *
 * THE REPORT IS READ AS WRITTEN. An everywhere scope the identity authority never confirmed is
 * carried on as unconfirmed, and a person whose custody is already gone is never told that their
 * other browsers are. The report's `localCleared` needs no branch: the adapter clears this browser
 * on every outcome, which is what leaves the console here in the first place.
 *
 * @param props - {@link SessionEndingDialogProps}
 * @returns The every-browser confirmation over the console.
 */
export const SessionEndingDialog = (props: SessionEndingDialogProps) => {
  const {
    isOpen,
    onOpenChange
  }: SessionEndingDialogProps = props;
  const t = useTranslations("console");
  const router = useRouter();
  const session = useSession();
  const [isPending, setIsPending] = useState(false);
  const confirm = (): void => {
    if (isPending) {
      return;
    }
    setIsPending(true);
    void session.end("everywhere").then((report) => {
      onOpenChange(false);
      const ending = report.authorityEnding === "unconfirmed" ? UNCONFIRMED_VALUE : APPLIED_VALUE;
      router.replace(`${SIGN_IN_HREF}?${ENDING_PARAM}=${ending}`);
    });
  };
  return <SessionEndingDialogBase props={{
    title: t("account.sessionEnding.title"),
    description: t("account.sessionEnding.description"),
    scopeNote: t("account.sessionEnding.scopeNote"),
    cancelLabel: t("account.sessionEnding.cancel"),
    confirmLabel: t("account.sessionEnding.confirm"),
    pendingLabel: t("account.sessionEnding.pending"),
    isPending
  }} on={{
    confirm
  }} isOpen={isOpen} onOpenChange={onOpenChange} />;
};