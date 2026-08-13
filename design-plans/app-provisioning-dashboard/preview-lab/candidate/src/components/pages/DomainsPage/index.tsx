"use client"

import { useTranslations } from "next-intl"
import { Button, Heading, Text, Tree, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import fixture from "../../../resources/console.fixture.json"

/**
 * PAGE - the domains this account holds.
 *
 * TARGET PATH: `apps/app/src/components/pages/DomainsPage/index.tsx`.
 *
 * DAYS-REMAINING IS COMPUTED HERE, AND THAT IS NOT A SHORTCUT. `DomainEntity` carries a `status` column
 * whose union includes `expiring`, and NOTHING in nivo-backend ever writes it - only the seeder does,
 * on one fixture row. There is no scheduler moving a domain from active to expiring to expired. A
 * console that trusted that column would show a domain expiring in three days as `active` right up
 * until it died, so the days remaining are derived from `expiresAt`, which is real.
 *
 * THE EXPIRY IS THE FACT, NOT THE NAME. A reader opens this section to answer one question - what is
 * about to lapse - so the list is ordered by `expiresAt` ascending, which is also how `myDomains`
 * already returns it.
 *
 * ONE FILE, per SPLIT-6: the candidate reads a fixture.
 */

/** Which shape the section is in. */
export type DomainsPhase = "populated" | "empty"

/** Props for {@link DomainsPage}. */
export interface DomainsPageProps {
    /** The state being rendered. */
    readonly phase: DomainsPhase
}

/**
 * The domains section.
 *
 * @param props - {@link DomainsPageProps}
 * @returns The page node.
 */
export const DomainsPage = ({ phase }: DomainsPageProps) => {
    const t = useTranslations("domains")
    const domains = phase === "populated" ? fixture.domains : []

    const body = domains.length === 0
        ? defineLeafComponent("text", {}, () => (
            <Text props={{ content: t("empty"), size: "sm", tone: "muted" }} />
        ))
        : defineContractComponent("label-row-over-card", {
            label: defineContractComponent("title-with-baseline-fact", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: t("listLabel"), level: 2 }} />
                )),
                fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: t("listFact", { count: domains.length }), size: "sm", tone: "muted" }} />
                )),
            }),
            body: defineContractComponent("labelled-fact-stack", {
                fact: domains.map((domain) => defineContractComponent("label-value-row", {
                    label: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: domain.name, size: "sm" }} />
                    )),
                    /*
                     * The days and the renewal habit read as ONE fact, because either alone is
                     * misleading: twelve days is fine if it renews itself and is an emergency if it
                     * does not.
                     */
                    value: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text
                            props={{
                                content: `${t("expiresIn", { days: domain.daysLeft })} · ${domain.autoRenew ? t("autoRenewOn") : t("autoRenewOff")}`,
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
                    end: defineLeafComponent("button", {}, () => (
                        <Button props={{ label: t("addDomain"), size: "sm", variant: "primary" }} on={{ press: () => undefined }} />
                    )),
                }),
                body,
            })}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "page", world: "pure" } as const
