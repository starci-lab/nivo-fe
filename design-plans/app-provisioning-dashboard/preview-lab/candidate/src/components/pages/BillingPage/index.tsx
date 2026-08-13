"use client"

import { useTranslations } from "next-intl"
import { Button, Heading, Text, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import fixture from "../../../resources/console.fixture.json"

/**
 * PAGE - wallet and invoices.
 *
 * TARGET PATH: `apps/app/src/components/pages/BillingPage/index.tsx`.
 *
 * THE BALANCE IS ITS OWN SECTION, ABOVE THE LIST. It is the one figure a reader came for, and putting
 * it inside the invoice list would make it read as a property of the invoices rather than of the
 * account.
 *
 * AN UNPAID INVOICE CARRIES ITS STATE AS A WORD, NOT A COLOUR. The `Text` leaf has a tone vocabulary
 * but no danger tone that a figure could take, and the console has no badge in this shape - so the
 * status is said. When the row gains a press it will become a real action row; today it would be a
 * button that calls nothing.
 *
 * WHAT IS DELIBERATELY NOT HERE: AI spend. `creditBurnUsd` is per-instance and lifetime-to-date, so
 * it belongs to a resource rather than to this account-level page - and a total shown here would
 * silently exclude every agent workspace, which always reports null. The plan record leaves where it
 * lands as an open question rather than answering it with a number that is wrong for half the fleet.
 *
 * ONE FILE, per SPLIT-6: the candidate reads a fixture.
 */

/** Which shape the section is in. */
export type BillingPhase = "populated" | "empty"

/** Props for {@link BillingPage}. */
export interface BillingPageProps {
    /** The state being rendered. */
    readonly phase: BillingPhase
}

/**
 * The billing section.
 *
 * @param props - {@link BillingPageProps}
 * @returns The page node.
 */
export const BillingPage = ({ phase }: BillingPageProps) => {
    const t = useTranslations("billing")
    const invoices = phase === "populated" ? fixture.invoices : []

    const wallet = defineContractComponent("label-row-over-card", {
        label: defineContractComponent("title-with-end-action", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: t("walletLabel"), level: 2 }} />
            )),
            end: defineLeafComponent("button", {}, () => (
                <Button props={{ label: t("topUp"), size: "sm", variant: "secondary" }} on={{ press: () => undefined }} />
            )),
        }),
        body: defineLeafComponent("text", {}, () => (
            <Text props={{ content: fixture.wallet.balance, weight: "semibold" }} />
        )),
    })

    const invoiceSection = defineContractComponent("label-row-over-card", {
        label: defineContractComponent("title-with-baseline-fact", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: t("invoicesLabel"), level: 2 }} />
            )),
            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: t("invoicesFact", { count: invoices.length }), size: "sm", tone: "muted" }} />
            )),
        }),
        body: invoices.length === 0
            ? defineLeafComponent("text", {}, () => (
                <Text props={{ content: t("empty"), size: "sm", tone: "muted" }} />
            ))
            : defineContractComponent("labelled-fact-stack", {
                fact: invoices.map((invoice) => defineContractComponent("label-value-row", {
                    label: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: invoice.label, size: "sm" }} />
                    )),
                    value: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text
                            props={{
                                content: `${invoice.amount} · ${invoice.status === "unpaid" ? t("unpaid") : t("paid")}`,
                                size: "sm",
                                tone: "muted",
                            }}
                        />
                    )),
                })),
            }),
    })

    return (
        <Tree
            contract="titled-body"
            render={defineContractComponent("titled-body", {
                heading: defineContractComponent("title-with-end-action", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: t("title"), level: 1 }} />
                    )),
                }),
                /*
                 * READING ORDER (PAGE-7): the balance first, because it decides whether the invoice
                 * below it is a problem.
                 */
                body: defineContractComponent("stacked-sections", { section: [wallet, invoiceSection] }),
            })}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "page", world: "pure" } as const
