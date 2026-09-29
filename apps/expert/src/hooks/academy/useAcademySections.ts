import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useSubmitAcademyLead } from ".."
import type { Course } from "../../modules/api/academy"
import type { Locale } from "../../modules/i18n/config"
import {
    academySectionsOf,
    type AcademySectionsBaseProps,
    type AcademySectionsCopy,
    type LeadStatus,
    type LeadSubmit,
} from "../../modules/academy/academy-sections"

/** Own translations, authored-content projection and transient browser action state. */
export const useAcademySections = (courses: ReadonlyArray<Course>): AcademySectionsBaseProps => {
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
    const submitAcademyLead = useSubmitAcademyLead()
    const [failedImageSources, setFailedImageSources] = useState<ReadonlySet<string>>(() => new Set())
    const [leadStatus, setLeadStatus] = useState<LeadStatus>("idle")
    const sections = academySectionsOf(courses, locale, {
        hero: { tryFree: hero("tryFree"), seeCourses: hero("seeCourses") },
        problems: { title: problems("title") },
        outcomes: { title: outcomes("title"), first: outcomes("first"), second: outcomes("second"), third: outcomes("third") },
        roadmap: { title: roadmap("title") },
        testimonials: { title: testimonials("title") },
        gallery: { title: gallery("title") },
        courses: { title: coursesCopy("title"), emptyTitle: coursesCopy("emptyTitle"), emptyBody: coursesCopy("emptyBody") },
        community: { title: community("title"), body: community("body") },
        offer: { title: offer("title"), body: offer("body") },
        faq: { title: faq("title") },
        lead: {
            title: lead("title"),
            body: lead("body"),
            name: lead("name"),
            phone: lead("phone"),
            submit: lead("submit"),
            sending: lead("sending"),
            sent: lead("sent"),
            error: lead("error"),
        },
    } satisfies AcademySectionsCopy)
    const submitLead: LeadSubmit = async (input) => {
        if (leadStatus === "sending") return false
        setLeadStatus("sending")
        const ok = await submitAcademyLead(input)
        setLeadStatus(ok ? "sent" : "failed")
        return ok
    }
    const failImage = (src: string) =>
        setFailedImageSources((current) => (current.has(src) ? current : new Set([...current, src])))
    return {
        props: { sections, failedImageSources, leadStatus },
        on: { submitLead, failImage },
    }
}
