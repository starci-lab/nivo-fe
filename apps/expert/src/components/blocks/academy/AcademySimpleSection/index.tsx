import { Fragment } from "react"
import { Text } from "@starci/grammar/common"
import type { AcademySection } from "../../../../modules/academy/academy-sections"
import { AcademySectionBand } from "../AcademySectionBand"

type SimpleSection = Extract<
    AcademySection,
    { readonly kind: "hero" | "problems" | "outcomes" | "roadmap" | "community" | "offer" | "faq" | "magnet" }
>
type AcademySimpleSectionProps = { readonly section: SimpleSection }

/** Draw product-defined sections that do not need image or collection state. */
export const AcademySimpleSection = (props: AcademySimpleSectionProps) => {
    const section = props.section
    const { Band, headingPart, textPart, buttonPart, claimPanel } = AcademySectionBand
    switch (section.kind) {
        case "hero":
            return (
                <Band
                    parts={[
                        headingPart(section.name, 1),
                        textPart(section.tagline),
                        <div key="hero-actions">
                            {buttonPart(section.tryFreeLabel, "primary", "/sign-in")}
                            {buttonPart(section.seeCoursesLabel, "outline", "#courses")}
                        </div>,
                    ]}
                />
            )
        case "problems":
            return (
                <Band parts={[
                    headingPart(section.title),
                    <div key="problems">
                        {section.problems.map((problem) => (
                            <Fragment key={problem}>{claimPanel({ claim: <Text size="sm">{problem}</Text> })}</Fragment>
                        ))}
                    </div>,
                ]} />
            )
        case "outcomes":
            return (
                <Band alt parts={[
                    headingPart(section.title),
                    <div key="outcomes">
                        {section.outcomes.map((outcome) => (
                            <Fragment key={outcome}>{claimPanel({ claim: <Text weight="medium">{outcome}</Text> })}</Fragment>
                        ))}
                    </div>,
                ]} />
            )
        case "roadmap":
            return (
                <Band alt parts={[
                    headingPart(section.title),
                    <div key="roadmap">
                        {section.steps.map((step, index) => (
                            <div key={step}>
                                <Text size="sm" weight="semibold">{String(index + 1)}</Text>
                                <Text size="sm">{step}</Text>
                            </div>
                        ))}
                    </div>,
                ]} />
            )
        case "community":
            return <Band alt parts={[headingPart(section.title), textPart(section.body)]} />
        case "offer":
            return <Band parts={[headingPart(section.title), textPart(section.body)]} />
        case "faq":
            return (
                <Band alt parts={[
                    headingPart(section.title),
                    <div key="faq">
                        {section.faq.map((entry) => (
                            <div key={entry.q}>
                                <Text size="sm" weight="medium">{entry.q}</Text>
                                <Text size="sm" tone="muted">{entry.a}</Text>
                            </div>
                        ))}
                    </div>,
                ]} />
            )
        case "magnet":
            return (
                <Band alt parts={[
                    headingPart(section.magnet.title),
                    textPart(section.magnet.description),
                    <div key="magnet-actions">{buttonPart(section.magnet.cta, "primary")}</div>,
                ]} />
            )
    }
}
