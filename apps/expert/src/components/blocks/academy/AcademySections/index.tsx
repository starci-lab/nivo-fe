"use client"

import { useLocale, useTranslations } from "next-intl"
import { submitLead, type Course } from "@/modules/api/academy"
import type { Locale } from "@/i18n/config"
import {
    ACADEMY,
    CUSTOM_SECTION_PREFIX,
    inLocale,
    type CustomContent,
    type Faq,
    type GalleryItem,
    type Instructor,
    type Magnet,
    type Stat,
    type Testimonial,
} from "@/modules/academy/template"
import { AcademySectionsBase } from "./component"

/**
 * BLOCK - `AcademySections`, connected half.
 *
 * IT SETTLES THE SITUATION AND DRAWS NOTHING. Which sections the expert made visible, in what order,
 * with which words, and whether each has anything to show - all of it is decided here, and
 * `component.tsx` receives the answer as a list it only has to render.
 *
 * WHY THE SPLIT EXISTS AT ALL, given the file worked. Every one of the fourteen sections called
 * `useTranslations` for itself, so not one of them could be rendered from a fixture: a test would
 * have had to stand up the translation runtime, the locale and the mounted template before it could
 * assert that a testimonial shows a rating. The whole page is now renderable from a plain array.
 *
 * TWO LANGUAGES ARRIVE BY TWO DIFFERENT ROUTES, and keeping them apart is the whole point. A heading
 * this product chose - "Courses", "No courses yet", a field label - is product copy and comes from
 * the catalogue through `useTranslations`. The academy's own words - its tagline, an instructor's
 * biography, a testimonial - come from the mounted template, authored by the expert in each language
 * they sell in. This product never rewrites the second kind; it only picks which of the versions the
 * expert wrote to show.
 *
 * A SYSTEM SECTION KNOWS ITS OWN DATA and owns its own empty state; an expert-authored section knows
 * nothing and draws what it is handed. That split is why a system section cannot be left to the
 * expert to write: "there are no courses yet" is a product decision, not content.
 *
 * AN EMPTY SECTION IS DROPPED HERE, NOT DRAWN AS NOTHING. Whether a section has anything to say is a
 * fact about the data, so it is answered where the data is. The drawing half then has no `null`
 * paths at all, and `courses` is the one deliberate exception: an academy with no courses yet has a
 * product-owned sentence to show, which is content rather than absence.
 */

/** What one section needs in order to be drawn, once every world lookup is done. */
export type AcademySection =
    | { readonly kind: "hero"; readonly id: string; readonly name: string; readonly tagline: string; readonly tryFreeLabel: string; readonly seeCoursesLabel: string }
    | { readonly kind: "problems"; readonly id: string; readonly title: string; readonly problems: ReadonlyArray<string> }
    | { readonly kind: "outcomes"; readonly id: string; readonly title: string; readonly outcomes: ReadonlyArray<string> }
    | { readonly kind: "roadmap"; readonly id: string; readonly title: string; readonly steps: ReadonlyArray<string> }
    | { readonly kind: "instructor"; readonly id: string; readonly person: Instructor }
    | { readonly kind: "stats"; readonly id: string; readonly stats: ReadonlyArray<Stat> }
    | { readonly kind: "testimonials"; readonly id: string; readonly title: string; readonly testimonials: ReadonlyArray<Testimonial> }
    | { readonly kind: "gallery"; readonly id: string; readonly title: string; readonly gallery: ReadonlyArray<GalleryItem> }
    | { readonly kind: "courses"; readonly id: string; readonly title: string; readonly emptyTitle: string; readonly emptyBody: string; readonly courses: ReadonlyArray<Course> }
    | { readonly kind: "community"; readonly id: string; readonly title: string; readonly body: string }
    | { readonly kind: "offer"; readonly id: string; readonly title: string; readonly body: string }
    | { readonly kind: "faq"; readonly id: string; readonly title: string; readonly faq: ReadonlyArray<Faq> }
    | { readonly kind: "magnet"; readonly id: string; readonly magnet: Magnet }
    | {
        readonly kind: "lead"
        readonly id: string
        readonly title: string
        readonly body: string
        readonly nameLabel: string
        readonly phoneLabel: string
        readonly submitLabel: string
        readonly sendingLabel: string
        readonly sentMessage: string
        readonly errorMessage: string
    }
    | { readonly kind: "custom"; readonly id: string; readonly content: CustomContent }

/**
 * Keep a list-backed section only when the expert authored something for it.
 *
 * WHY IT IS A HELPER AND NOT AN `if` PER CASE. Eight of the fourteen sections answer the same
 * question - "did the expert write anything here?" - and asking it inline turned one readable
 * switch into a branch thicket. The section is built lazily so an empty one costs nothing.
 *
 * @param items - The authored content the section draws.
 * @param build - How to settle the section when there is content.
 * @returns The settled section, or null to drop it.
 */
const whenAuthored = <T,>(items: ReadonlyArray<T>, build: () => AcademySection): AcademySection | null =>
    items.length === 0 ? null : build()

/**
 * Keep a single-value section only when the expert authored the one thing it draws.
 *
 * @param value - The authored value, or undefined when the expert wrote none.
 * @param build - How to settle the section around that value.
 * @returns The settled section, or null to drop it.
 */
const whenPresent = <T,>(value: T | undefined, build: (value: T) => AcademySection): AcademySection | null =>
    value === undefined ? null : build(value)

/** Hand a reader's details to whoever owns the request; answers whether it landed. */
export type LeadSubmit = (input: { readonly name: string; readonly contact: string }) => Promise<boolean>

/** Props for {@link AcademySections}. */
export interface AcademySectionsProps {
    /** The catalog fetched on the server. */
    readonly courses: Array<Course>
}

/**
 * Resolve every visible section the academy configured, in its own order, and render them.
 *
 * THE ORDER IS DATA, NOT MARKUP. `ACADEMY.layout.sections` is `TenantBrandEntity.layoutConfig`
 * exactly as provisioning wrote it, and position in that array IS render order. An expert who
 * reorders their sections in the panel changes this page without anyone touching it.
 *
 * A HIDDEN SECTION IS DROPPED, NOT HIDDEN. `visible: false` means the markup never exists, rather
 * than existing behind a `display: none` a screen reader would still walk.
 *
 * AN UNKNOWN KEY IS SKIPPED, ON PURPOSE -- that is how an older build survives a newer catalog.
 * The cost is a section the expert configured and cannot see, which `template.ts` records as a real
 * defect rather than a tolerance, so the drift is something to fix and not something to paper over.
 * It is also a silence worth naming: when this registry lived behind a client boundary the page
 * looked up every key from a server component, got `undefined` for all of them, skipped the lot,
 * and rendered an empty landmark with no error anywhere.
 *
 * THE CATALOG ARRIVES AS A PROP rather than being fetched here, so the page above can stay a Server
 * Component and an academy's courses land in the first HTML response where a search engine reads
 * them. It used to reach the sections through a React context, which existed only because each
 * section was looked up by key and called with no arguments; now that a section is DATA rather than
 * a component, the catalog is simply one of its fields.
 *
 * @param input - {@link AcademySectionsProps}
 * @returns Every visible section, in the expert's order.
 */
export const AcademySections = ({ courses }: AcademySectionsProps) => {
    const locale = useLocale() as Locale
    const hero = useTranslations("landing.hero")
    const problems = useTranslations("landing.problems")
    const outcomes = useTranslations("landing.outcomes")
    const roadmap = useTranslations("landing.roadmap")
    const testimonials = useTranslations("landing.testimonials")
    const gallery = useTranslations("landing.gallery")
    const coursesCopy = useTranslations("landing.courses")
    const community = useTranslations("landing.community")
    const offer = useTranslations("landing.offer")
    const faq = useTranslations("landing.faq")
    const lead = useTranslations("landing.lead")

    const academy = {
        name: inLocale(ACADEMY.identity.name, locale) ?? "",
        tagline: inLocale(ACADEMY.identity.tagline, locale) ?? "",
        instructor: inLocale(ACADEMY.content.instructor, locale),
        testimonials: inLocale(ACADEMY.content.testimonials, locale) ?? [],
        stats: inLocale(ACADEMY.content.stats, locale) ?? [],
        gallery: inLocale(ACADEMY.content.gallery, locale) ?? [],
        problems: inLocale(ACADEMY.content.problems, locale) ?? [],
        roadmap: inLocale(ACADEMY.content.roadmap, locale) ?? [],
        faq: inLocale(ACADEMY.content.faq, locale) ?? [],
        magnet: inLocale(ACADEMY.content.magnet, locale),
    }

    /**
     * One system section, resolved - or `null` when it has nothing to say.
     *
     * @param key - The section key the stored layout named.
     * @returns The settled section, or null to drop it.
     */
    const systemSection = (key: string): AcademySection | null => {
        switch (key) {
            case "hero":
                return {
                    kind: "hero",
                    id: key,
                    name: academy.name,
                    tagline: academy.tagline,
                    tryFreeLabel: hero("tryFree"),
                    seeCoursesLabel: hero("seeCourses"),
                }
            case "problems":
                return whenAuthored(academy.problems, () => ({ kind: "problems", id: key, title: problems("title"), problems: academy.problems }))
            case "outcomes":
                return {
                    kind: "outcomes",
                    id: key,
                    title: outcomes("title"),
                    outcomes: [outcomes("first"), outcomes("second"), outcomes("third")],
                }
            case "roadmap":
                return whenAuthored(academy.roadmap, () => ({ kind: "roadmap", id: key, title: roadmap("title"), steps: academy.roadmap }))
            case "instructor":
                return whenPresent(academy.instructor, (person) => ({ kind: "instructor", id: key, person }))
            case "stats":
                return whenAuthored(academy.stats, () => ({ kind: "stats", id: key, stats: academy.stats }))
            case "testimonials":
                return whenAuthored(academy.testimonials, () => ({ kind: "testimonials", id: key, title: testimonials("title"), testimonials: academy.testimonials }))
            case "gallery":
                return whenAuthored(academy.gallery, () => ({ kind: "gallery", id: key, title: gallery("title"), gallery: academy.gallery }))
            case "courses":
                return {
                    kind: "courses",
                    id: key,
                    title: coursesCopy("title"),
                    emptyTitle: coursesCopy("emptyTitle"),
                    emptyBody: coursesCopy("emptyBody"),
                    courses,
                }
            case "community":
                return { kind: "community", id: key, title: community("title"), body: community("body") }
            case "offer":
                return { kind: "offer", id: key, title: offer("title"), body: offer("body") }
            case "faq":
                return whenAuthored(academy.faq, () => ({ kind: "faq", id: key, title: faq("title"), faq: academy.faq }))
            case "magnet":
                return whenPresent(academy.magnet, (magnet) => ({ kind: "magnet", id: key, magnet }))
            case "lead":
                return {
                    kind: "lead",
                    id: key,
                    title: lead("title"),
                    body: lead("body"),
                    nameLabel: lead("name"),
                    phoneLabel: lead("phone"),
                    submitLabel: lead("submit"),
                    sendingLabel: lead("sending"),
                    sentMessage: lead("sent"),
                    errorMessage: lead("error"),
                }
            default:
                return null
        }
    }

    const sections = ACADEMY.layout.sections
        .filter((section) => section.visible)
        .map((section): AcademySection | null => {
            if (section.key.startsWith(CUSTOM_SECTION_PREFIX)) {
                // An expert-authored section carries its own content; without it there is nothing to
                // draw, and a heading-shaped hole reads as a broken page.
                return section.content === undefined
                    ? null
                    : { kind: "custom", id: section.key, content: section.content }
            }
            return systemSection(section.key)
        })
        .filter((section): section is AcademySection => section !== null)

    /**
     * Send a reader's details.
     *
     * IT LIVES HERE BECAUSE IT IS A REQUEST. The band that collects the details decides only what a
     * reader sees while it is in flight; whether anything reaches a server is not a drawing
     * decision, and a fixture render of that band must not post anywhere.
     *
     * @param input - The name and contact the reader typed.
     * @returns Whether it landed.
     */
    const onSubmitLead: LeadSubmit = async (input) => (await submitLead(input)).ok

    return <AcademySectionsBase sections={sections} onSubmitLead={onSubmitLead} />
}
