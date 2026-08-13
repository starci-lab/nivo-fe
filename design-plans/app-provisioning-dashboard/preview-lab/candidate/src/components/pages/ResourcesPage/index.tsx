"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Tree, SurfaceListCard, Heading, Button, Text } from "@nivo/ui"
import { ChoiceTabs } from "@nivo/ui/leaves/ChoiceTabs"
import {
    defineContractComponent,
    defineContractProjection,
    defineCompositeComponent,
    defineLeafComponent,
    type LeafProps,
} from "@nivo/ui/contracts/props"
import type { SurfaceListCardActions } from "@nivo/ui/branches/SurfaceListCard"
import { StatRow, type StatRowData } from "../../../../../../../../packages/ui/src/composites/StatRow"
/*
 * THE BLOCK LIVES IN THE APP, not in `@nivo/ui`, and the deep path is the honest consequence.
 * `FleetRow` knows what a site and a workspace are - feature meaning - and a package that knew that
 * would be a package that knows this product. The candidate reaches across to the app's own copy so
 * that what these screenshots seal is the block Apply will actually render, not a lookalike.
 */
import { FleetRow, type FleetStatus } from "../../../../../../../../apps/app/src/components/blocks/provisioning/FleetRow"
import fixture from "../../../resources/fleet.fixture.json"

/**
 * PAGE - the provisioning fleet, in every state it can truthfully be in.
 *
 * FUTURE TARGET PATH: `apps/app/src/components/pages/ProvisioningPage/index.tsx`.
 *
 * REVISION 1.3 MOVED IT OUT OF THE ROUTING TREE. Until now this file sat at
 * `app/provisioning/fleet-page.tsx`, and it should never have: a file under `app/` names which page
 * renders at which URL, and nothing else (LAYOUT-6). The routing tree is addressed by URL rather
 * than browsed by tier, so a component parked there is invisible to everyone who would look for it
 * beside its siblings. It reached an approval with every gate green because the law that refused it
 * was prose and no rule read it - `starci-fe/route-tree-holds-routes-only` now does.
 *
 * ONE FILE, NOT TWO, per SPLIT-6: the split exists because a request exists, and this screen still
 * reads a fixture. When the GraphQL client lands, the query becomes `index.tsx` and this shape moves
 * to `component.tsx` behind an exact `_ProvisioningPage`.
 *
 * REVISION 1.2 TOOK THE WORDS OUT. Revision 1.1 held Vietnamese sentences as constants and its route
 * was named `cap-phat`. Both are now refused by canon and both were worth refusing: a path is the
 * address a customer quotes and an import repeats, and copy written at the call site is copy nobody
 * can find - the same term ends up spelled three ways and a second language is impossible without
 * touching every file that renders a word. The component now receives finished text and never picks
 * a language; the fixture carries KEYS, so one fixture renders in any locale the app ships.
 *
 * FOUR STATES, NOT ONE. `populated` is the interesting one, but a record that sealed only that one
 * would look exactly like a record where the other three were never considered. `empty` is a real
 * day-one screen. `loading` and `error` are two different failures a single spinner would blur: a
 * query that has not answered yet, and a query that answered badly. The second is NOT the same as a
 * resource whose status is `failed` - that is fine data about a broken thing, this is no data.
 *
 * SKELETON ONLY WHAT IS GENUINELY PENDING. In `loading` the title, the action and the filter stay
 * truthful because they are known before the query returns; the counts and the rows are not.
 */

type Kind = "site" | "workspace"

type Resource = {
    readonly id: string
    readonly kind: Kind
    readonly name: string
    readonly detail: string
    readonly status: FleetStatus
    readonly action?: string
}

/*
 * `icon` borrows StatRow's own field type rather than importing the icon leaf's vocabulary directly.
 * The distinction is not pedantry: reaching into `leaves/Icon` from a page is how a call site starts
 * deciding which glyph library, which glyph and what size, and canon refuses it. What this page is
 * actually entitled to know is what the COMPOSITE it renders will accept, which is what this reads.
 */
type Count = {
    readonly id: string
    readonly icon: StatRowData["icon"]
    readonly status: string
    readonly value: string
}

/** What the list surface is told about itself. */
type FleetListData = { readonly label: string; readonly fact: string }

const ALL = fixture.resources as ReadonlyArray<Resource>
const ALL_COUNTS = fixture.counts as ReadonlyArray<Count>

/** Which truthful shape the screen is in. */
export type ResourcesPhase = "populated" | "empty" | "loading" | "error"

/** Props for {@link ResourcesPage}. */
export interface ResourcesPageProps {
    /** The state being rendered. */
    readonly phase: ResourcesPhase
}

/**
 * The provisioning fleet page.
 *
 * @param props - {@link ResourcesPageProps}
 * @returns The page node.
 */
export const ResourcesPage = ({ phase }: ResourcesPageProps) => {
    const t = useTranslations("resources")
    const [filter, setFilter] = useState<string>("all")
    const isLoading = phase === "loading"
    const resources = phase === "populated" ? ALL : []
    const counts = phase === "populated" || isLoading ? ALL_COUNTS : []
    const shown = filter === "all" ? resources : resources.filter((r) => r.kind === filter)

    const filters = [
        { id: "all", label: t("filterAll") },
        { id: "site", label: t("kind.site") },
        { id: "workspace", label: t("kind.workspace") },
    ]

    const restingRows = [0, 1, 2].map((i) => ({
        id: `resting-${i}`,
        name: undefined,
        detail: undefined,
        kind: "site" as Kind,
        kindLabel: "",
        status: "provisioning" as FleetStatus,
        statusLabel: undefined,
        actionLabel: undefined,
    }))

    const heading = defineContractComponent("title-with-end-action", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: t("title"), level: 1 }} />
        )),
        end: defineLeafComponent("button", {}, () => (
            <Button props={{ label: t("newResource"), size: "sm", variant: "primary" }} on={{ press: () => undefined }} />
        )),
    })

    const summary = defineContractComponent("stacked-stat-rows", {
        stat: counts.map((c) => defineCompositeComponent("stat-row", {}, () => (
            <StatRow
                props={{ icon: c.icon, label: t(`status.${c.status}`), value: isLoading ? undefined : c.value }}
                isLoading={isLoading}
            />
        ))),
    })

    const filterStrip = defineContractComponent("choice-tab-strip", {
        tabs: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{ label: t("filterLabel"), selectedKey: filter, tabs: filters }}
                on={{ select: setFilter }}
            />
        )),
    })

    /*
     * A PROJECTION, because SurfaceListCard is a branch that draws the label and the vendor Card
     * itself - wrappers the contract cannot express. `defineContractProjection` is the registry's
     * own word for that: a branch that already drew the host for this contract.
     */
    const listBody = defineContractProjection("label-row-over-card", () => (
        <SurfaceListCard
            contract="fleet-resource-list"
            props={{
                label: t("listLabel"),
                /*
                 * THE EMPTY STRING IS DELIBERATE and is not a missing translation. `fact` decides
                 * the SHAPE of the label row: defined gives label-plus-muted-fact, undefined gives a
                 * bare heading, so dropping it while loading would move the label as the answer
                 * arrives. Defined-but-empty holds the shape while the surface draws its skeleton
                 * over it. A catalogue key here would be a string no reader can ever see - the
                 * skeleton replaces the glyphs entirely - and a translator would be maintaining it
                 * forever on the assumption that somebody reads it.
                 */
                fact: isLoading ? "" : t("listFact", { count: shown.length }),
            }}
            isLoading={isLoading}
            /*
             * The content reads `isLoading` from what the BRANCH handed it rather than from the
             * closure above. SurfaceListCard owns that flag inside its own surface, and a projection
             * that ignored it could disagree with the label sitting right above it.
             */
            render={defineContractComponent("fleet-resource-list", (
                surface: LeafProps<FleetListData, SurfaceListCardActions>,
            ) => (
                <Tree contract="fleet-resource-list" render={defineContractComponent("fleet-resource-list", {
                    resource: (surface.isLoading === true
                        ? restingRows
                        : shown.map((r) => ({
                            id: r.id,
                            name: r.name,
                            detail: r.detail,
                            kind: r.kind,
                            kindLabel: t(`kind.${r.kind}`),
                            status: r.status,
                            statusLabel: t(`status.${r.status}`),
                            actionLabel: r.action === undefined ? undefined : t(`action.${r.action}`),
                        }))
                    ).map((r) => defineCompositeComponent("fleet-row", {}, () => (
                        <FleetRow
                            props={{
                                id: r.id,
                                name: r.name,
                                detail: r.detail,
                                kind: r.kind,
                                kindLabel: r.kindLabel,
                                status: r.status,
                                statusLabel: r.statusLabel,
                                actionLabel: r.actionLabel,
                            }}
                            on={{ open: () => undefined, act: () => undefined }}
                            isLoading={surface.isLoading}
                        />
                    ))),
                })} />
            ))}
        />
    ))

    const sentence = (content: string) => defineLeafComponent("text", {}, () => (
        <Text props={{ content, size: "sm", tone: "muted" }} />
    ))

    const body = phase === "error"
        ? sentence(t("error"))
        : phase === "empty"
            ? sentence(t("empty"))
            : listBody

    return (
        <Tree contract="titled-summary-filter-over-body-page" render={defineContractComponent("titled-summary-filter-over-body-page", {
            heading,
            ...(counts.length === 0 ? {} : { summary }),
            filter: filterStrip,
            body,
        })} />
    )
}
