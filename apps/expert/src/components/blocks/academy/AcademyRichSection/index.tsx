import { Fragment } from "react"
import { Badge, Heading, SurfaceCard, Text } from "@starci/grammar/common"
import { Avatar } from "@nivo/ui"
import type { AcademySection, AcademySectionImageState } from "../../../../modules/academy/academy-sections"
import { AcademySectionBand } from "../AcademySectionBand"
import { AcademySectionFigure } from "../AcademySectionFigure"
import { QUOTE_CLASS_NAME } from "./classNames"

type RichSection = Extract<AcademySection, { readonly kind: "instructor" | "stats" | "testimonials" | "gallery" | "courses" }>
type AcademyRichSectionProps = { readonly section: RichSection; readonly imageState: AcademySectionImageState }

/** Draw authored collections and the course catalog with their shared image and card leaves. */
export const AcademyRichSection = (props: AcademyRichSectionProps) => {
    const section = props.section
    const { Band, headingPart, subjectOverCaption, claimPanel } = AcademySectionBand
    switch (section.kind) {
        case "instructor": {
            const person = section.person
            return (
                <Band alt parts={[
                    <div key="instructor">
                        <AcademySectionFigure src={person.photoUrl} alt={person.name} ratio="3/4" {...props.imageState} />
                        <div>
                            {subjectOverCaption(<Heading level={2}>{person.name}</Heading>, person.title)}
                            <Text tone="muted">{person.bio}</Text>
                            <div>{person.credentials.map((credential) => <Text key={credential} size="sm">{credential}</Text>)}</div>
                            {person.quote === undefined ? undefined : (
                                <blockquote key="quote" className={QUOTE_CLASS_NAME}>
                                    <Text size="sm" tone="muted">{person.quote}</Text>
                                </blockquote>
                            )}
                        </div>
                    </div>,
                ]} />
            )
        }
        case "stats":
            return (
                <Band parts={[
                    <div key="stats">
                        {section.stats.map((stat) => (
                            <Fragment key={stat.label}>
                                {subjectOverCaption(<Heading level={2}>{stat.value}</Heading>, stat.label)}
                            </Fragment>
                        ))}
                    </div>,
                ]} />
            )
        case "testimonials":
            return (
                <Band alt parts={[
                    headingPart(section.title),
                    <div key="testimonials">
                        {section.testimonials.map((testimonial) => (
                            <Fragment key={testimonial.name}>
                                {claimPanel({
                                    voice: (
                                        <div>
                                            <Avatar props={{ name: testimonial.name, src: testimonial.avatarUrl, size: "sm" }} />
                                            {subjectOverCaption(
                                                <Text size="sm" weight="medium">{testimonial.name}</Text>,
                                                testimonial.role,
                                            )}
                                            <Text size="xs">{`${testimonial.stars}/5`}</Text>
                                        </div>
                                    ),
                                    claim: <Text size="sm" tone="muted">{testimonial.quote}</Text>,
                                    proof: testimonial.result === undefined ? undefined : <Badge>{testimonial.result}</Badge>,
                                })}
                            </Fragment>
                        ))}
                    </div>,
                ]} />
            )
        case "gallery":
            return (
                <Band parts={[
                    headingPart(section.title),
                    <div key="gallery">
                        {section.gallery.map((item) => (
                            <Fragment key={item.caption}>
                                {subjectOverCaption(
                                    <AcademySectionFigure src={item.url} alt={item.caption} {...props.imageState} />,
                                    item.caption,
                                )}
                            </Fragment>
                        ))}
                    </div>,
                ]} />
            )
        case "courses": {
            const emptyNotice = (
                <SurfaceCard>
                    <div>
                        <div>
                            <Text size="sm" weight="medium">{section.emptyTitle}</Text>
                            <Text size="xs">{section.emptyBody}</Text>
                        </div>
                    </div>
                </SurfaceCard>
            )
            const catalog = (
                <div>
                    {section.courses.map((course) => (
                        <Fragment key={course.id}>
                            {claimPanel({
                                claim: <Text weight="medium">{course.title}</Text>,
                                note: course.summary === null ? undefined : <Text size="sm" tone="muted">{course.summary ?? ""}</Text>,
                                proof: course.priceText === null ? undefined : <Badge>{course.priceText ?? ""}</Badge>,
                            })}
                        </Fragment>
                    ))}
                </div>
            )
            return <Band parts={[headingPart(section.title), section.courses.length === 0 ? emptyNotice : catalog]} />
        }
    }
}
