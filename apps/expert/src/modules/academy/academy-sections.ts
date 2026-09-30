import type { CoursesQuery } from "../api/__generated__/graphql"
import type { Locale } from "@/modules/i18n"
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
} from "./template"

/** One settled section, ready for the page's pure drawing half. */
export type AcademySection =
    | { readonly kind: "hero"; readonly id: string; readonly name: string; readonly tagline: string; readonly tryFreeLabel: string; readonly seeCoursesLabel: string }
    | { readonly kind: "problems"; readonly id: string; readonly title: string; readonly problems: ReadonlyArray<string> }
    | { readonly kind: "outcomes"; readonly id: string; readonly title: string; readonly outcomes: ReadonlyArray<string> }
    | { readonly kind: "roadmap"; readonly id: string; readonly title: string; readonly steps: ReadonlyArray<string> }
    | { readonly kind: "instructor"; readonly id: string; readonly person: Instructor }
    | { readonly kind: "stats"; readonly id: string; readonly stats: ReadonlyArray<Stat> }
    | { readonly kind: "testimonials"; readonly id: string; readonly title: string; readonly testimonials: ReadonlyArray<Testimonial> }
    | { readonly kind: "gallery"; readonly id: string; readonly title: string; readonly gallery: ReadonlyArray<GalleryItem> }
    | { readonly kind: "courses"; readonly id: string; readonly title: string; readonly emptyTitle: string; readonly emptyBody: string; readonly courses: ReadonlyArray<NonNullable<CoursesQuery["courses"]["data"]>[number]> }
    | { readonly kind: "community"; readonly id: string; readonly title: string; readonly body: string }
    | { readonly kind: "offer"; readonly id: string; readonly title: string; readonly body: string }
    | { readonly kind: "faq"; readonly id: string; readonly title: string; readonly faq: ReadonlyArray<Faq> }
    | { readonly kind: "magnet"; readonly id: string; readonly magnet: Magnet }
    | { readonly kind: "lead"; readonly id: string; readonly title: string; readonly body: string; readonly nameLabel: string; readonly phoneLabel: string; readonly submitLabel: string; readonly sendingLabel: string; readonly sentMessage: string; readonly errorMessage: string }
    | { readonly kind: "custom"; readonly id: string; readonly content: CustomContent }

/** Lead information the drawing half may submit to its connected owner. */
export type LeadSubmit = (input: { readonly name: string; readonly contact: string }) => Promise<boolean>

/** Page copy resolved from product translations before section projection. */
export type AcademySectionsCopy = {
    readonly hero: { readonly tryFree: string; readonly seeCourses: string }
    readonly problems: { readonly title: string }
    readonly outcomes: { readonly title: string; readonly first: string; readonly second: string; readonly third: string }
    readonly roadmap: { readonly title: string }
    readonly testimonials: { readonly title: string }
    readonly gallery: { readonly title: string }
    readonly courses: { readonly title: string; readonly emptyTitle: string; readonly emptyBody: string }
    readonly community: { readonly title: string; readonly body: string }
    readonly offer: { readonly title: string; readonly body: string }
    readonly faq: { readonly title: string }
    readonly lead: { readonly title: string; readonly body: string; readonly name: string; readonly phone: string; readonly submit: string; readonly sending: string; readonly sent: string; readonly error: string }
}

/** Image fallback state and event owned by the connected page hook. */
export type AcademySectionImageState = {
    readonly failedImageSources: ReadonlySet<string>
    readonly failImage: (src: string) => void
}

/** Lead form state shown while a public reader submits their details. */
export type LeadStatus = "idle" | "sending" | "sent" | "failed"

/** Image and lead state resolved for one section drawing pass. */
export type AcademySectionRenderState = AcademySectionImageState & {
    readonly leadStatus: LeadStatus
    readonly submitLead: (input: Parameters<LeadSubmit>[0]) => void
}

/** Actions the pure Academy page emits to its connected owner. */
export type AcademySectionsActions = {
    readonly submitLead: LeadSubmit
    readonly failImage: (src: string) => void
}

/** Resolved sections and transient state passed into the pure Academy page. */
export type AcademySectionsBaseProps = {
    readonly props: {
        readonly sections: ReadonlyArray<AcademySection>
        readonly failedImageSources: ReadonlySet<string>
        readonly leadStatus: LeadStatus
    }
    readonly on: AcademySectionsActions
}

/** Keep an authored list-backed section only when it has something to say. */
const whenAuthored = <T,>(items: ReadonlyArray<T>, build: () => AcademySection): AcademySection | null =>
    items.length === 0 ? null : build()

/** Keep an authored single-value section only when its value is present. */
const whenPresent = <T,>(value: T | undefined, build: (value: T) => AcademySection): AcademySection | null =>
    value === undefined ? null : build(value)

/** Resolve visible Academy sections in template order from authored data and product copy. */
export const academySectionsOf = (
    courses: ReadonlyArray<NonNullable<CoursesQuery["courses"]["data"]>[number]>,
    locale: Locale,
    copy: AcademySectionsCopy,
): ReadonlyArray<AcademySection> => {
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
    const systemSection = (key: string): AcademySection | null => {
        switch (key) {
            case "hero":
                return { kind: "hero", id: key, name: academy.name, tagline: academy.tagline, tryFreeLabel: copy.hero.tryFree, seeCoursesLabel: copy.hero.seeCourses }
            case "problems":
                return whenAuthored(academy.problems, () => ({ kind: "problems", id: key, title: copy.problems.title, problems: academy.problems }))
            case "outcomes":
                return { kind: "outcomes", id: key, title: copy.outcomes.title, outcomes: [copy.outcomes.first, copy.outcomes.second, copy.outcomes.third] }
            case "roadmap":
                return whenAuthored(academy.roadmap, () => ({ kind: "roadmap", id: key, title: copy.roadmap.title, steps: academy.roadmap }))
            case "instructor":
                return whenPresent(academy.instructor, (person) => ({ kind: "instructor", id: key, person }))
            case "stats":
                return whenAuthored(academy.stats, () => ({ kind: "stats", id: key, stats: academy.stats }))
            case "testimonials":
                return whenAuthored(academy.testimonials, () => ({ kind: "testimonials", id: key, title: copy.testimonials.title, testimonials: academy.testimonials }))
            case "gallery":
                return whenAuthored(academy.gallery, () => ({ kind: "gallery", id: key, title: copy.gallery.title, gallery: academy.gallery }))
            case "courses":
                return { kind: "courses", id: key, title: copy.courses.title, emptyTitle: copy.courses.emptyTitle, emptyBody: copy.courses.emptyBody, courses }
            case "community":
                return { kind: "community", id: key, title: copy.community.title, body: copy.community.body }
            case "offer":
                return { kind: "offer", id: key, title: copy.offer.title, body: copy.offer.body }
            case "faq":
                return whenAuthored(academy.faq, () => ({ kind: "faq", id: key, title: copy.faq.title, faq: academy.faq }))
            case "magnet":
                return whenPresent(academy.magnet, (magnet) => ({ kind: "magnet", id: key, magnet }))
            case "lead":
                return {
                    kind: "lead",
                    id: key,
                    title: copy.lead.title,
                    body: copy.lead.body,
                    nameLabel: copy.lead.name,
                    phoneLabel: copy.lead.phone,
                    submitLabel: copy.lead.submit,
                    sendingLabel: copy.lead.sending,
                    sentMessage: copy.lead.sent,
                    errorMessage: copy.lead.error,
                }
            default:
                return null
        }
    }
    return ACADEMY.layout.sections
        .filter((section) => section.visible)
        .map((section): AcademySection | null => {
            if (section.key.startsWith(CUSTOM_SECTION_PREFIX)) {
                return section.content === undefined ? null : { kind: "custom", id: section.key, content: section.content }
            }
            return systemSection(section.key)
        })
        .filter((section): section is AcademySection => section !== null)
}
