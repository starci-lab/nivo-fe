import { Children, type ReactNode } from "react"
import { SurfaceCard, Button, Heading, Text } from "@starci/grammar/common"

type BandParts = ReadonlyArray<ReactNode>
type ClaimPanelSlots = {
    readonly voice?: ReactNode
    readonly claim?: ReactNode
    readonly note?: ReactNode
    readonly proof?: ReactNode
}
type BandProps = {
    readonly alt?: boolean
    readonly parts: BandParts
}

const Band = ({ alt = false, parts }: BandProps) => {
    const column = <div>{Children.toArray(parts)}</div>
    return alt ? <div>{column}</div> : <div>{column}</div>
}

const headingPart = (content: string, level: 1 | 2 = 2) => <Heading level={level}>{content}</Heading>
const textPart = (content: string) => <Text tone="muted">{content}</Text>
const buttonPart = (label: string, variant: "primary" | "outline", href?: string) =>
    href === undefined ? <Button variant={variant}>{label}</Button> : <a href={href}><Button variant={variant}>{label}</Button></a>
const subjectOverCaption = (subject: ReactNode, caption: string) => (
    <div>
        {subject}
        <Text size="xs">{caption}</Text>
    </div>
)
const claimPanel = (slots: ClaimPanelSlots) => (
    <SurfaceCard>
        <div>
            {slots.voice}
            {slots.claim}
            {slots.note}
            {slots.proof}
        </div>
    </SurfaceCard>
)

/** Shared semantic building blocks used by Academy section renderers. */
export const AcademySectionBand = { Band, headingPart, textPart, buttonPart, subjectOverCaption, claimPanel }
