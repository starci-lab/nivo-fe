import { Fragment } from "react"
import { Button, Heading, Text } from "@starci/grammar/common"
import type { AcademySection, AcademySectionImageState } from "../../../../modules/academy/academy-sections"
import { AcademySectionBand } from "../AcademySectionBand"
import { AcademySectionFigure } from "../AcademySectionFigure"
import { CUSTOM_BODY_CLASS_NAME, PULL_QUOTE_CLASS_NAME } from "./classNames"

type CustomSection = Extract<AcademySection, { readonly kind: "custom" }>
type AcademyCustomSectionProps = { readonly section: CustomSection; readonly imageState: AcademySectionImageState }
type CustomContent = CustomSection["content"]

const customPieces = (content: CustomContent, imageState: AcademySectionImageState) => {
    const headingText = content.heading
    const bodyText = content.body
    const actionSpec = content.action
    const imageUrl = content.imageUrl
    const imageAlt = headingText ?? ""
    const heading = headingText === undefined ? undefined : <Heading level={2}>{headingText}</Heading>
    const body =
        bodyText === undefined ? undefined : (
            <div className={CUSTOM_BODY_CLASS_NAME}>
                <Text as="p">{bodyText}</Text>
            </div>
        )
    const actionLeaf = actionSpec === undefined ? undefined : <Button variant="primary">{actionSpec.label}</Button>
    const actionRun =
        actionLeaf === undefined ? undefined : (
            <div>
                <>{actionLeaf}</>
            </div>
        )
    const figure = <AcademySectionFigure src={imageUrl} alt={imageAlt} {...imageState} />
    return {
        shape: content.variant ?? "stack",
        attribution: content.attribution,
        columns: content.columns ?? [],
        headingText,
        bodyText,
        imageUrl,
        heading,
        body,
        actionLeaf,
        actionRun,
        figure,
    }
}

type CustomPieces = ReturnType<typeof customPieces>

const quoteBand = ({ bodyText, headingText, attribution }: CustomPieces) => {
    const quoted = bodyText ?? headingText
    const attributed =
        attribution === undefined ? [] : [<Text key="attribution" size="sm" tone="muted">{`— ${attribution}`}</Text>]
    return (
        <AcademySectionBand.Band
            parts={[
                <blockquote key="quote" className={PULL_QUOTE_CLASS_NAME}>
                    {quoted}
                </blockquote>,
                ...attributed,
            ]}
        />
    )
}

const columnsBand = ({ heading, columns, actionRun }: CustomPieces) => (
    <AcademySectionBand.Band
        parts={[
            ...(heading === undefined ? [] : [heading]),
            <div key="columns">
                {columns.map((column) => (
                    <Fragment key={column.title}>
                        {AcademySectionBand.claimPanel({
                            claim: <Text weight="medium">{column.title}</Text>,
                            note:
                                column.text === undefined ? undefined : (
                                    <Text size="sm" tone="muted">
                                        {column.text}
                                    </Text>
                                ),
                        })}
                    </Fragment>
                ))}
            </div>,
            ...(actionRun === undefined ? [] : [actionRun]),
        ]}
    />
)

const ctaBand = ({ heading, body, actionLeaf }: CustomPieces) => (
    <AcademySectionBand.Band
        alt
        parts={[
            <div key="cta">
                {heading}
                {body}
                {actionLeaf}
            </div>,
        ]}
    />
)

const figureBand = ({ figure, heading, body, actionLeaf }: CustomPieces) => (
    <AcademySectionBand.Band
        parts={[
            <div key="figure">
                {figure}
                <div>
                    {heading}
                    {body}
                    {actionLeaf}
                </div>
            </div>,
        ]}
    />
)

const stackBand = ({ heading, imageUrl, figure, body, actionRun }: CustomPieces) => (
    <AcademySectionBand.Band
        parts={[
            ...(heading === undefined ? [] : [heading]),
            ...(imageUrl === undefined ? [] : [figure]),
            ...(body === undefined ? [] : [body]),
            ...(actionRun === undefined ? [] : [actionRun]),
        ]}
    />
)

/** Draw an expert-authored section in its configured custom shape. */
export const AcademyCustomSection = (props: AcademyCustomSectionProps) => {
    const pieces = customPieces(props.section.content, props.imageState)
    if (pieces.shape === "quote") return quoteBand(pieces)
    if (pieces.shape === "columns") return columnsBand(pieces)
    if (pieces.shape === "cta") return ctaBand(pieces)
    if (pieces.shape === "image-left" || pieces.shape === "image-right") return figureBand(pieces)
    return stackBand(pieces)
}
