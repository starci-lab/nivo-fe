"use client"

import { Fragment, useState } from "react"
import {
    Avatar,
    Badge,
    Button,
    Heading,
    Label,
    SurfaceCard,
    Text,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type ChildrenOf,
} from "@nivo/ui"
import type { AcademySection, LeadSubmit } from "./index"

/**
 * BLOCK - `AcademySections`, drawing half.
 *
 * IT RECEIVES A LIST OF SETTLED SECTIONS AND ASKS FOR NOTHING. No locale read, no translation call,
 * no request: `index.tsx` decided which sections are visible, in what order, and with which words,
 * and this file only draws them. That is what makes the whole landing page renderable from a
 * fixture - and a page that cannot be rendered from a fixture cannot be tested, because the test
 * would have to provision an academy first.
 *
 * NOT ONE LINE HERE NAMES A COLOUR. Shades come from the variables `AcademyChrome` puts on the root,
 * so the page follows whichever academy this instance was provisioned for.
 *
 * NOT ONE LINE HERE NAMES A LAYOUT EITHER. Every structural node on this page is a registry key
 * from `@nivo/ui`, drawn by `Tree`. What a band holds, how a claim grid reflows, where a rating
 * lands on an identity row - all of it is decided once, in the registry, and typed here as a key.
 * A section that wants a shape none of the keys express is a finding to take to the registry, not
 * a reason to open a div.
 *
 * THE LOCAL STATE THAT REMAINS IS UI STATE, NOT THE WORLD. A picture that failed to load and a form
 * that is mid-submit are facts about this render, not about the product's data - neither can be
 * decided one file away, and neither makes this file unrenderable from a fixture.
 */

/** Everything one band stacks, in reading order, as the contract for a band's column admits it. */
type BandParts = ChildrenOf<"stacked-band-parts">["part"]

/** One of those parts. */
type BandPart = BandParts[number]

/** Props for {@link Band}. */
type BandProps = {
    /** Whether this band takes the alternating ground so a reader can count sections. */
    readonly alt?: boolean
    /** What the band says, top to bottom. */
    readonly parts: BandParts
}

/**
 * One band of the page.
 *
 * THE GROUND IS A SECOND KEY, NOT A PROP. `banded-measure-column-on-surface` differs from
 * `banded-measure-column` by one class, and that class belongs to the registry - a band whose
 * ground is assembled at render time has two owners and nothing that can read it back.
 *
 * WHAT THIS NO LONGER EMITS: the `data-section={id}` hook the hand-written `<section>` carried.
 * A registry node is drawn by `Tree`, which paints `data-node` and `data-why` from the entry and
 * accepts no attributes of its own, so a per-band identity attribute has nowhere to live here.
 * The registry already reserves the home for it - `academy-band-run` declares a `composite:
 * "academy-band"` child - and that composite is where a `<section data-section>` landmark belongs,
 * since a composite owns its own host. Until it exists, per-band CSS selectors written by an
 * academy will not match; the nodes still carry `data-node`, which selects the band SHAPE but not
 * which band it is.
 *
 * @param input - {@link BandProps}
 */
const Band = ({ alt = false, parts }: BandProps) => {
    const column = defineContractComponent("stacked-band-parts", { part: parts })
    if (alt) {
        return (
            <Tree
                contract="banded-measure-column-on-surface"
                render={defineContractComponent("banded-measure-column-on-surface", { column })}
            />
        )
    }
    return (
        <Tree
            contract="banded-measure-column"
            render={defineContractComponent("banded-measure-column", { column })}
        />
    )
}

/** Props for {@link Figure}. */
type FigureProps = {
    /** The link the expert pasted, when there is one. */
    readonly src?: string
    /** What the picture shows, for a reader who cannot see it. */
    readonly alt: string
    /** The shape of the space the picture holds. */
    readonly ratio?: string
}

/**
 * One image, from a link the expert pasted.
 *
 * Two states are ordinary rather than rare here: no link yet, and a link that has died. Both fall
 * back to the same frame holding the same space, so the page does not lurch when an image hosted
 * where nivo has no control disappears - which it eventually will.
 *
 * THE FRAME IS THE `<figure>` ITSELF rather than a div around one. A picture frame is not a node in
 * the page's tree - nothing else is ever put inside it - so it needs no registry key, and it draws
 * its own interior the way any leaf does. The placeholder centres itself through the SVG viewBox
 * instead of through a flex host, which is why the padded `-64 -64 192 192` box is deliberate: the
 * glyph keeps the middle third of the frame at every size without a layout class being written.
 *
 * `referrerPolicy="no-referrer"` is deliberate. This is a public page, and every external image is a
 * request from a STUDENT'S browser to a stranger's server. Withholding the referrer is the minimum;
 * it does not hide the student's address, and that gap is still an open business question.
 *
 * @param input - {@link FigureProps}
 */
const Figure = ({ src, alt, ratio = "4/3" }: FigureProps) => {
    const [failed, setFailed] = useState(false)
    const usable = src !== undefined && src !== "" && !failed
    return (
        <figure
            className="rounded-xl border border-border bg-surface-secondary"
            style={{ aspectRatio: ratio }}
        >
            {usable
                ? (
                    <img
                        src={src}
                        alt={alt}
                        referrerPolicy="no-referrer"
                        onError={() => setFailed(true)}
                        className="h-full w-full rounded-xl object-cover"
                    />
                )
                : (
                    <svg viewBox="-64 -64 192 192" className="h-full w-full opacity-25" aria-hidden="true">
                        <circle cx="32" cy="22" r="12" fill="currentColor" />
                        <path d="M8 62c0-13 11-22 24-22s24 9 24 22z" fill="currentColor" />
                    </svg>
                )}
        </figure>
    )
}

/**
 * A title, as the leaf identity a band part admits.
 *
 * @param content - The already-resolved words.
 * @param level - Where the title sits in the document outline.
 */
const headingPart = (content: string, level: 1 | 2 = 2) =>
    defineLeafComponent("heading", {}, () => <Heading props={{ content, level }} />)

/**
 * A paragraph of supporting copy, as the leaf identity a band part admits.
 *
 * @param content - The already-resolved words.
 */
const textPart = (content: string) =>
    defineLeafComponent("text", {}, () => <Text props={{ content, tone: "muted" }} />)

/**
 * One press, as the leaf identity an action run admits.
 *
 * @param label - The already-resolved label.
 * @param variant - Whether this is the main press or the alternative beside it.
 * @param href - Where it leads, when it leads anywhere.
 */
const buttonPart = (label: string, variant: "primary" | "outline", href?: string) =>
    defineLeafComponent("button", {}, () => (
        href === undefined
            ? <Button props={{ label, variant }} />
            : <a href={href}><Button props={{ label, variant }} /></a>
    ))

/**
 * A muted caption under a subject, the pair three sections all reach for.
 *
 * The subject is typed from the CONTRACT rather than reused from `BandPart`. They look
 * interchangeable and are not: a band part admits whole contract nodes, while this slot admits one
 * leaf, and borrowing the wider type here would let a caller pass a grid into a caption pair and
 * find out at render.
 */
const subjectOverCaption = (
    subject: ChildrenOf<"subject-over-muted-caption">["subject"],
    caption: string,
) =>
    defineContractComponent("subject-over-muted-caption", {
        subject,
        caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: caption, size: "xs" }} />
        )),
    })

/**
 * One claim, standing on a surface of its own.
 *
 * THE GROUND IS THE BRANCH'S, NOT THE ENTRY'S. `attributed-claim-panel` says how a speaker, a claim
 * and a proof chip sit together; the card they sit on is paint, and paint has one owner in this
 * repository - the named surface branch. `SurfaceCard` with no label draws that ground and nothing
 * above it, which is what a card in a grid of cards wants: a heading over each one would repeat the
 * grid's own title four times.
 *
 * IT COMES BACK AS A PROJECTION because the branch has already opened the host for this key. The
 * grid slot still admits it under the panel's own contract identity, so what the grid holds is
 * checked exactly as it was before the ground moved.
 */
const claimPanel = (slots: ChildrenOf<"attributed-claim-panel">) =>
    defineContractProjection("attributed-claim-panel", () => (
        <SurfaceCard
            contract="attributed-claim-panel"
            render={defineContractComponent("attributed-claim-panel", slots)}
        />
    ))

/**
 * The scale a testimonial's score is read against.
 *
 * The score used to be drawn as a run of star glyphs. Emoji are not authored in source, and the
 * closed icon vocabulary has no star, so the same fact is stated as a figure until a `rating` leaf
 * exists to draw it - the registry already names that leaf on `avatar-identity-rating-row`.
 */
const STAR_SCALE = 5

/** One control the lead form draws: its identity, its label, and the keyboard it asks for. */
type LeadField = readonly [id: string, label: string, kind: "text" | "tel"]

/** Where a reader's details have got to. */
type LeadStatus = "idle" | "sending" | "sent" | "failed"

/**
 * One value the reader typed, read as a string.
 *
 * `FormData` answers with a file for a file control, and a file stringified is `[object File]`. This
 * form has no file control and never will (BR-B07), so anything that is not text is read as nothing
 * rather than printed into somebody's name.
 *
 * @param form - The submitted values.
 * @param field - Which control to read.
 */
const leadField = (form: FormData, field: string) => {
    const value = form.get(field)
    return typeof value === "string" ? value : ""
}

/** What {@link leadForm} needs to draw the controls and to say where the submission has got to. */
type LeadFormInput = {
    /** The controls, in reading order. */
    readonly fields: ReadonlyArray<LeadField>
    /** Where the submission has got to. */
    readonly status: LeadStatus
    /** The press label at rest. */
    readonly submitLabel: string
    /** The press label while the request is in flight. */
    readonly sendingLabel: string
    /** What submitting does. */
    readonly onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void
}

/**
 * The lead form, as the projection `form-column` admits.
 *
 * IT IS BUILT HERE, beside the other part builders, rather than inside the band. A projection's
 * render draws a whole subtree, and one declared inside the component that uses it is a second
 * component defined per render - the shape that costs a remount, and a remount here costs a
 * half-typed phone number.
 *
 * THE `<form>` IS THE PROJECTION'S OWN HOST. `form-column` arranges the controls; the element that
 * submits them is host mechanics no contract can express, so it is declared as a projection of that
 * key and the node inside it is still drawn by `Tree`.
 *
 * THE BOX IS STILL THE PLATFORM'S. The `Input` leaf's `kind` union has no `tel` member, and a phone
 * number typed into a `text` box offers a phone the wrong keyboard. Rather than change that
 * silently, the box keeps its own type here - a finding for whoever owns the leaf's vocabulary.
 *
 * @param input - {@link LeadFormInput}
 */
const leadForm = ({ fields, status, submitLabel, sendingLabel, onSubmit }: LeadFormInput) => {
    const locked = status === "sending" || status === "sent"
    return defineContractProjection("form-column", () => (
        <form onSubmit={onSubmit}>
            <Tree
                contract="form-column"
                render={defineContractComponent("form-column", {
                    field: fields.map(([id, label, kind]) => defineContractComponent("label-field-hint", {
                        label: defineLeafComponent("label", {}, () => (
                            <Label props={{ htmlFor: id, content: label }} />
                        )),
                        field: defineLeafComponent("input", {}, () => (
                            <input
                                id={id}
                                name={id}
                                type={kind}
                                placeholder={label}
                                required
                                disabled={locked}
                                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                            />
                        )),
                    })),
                    submit: defineLeafComponent("button", {}, () => (
                        <Button
                            props={{
                                label: status === "sending" ? sendingLabel : submitLabel,
                                variant: "primary",
                                type: "submit",
                                disabled: locked,
                            }}
                        />
                    )),
                })}
            />
        </form>
    ))
}

/** Props for {@link LeadBand}. */
type LeadBandProps = {
    /** The settled words for this section. */
    readonly section: Extract<AcademySection, { kind: "lead" }>
    /** Hand the reader's details to whoever owns the request. */
    readonly onSubmit: LeadSubmit
}

/**
 * `lead` - the only section on this page allowed to take a reader's data.
 *
 * BR-B07 draws its boundary exactly here. The e2e suite proves the public site captures leads and
 * shows them to the owner alone, so input fields belong to this section and never to one the expert
 * wrote - static text is quite capable of imitating a login prompt without any code at all.
 *
 * IT DOES NOT MAKE THE REQUEST. `onSubmit` arrives from the connected half; this file decides only
 * what the reader sees while it is in flight. Whether the details reach a server is not a drawing
 * decision, and a fixture render of this band must not post anything anywhere.
 *
 * THE `<form>` IS PROJECTED RATHER THAN OPENED, by {@link leadForm}, which also records why that
 * builder lives at module level and why the phone box keeps the platform's own type.
 *
 * @param input - {@link LeadBandProps}
 */
const LeadBand = ({ section, onSubmit }: LeadBandProps) => {
    const [status, setStatus] = useState<LeadStatus>("idle")
    const fields: ReadonlyArray<LeadField> = [
        ["lead-name", section.nameLabel, "text"],
        ["lead-phone", section.phoneLabel, "tel"],
    ]

    /**
     * Sends the reader's details.
     *
     * READ FROM THE FORM, NOT FROM STATE. Two controlled inputs would re-render the whole band on
     * every keystroke to hold two strings that are only ever read once, at submit.
     *
     * @param event - The submit that started it.
     */
    const send = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (status === "sending") {
            return
        }
        const form = new FormData(event.currentTarget)
        setStatus("sending")
        const ok = await onSubmit({
            name: leadField(form, "lead-name"),
            contact: leadField(form, "lead-phone"),
        })
        setStatus(ok ? "sent" : "failed")
    }

    return (
        <Band
            alt
            parts={[
                headingPart(section.title),
                textPart(section.body),
                leadForm({
                    fields,
                    status,
                    submitLabel: section.submitLabel,
                    sendingLabel: section.sendingLabel,
                    onSubmit: (event) => { void send(event) },
                }),
                /*
                 * The outcome sits in the BAND rather than in the form, because `form-column`
                 * declares exactly two slots -- the fields and the submit -- and adding a third to
                 * a contract every app shares is a canon change this section does not get to make
                 * on its own. A band part is already allowed to be a line of text, so the sentence
                 * lands under the button without anything being widened for it. A `notice` slot on
                 * `form-column` is the better home and is worth proposing separately.
                 */
                ...(status === "failed" ? [textPart(section.errorMessage)] : []),
                ...(status === "sent" ? [textPart(section.sentMessage)] : []),
            ]}
        />
    )
}

/** Everything an expert authored for one section, whatever shape the template chose for it. */
type CustomContent = Extract<AcademySection, { kind: "custom" }>["content"]

/**
 * The leaves every custom shape draws from, prepared once.
 *
 * WHY THEY ARE PREPARED BEFORE THE SHAPE IS KNOWN. Five shapes reach for the same six pieces and
 * each piece is optional in the same way, so asking "did the expert write one?" once per piece
 * leaves each shape to answer only the question it is actually about - where the pieces go.
 *
 * @param content - The expert's own content for one section.
 */
const customPieces = (content: CustomContent) => {
    const headingText = content.heading
    const bodyText = content.body
    const actionSpec = content.action
    const imageUrl = content.imageUrl
    const imageAlt = headingText ?? ""

    const heading = headingText === undefined
        ? undefined
        : defineLeafComponent("heading", {}, () => <Heading props={{ content: headingText, level: 2 }} />)
    const body = bodyText === undefined
        ? undefined
        : defineLeafComponent("text", {}, () => <p className="whitespace-pre-line text-muted">{bodyText}</p>)
    const actionLeaf = actionSpec === undefined
        ? undefined
        : defineLeafComponent("button", {}, () => <Button props={{ label: actionSpec.label, variant: "primary" }} />)
    const actionRun = actionLeaf === undefined
        ? undefined
        : defineContractComponent("inline-action-run", { action: [actionLeaf] })
    const figure = defineLeafComponent("image-frame", {}, () => (
        <Figure src={imageUrl} alt={imageAlt} />
    ))

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

/** The prepared pieces one custom shape arranges. */
type CustomPieces = ReturnType<typeof customPieces>

/**
 * `quote` - the expert's words, said by somebody.
 *
 * The quoted words fall back to the heading: a pull quote with nothing in it is a bordered blank,
 * and the heading is the only other sentence this shape was given.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const quoteBand = ({ bodyText, headingText, attribution }: CustomPieces) => {
    const quoted = bodyText ?? headingText
    const attributed: Array<BandPart> = attribution === undefined
        ? []
        : [defineLeafComponent("text", {}, () => (
            <Text props={{ content: `— ${attribution}`, size: "sm", tone: "muted" }} />
        ))]
    return (
        <Band
            parts={[
                defineLeafComponent("pull-quote", {}, () => (
                    <blockquote className="border-l-4 border-accent pl-4 text-xl font-medium leading-snug">
                        {quoted}
                    </blockquote>
                )),
                ...attributed,
            ]}
        />
    )
}

/**
 * `columns` - a grid of claims, each with an optional note under it.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const columnsBand = ({ heading, columns, actionRun }: CustomPieces) => (
    <Band
        parts={[
            ...(heading === undefined ? [] : [heading]),
            defineContractComponent("claim-panel-grid", {
                claim: columns.map((column) => {
                    const note = column.text
                    return claimPanel({
                        claim: defineLeafComponent("text", {}, () => (
                            <Text props={{ content: column.title, weight: "medium" }} />
                        )),
                        note: note === undefined
                            ? undefined
                            : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                <Text props={{ content: note, size: "sm", tone: "muted" }} />
                            )),
                    })
                }),
            }),
            ...(actionRun === undefined ? [] : [actionRun]),
        ]}
    />
)

/**
 * `cta` - one centred ask.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const ctaBand = ({ heading, body, actionLeaf }: CustomPieces) => (
    <Band
        alt
        parts={[
            defineContractComponent("centred-heading-body-action", {
                heading,
                body,
                action: actionLeaf,
            }),
        ]}
    />
)

/**
 * `image-left` and `image-right` - a picture beside the prose.
 *
 * BOTH DRAW THE SAME WAY for now. `figure-beside-prose` is one key whose `why` says the order is the
 * assembling branch's business, but `Tree` walks the entry's declared slot order, so the picture
 * always comes first. Mirroring the pair needs either a second key or a `Tree` that honours the
 * order of the record it is handed - a registry decision, not one to fake here with a class.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const figureBand = ({ figure, heading, body, actionLeaf }: CustomPieces) => (
    <Band
        parts={[
            defineContractComponent("figure-beside-prose", {
                figure,
                prose: defineContractComponent("heading-body-action-stack", {
                    heading,
                    body,
                    action: actionLeaf,
                }),
            }),
        ]}
    />
)

/**
 * `stack` - whatever the expert wrote, in reading order.
 *
 * This is also where an unrecognised shape lands: losing the styling still leaves something
 * readable, losing the words does not.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const stackBand = ({ heading, imageUrl, figure, body, actionRun }: CustomPieces) => (
    <Band
        parts={[
            ...(heading === undefined ? [] : [heading]),
            ...(imageUrl === undefined ? [] : [figure]),
            ...(body === undefined ? [] : [body]),
            ...(actionRun === undefined ? [] : [actionRun]),
        ]}
    />
)

/**
 * An expert-authored section, drawn in whatever shape the template chose.
 *
 * ONE RENDERER FOR EVERY CUSTOM SECTION, which is why one can never vanish: it needs no component
 * registered in advance. An unrecognised SYSTEM key is dropped - how an older build survives a newer
 * catalog - but that drop path cannot reach the expert's own work.
 *
 * WHAT THIS FUNCTION DECIDES IS THE SHAPE AND NOTHING ELSE. Each shape owns its own arrangement one
 * function away, so a reader who wants to know what `cta` looks like reads `cta` rather than the
 * four shapes it is not.
 *
 * There is no input field here, and there never will be (BR-B07).
 *
 * @param section - The expert's own content for one section.
 * @returns The band.
 */
const customBand = (section: Extract<AcademySection, { kind: "custom" }>) => {
    const pieces = customPieces(section.content)
    if (pieces.shape === "quote") {
        return quoteBand(pieces)
    }
    if (pieces.shape === "columns") {
        return columnsBand(pieces)
    }
    if (pieces.shape === "cta") {
        return ctaBand(pieces)
    }
    if (pieces.shape === "image-left" || pieces.shape === "image-right") {
        return figureBand(pieces)
    }
    return stackBand(pieces)
}

/**
 * Draw one settled section.
 *
 * EXHAUSTIVE BY CONSTRUCTION. `kind` is one value from a closed union, so every situation that
 * exists is drawn here and no situation that does not exist can be expressed. The connected half
 * already dropped the sections with nothing to show, which is why nothing below returns `null` for
 * an empty list - an absent section is a decision, and it was taken where the data was.
 *
 * @param section - One settled section.
 * @param onSubmitLead - Handed through to the one section that takes a reader's details.
 * @returns The band.
 */
const band = (section: AcademySection, onSubmitLead: LeadSubmit) => {
    switch (section.kind) {
        case "hero":
            return (
                <Band
                    parts={[
                        headingPart(section.name, 1),
                        textPart(section.tagline),
                        defineContractComponent("inline-action-run", {
                            action: [
                                buttonPart(section.tryFreeLabel, "primary", "/sign-in"),
                                buttonPart(section.seeCoursesLabel, "outline", "#courses"),
                            ],
                        }),
                    ]}
                />
            )

        case "problems":
            return (
                <Band
                    parts={[
                        headingPart(section.title),
                        defineContractComponent("claim-panel-grid", {
                            claim: section.problems.map((problem) => claimPanel({
                                claim: defineLeafComponent("text", {}, () => (
                                    <Text props={{ content: problem, size: "sm" }} />
                                )),
                            })),
                        }),
                    ]}
                />
            )

        case "outcomes":
            return (
                <Band
                    alt
                    parts={[
                        headingPart(section.title),
                        defineContractComponent("claim-panel-grid", {
                            claim: section.outcomes.map((outcome) => claimPanel({
                                claim: defineLeafComponent("text", {}, () => (
                                    <Text props={{ content: outcome, weight: "medium" }} />
                                )),
                            })),
                        }),
                    ]}
                />
            )

        case "roadmap":
            return (
                <Band
                    alt
                    parts={[
                        headingPart(section.title),
                        defineContractComponent("numbered-step-stack", {
                            step: section.steps.map((step, index) => defineContractComponent("step-number-then-instruction", {
                                ordinal: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                                    <Text props={{ content: String(index + 1), size: "sm", weight: "semibold" }} />
                                )),
                                instruction: defineLeafComponent("text", { size: "sm" }, () => (
                                    <Text props={{ content: step, size: "sm" }} />
                                )),
                            })),
                        }),
                    ]}
                />
            )

        case "instructor": {
            const person = section.person
            const quote = person.quote
            return (
                <Band
                    alt
                    parts={[
                        defineContractComponent("figure-beside-prose", {
                            figure: defineLeafComponent("image-frame", {}, () => (
                                <Figure src={person.photoUrl} alt={person.name} ratio="3/4" />
                            )),
                            prose: defineContractComponent("instructor-credibility-column", {
                                identity: subjectOverCaption(
                                    defineLeafComponent("heading", {}, () => (
                                        <Heading props={{ content: person.name, level: 2 }} />
                                    )),
                                    person.title,
                                ),
                                bio: defineLeafComponent("text", { tone: "muted" }, () => (
                                    <Text props={{ content: person.bio, tone: "muted" }} />
                                )),
                                // The middot that used to be typed into each credential string is
                                // gone: the list marker belongs to `credential-line-stack`, which is
                                // the node that knows these are an unordered set, not a sentence.
                                credentials: defineContractComponent("credential-line-stack", {
                                    credential: person.credentials.map((credential) => (
                                        defineLeafComponent("text", { size: "sm" }, () => (
                                            <Text props={{ content: credential, size: "sm" }} />
                                        ))
                                    )),
                                }),
                                quote: quote === undefined
                                    ? undefined
                                    : defineLeafComponent("pull-quote", {}, () => (
                                        <blockquote className="border-l-2 border-border pl-3">
                                            <Text props={{ content: quote, size: "sm", tone: "muted" }} />
                                        </blockquote>
                                    )),
                            }),
                        }),
                    ]}
                />
            )
        }

        case "stats":
            return (
                <Band
                    parts={[
                        defineContractComponent("captioned-cell-grid", {
                            cell: section.stats.map((stat) => subjectOverCaption(
                                // The figure is a title at outline level 2, not a hand-set size. The
                                // type scale belongs to the `Heading` atom, and level 1 is spoken
                                // for: the academy's own name is the page's one first-level heading.
                                defineLeafComponent("heading", {}, () => (
                                    <Heading props={{ content: stat.value, level: 2 }} />
                                )),
                                stat.label,
                            )),
                        }),
                    ]}
                />
            )

        case "testimonials":
            return (
                <Band
                    alt
                    parts={[
                        headingPart(section.title),
                        defineContractComponent("claim-panel-grid", {
                            claim: section.testimonials.map((testimonial) => {
                                const result = testimonial.result
                                return claimPanel({
                                    voice: defineContractComponent("avatar-identity-rating-row", {
                                        avatar: defineLeafComponent("avatar", {}, () => (
                                            <Avatar props={{ name: testimonial.name, src: testimonial.avatarUrl, size: "sm" }} />
                                        )),
                                        identity: subjectOverCaption(
                                            defineLeafComponent("text", {}, () => (
                                                <Text props={{ content: testimonial.name, size: "sm", weight: "medium" }} />
                                            )),
                                            testimonial.role,
                                        ),
                                        rating: defineLeafComponent("rating", {}, () => (
                                            <Text props={{ content: `${testimonial.stars}/${STAR_SCALE}`, size: "xs" }} />
                                        )),
                                    }),
                                    claim: defineLeafComponent("text", {}, () => (
                                        <Text props={{ content: testimonial.quote, size: "sm", tone: "muted" }} />
                                    )),
                                    proof: result === undefined
                                        ? undefined
                                        : defineLeafComponent("badge", {}, () => <Badge props={{ content: result }} />),
                                })
                            }),
                        }),
                    ]}
                />
            )

        case "gallery":
            return (
                <Band
                    parts={[
                        headingPart(section.title),
                        defineContractComponent("captioned-cell-grid", {
                            cell: section.gallery.map((item) => subjectOverCaption(
                                defineLeafComponent("image-frame", {}, () => (
                                    <Figure src={item.url} alt={item.caption} />
                                )),
                                item.caption,
                            )),
                        }),
                    ]}
                />
            )

        case "courses": {
            // An empty catalog still stands on the same ground a full one does, and that ground is
            // the surface branch's rather than the entry's - a band that swapped a card for a bare
            // centred column would read as a section that failed to load rather than one with
            // nothing in it yet.
            const emptyNotice = defineContractProjection("centred-empty-notice", () => (
                <SurfaceCard
                    contract="centred-empty-notice"
                    render={defineContractComponent("centred-empty-notice", {
                        notice: defineCompositeComponent("empty-notice", {}, () => (
                            <Tree
                                contract="empty-notice-stack"
                                render={defineContractComponent("empty-notice-stack", {
                                    message: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                        <Text props={{ content: section.emptyTitle, size: "sm", weight: "medium" }} />
                                    )),
                                    description: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                        <Text props={{ content: section.emptyBody, size: "xs" }} />
                                    )),
                                })}
                            />
                        )),
                    })}
                />
            ))
            // A course is a claim with an optional note and an optional proof, which is the panel
            // the problems and testimonials already stand in. A second card contract would look
            // identical and drift the first time one of them gained a state.
            const catalog = defineContractComponent("claim-panel-grid", {
                claim: section.courses.map((course) => claimPanel({
                    claim: defineLeafComponent("text", {}, () => (
                        <Text props={{ content: course.title, weight: "medium" }} />
                    )),
                    note: course.summary === null
                        ? undefined
                        : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text props={{ content: course.summary ?? "", size: "sm", tone: "muted" }} />
                        )),
                    proof: course.priceText === null
                        ? undefined
                        : defineLeafComponent("badge", {}, () => (
                            <Badge props={{ content: course.priceText ?? "" }} />
                        )),
                })),
            })
            return (
                <Band parts={[headingPart(section.title), section.courses.length === 0 ? emptyNotice : catalog]} />
            )
        }

        case "community":
            return <Band alt parts={[headingPart(section.title), textPart(section.body)]} />

        case "offer":
            return <Band parts={[headingPart(section.title), textPart(section.body)]} />

        case "faq":
            return (
                <Band
                    alt
                    parts={[
                        headingPart(section.title),
                        defineContractComponent("question-answer-list", {
                            entry: section.faq.map((entry) => defineContractComponent("question-over-answer", {
                                question: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                                    <Text props={{ content: entry.q, size: "sm", weight: "medium" }} />
                                )),
                                answer: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                    <Text props={{ content: entry.a, size: "sm", tone: "muted" }} />
                                )),
                            })),
                        }),
                    ]}
                />
            )

        case "magnet":
            return (
                <Band
                    alt
                    parts={[
                        headingPart(section.magnet.title),
                        textPart(section.magnet.description),
                        defineContractComponent("inline-action-run", {
                            action: [buttonPart(section.magnet.cta, "primary")],
                        }),
                    ]}
                />
            )

        case "lead":
            return <LeadBand section={section} onSubmit={onSubmitLead} />

        case "custom":
            return customBand(section)
    }
}

/** Props for {@link AcademySectionsBase}. */
export interface AcademySectionsViewProps {
    /** Every visible section, already resolved, in the expert's own order. */
    readonly sections: ReadonlyArray<AcademySection>
    /** Hand the reader's details to whoever owns the request. */
    readonly onSubmitLead: LeadSubmit
}

/**
 * Draw every settled section in the order it arrived.
 *
 * THE ORDER IS DATA, NOT MARKUP, and it was settled one file away. This list is already filtered and
 * already sorted; drawing it in any other order would be this file taking a decision it cannot see
 * the consequence of.
 *
 * @param input - {@link AcademySectionsViewProps}
 * @returns Every visible section, in the expert's order.
 */
export const AcademySectionsBase = ({ sections, onSubmitLead }: AcademySectionsViewProps) => (
    <Tree contract="academy-band-list" render={defineContractProjection("academy-band-list", () => (
        <>
        {/*
          * A keyed `Fragment` rather than a wrapper element. React needs a key per item and the band
          * below already owns its own node, so anything opened here would be a second host that no
          * registry entry describes - and a `display: contents` div is exactly that with its
          * consequences hidden.
          */}
        {sections.map((section) => (
            <Fragment key={section.id}>{band(section, onSubmitLead)}</Fragment>
        ))}
        </>
    ))} />
)
