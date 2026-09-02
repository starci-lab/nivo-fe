"use client";
import { SurfaceCard, Button, Heading, Text, Badge } from "@starci/grammar/common";

/* The section renderer intentionally assembles heterogeneous ReactNode arrays. */
import { Fragment, useState, type ReactNode } from "react";
import { CUSTOM_BODY_CLASS_NAME, FIGURE_CLASS_NAME, FIGURE_IMAGE_CLASS_NAME, FIGURE_PLACEHOLDER_CLASS_NAME, PULL_QUOTE_CLASS_NAME, QUOTE_CLASS_NAME, LEAD_INPUT_CLASS_NAME } from "./classNames";
import { Avatar, Label } from "@nivo/ui";
import type { AcademySection, LeadSubmit } from "./index";

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
 * Each section uses ordinary semantic React elements and shared UI components. The block owns the
 * page-specific composition while the shared components own reusable visual behavior.
 *
 * THE LOCAL STATE THAT REMAINS IS UI STATE, NOT THE WORLD. A picture that failed to load and a form
 * that is mid-submit are facts about this render, not about the product's data - neither can be
 * decided one file away, and neither makes this file unrenderable from a fixture.
 */

/** Everything one band stacks, in reading order. */
type BandParts = ReadonlyArray<ReactNode>;

/** One of those parts. */
type BandPart = BandParts[number];

/** Props for {@link Band}. */
type BandProps = {
  /** Whether this band takes the alternating ground so a reader can count sections. */
  readonly alt?: boolean;
  /** What the band says, top to bottom. */
  readonly parts: BandParts;
};

/**
 * One band of the page.
 *
 * The band owns its ground and semantic grouping locally. Its markup stays intentionally small so
 * alternating sections remain easy to scan and test.
 *
 * @param input - {@link BandProps}
 */
const Band = ({
  alt = false,
  parts
}: BandProps) => {
  const column = <div>{parts}</div>;
  if (alt) {
    return <div>{column}</div>;
  }
  return <div>{column}</div>;
};

/** Props for {@link Figure}. */
type FigureProps = {
  /** The link the expert pasted, when there is one. */
  readonly src?: string;
  /** What the picture shows, for a reader who cannot see it. */
  readonly alt: string;
  /** The shape of the space the picture holds. */
  readonly ratio?: string;
};

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
const Figure = ({
  src,
  alt,
  ratio = "4/3"
}: FigureProps) => {
  const [failed, setFailed] = useState(false);
  const usable = src !== undefined && src !== "" && !failed;
  return <figure className={FIGURE_CLASS_NAME} style={{
    aspectRatio: ratio
  }}>
      
            {usable ? <img src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setFailed(true)} className={FIGURE_IMAGE_CLASS_NAME} /> : <svg viewBox="-64 -64 192 192" className={FIGURE_PLACEHOLDER_CLASS_NAME} aria-hidden="true">
                        <circle cx="32" cy="22" r="12" fill="currentColor" />
                        <path d="M8 62c0-13 11-22 24-22s24 9 24 22z" fill="currentColor" />
                    </svg>}
        </figure>;
};

/**
 * A title, as the leaf identity a band part admits.
 *
 * @param content - The already-resolved words.
 * @param level - Where the title sits in the document outline.
 */
const headingPart = (content: string, level: 1 | 2 = 2) => <Heading level={level}>{content}</Heading>;

/**
 * A paragraph of supporting copy, as the leaf identity a band part admits.
 *
 * @param content - The already-resolved words.
 */
const textPart = (content: string) => <Text tone="muted">{content}</Text>;

/**
 * One press, as the leaf identity an action run admits.
 *
 * @param label - The already-resolved label.
 * @param variant - Whether this is the main press or the alternative beside it.
 * @param href - Where it leads, when it leads anywhere.
 */
const buttonPart = (label: string, variant: "primary" | "outline", href?: string) => href === undefined ? <Button
  variant={variant}
>{label}</Button> : <a href={href}><Button
  variant={variant}
>{label}</Button></a>;

/**
 * A muted caption under a subject, the pair three sections all reach for.
 *
 * The caption helper accepts one subject and keeps the surrounding layout explicit at the call
 * site, so a grid cannot accidentally be passed where a single subject belongs.
 */
const subjectOverCaption = (subject: ReactNode, caption: string) => <div>{subject}

  <Text size="xs">{caption}</Text></div>;

/**
 * One claim, standing on a surface of its own.
 *
 * THE GROUND IS THE BRANCH'S, NOT THE ENTRY'S. `attributed-claim-panel` says how a speaker, a claim
 * and a proof chip sit together; the card they sit on is paint, and paint has one owner in this
 * repository - the named surface branch. `SurfaceCard` with no label draws that ground and nothing
 * above it, which is what a card in a grid of cards wants: a heading over each one would repeat the
 * grid's own title four times.
 *
 * The card keeps the claim's optional parts together while leaving the surrounding grid free to
 * choose its own layout.
 */
type ClaimPanelSlots = {
  readonly voice?: ReactNode;
  readonly claim?: ReactNode;
  readonly note?: ReactNode;
  readonly proof?: ReactNode;
};
const claimPanel = (slots: ClaimPanelSlots) => <SurfaceCard>
    <div>{slots.voice}{slots.claim}{slots.note}{slots.proof}</div>
  </SurfaceCard>;

/**
 * The scale a testimonial's score is read against.
 *
 * The score is stated as a figure so the value remains readable without relying on emoji glyphs.
 */
const STAR_SCALE = 5;

/** One control the lead form draws: its identity, its label, and the keyboard it asks for. */
type LeadField = readonly [id: string, label: string, kind: "text" | "tel"];

/** Where a reader's details have got to. */
type LeadStatus = "idle" | "sending" | "sent" | "failed";

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
  const value = form.get(field);
  return typeof value === "string" ? value : "";
};

/** What {@link leadForm} needs to draw the controls and to say where the submission has got to. */
type LeadFormInput = {
  /** The controls, in reading order. */
  readonly fields: ReadonlyArray<LeadField>;
  /** Where the submission has got to. */
  readonly status: LeadStatus;
  /** The press label at rest. */
  readonly submitLabel: string;
  /** The press label while the request is in flight. */
  readonly sendingLabel: string;
  /** What submitting does. */
  readonly onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
};

/**
 * The lead form keeps its native HTML form semantics.
 *
 * It is built beside the other page parts so the form remains stable while its status changes.
 *
 * THE BOX IS STILL THE PLATFORM'S. The `Input` leaf's `kind` union has no `tel` member, and a phone
 * number typed into a `text` box offers a phone the wrong keyboard. Rather than change that
 * silently, the box keeps its own type here - a finding for whoever owns the leaf's vocabulary.
 *
 * @param input - {@link LeadFormInput}
 */
const leadForm = ({
  fields,
  status,
  submitLabel,
  sendingLabel,
  onSubmit
}: LeadFormInput) => {
  const locked = status === "sending" || status === "sent";
  return <form onSubmit={onSubmit}>
            <div>{fields.map(([id, label, kind]) => <div key={id}>{<Label props={{
          htmlFor: id,
          content: label
        }} />}{<input id={id} name={id} type={kind} placeholder={label} required disabled={locked} className={LEAD_INPUT_CLASS_NAME} />}</div>)}{<Button
          variant="primary"
          type="submit"
          isDisabled={locked}
        >{status === "sending" ? sendingLabel : submitLabel}</Button>}</div>


      
      
        </form>;
};

/** Props for {@link LeadBand}. */
type LeadBandProps = {
  /** The settled words for this section. */
  readonly section: Extract<AcademySection, {
    kind: "lead";
  }>;
  /** Hand the reader's details to whoever owns the request. */
  readonly onSubmit: LeadSubmit;
};

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
const LeadBand = ({
  section,
  onSubmit
}: LeadBandProps) => {
  const [status, setStatus] = useState<LeadStatus>("idle");
  const fields: ReadonlyArray<LeadField> = [["lead-name", section.nameLabel, "text"], ["lead-phone", section.phoneLabel, "tel"]];

  /**
   * Sends the reader's details.
   *
   * READ FROM THE FORM, NOT FROM STATE. Two controlled inputs would re-render the whole band on
   * every keystroke to hold two strings that are only ever read once, at submit.
   *
   * @param event - The submit that started it.
   */
  const send = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") {
      return;
    }
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    const ok = await onSubmit({
      name: leadField(form, "lead-name"),
      contact: leadField(form, "lead-phone")
    });
    setStatus(ok ? "sent" : "failed");
  };
  return <Band alt parts={[headingPart(section.title), textPart(section.body), leadForm({
    fields,
    status,
    submitLabel: section.submitLabel,
    sendingLabel: section.sendingLabel,
    onSubmit: event => {
      void send(event);
    }
  }),
  /* Keep submission feedback in the band so it remains visible after the form state changes. */
  ...(status === "failed" ? [textPart(section.errorMessage)] : []), ...(status === "sent" ? [textPart(section.sentMessage)] : [])]} />;
};

/** Everything an expert authored for one section, whatever shape the template chose for it. */
type CustomContent = Extract<AcademySection, {
  kind: "custom";
}>["content"];

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
  const headingText = content.heading;
  const bodyText = content.body;
  const actionSpec = content.action;
  const imageUrl = content.imageUrl;
  const imageAlt = headingText ?? "";
  const heading = headingText === undefined ? undefined : <Heading level={2}>{headingText}</Heading>;
  const body = bodyText === undefined ? undefined : <p className={CUSTOM_BODY_CLASS_NAME}>{bodyText}</p>;
  const actionLeaf = actionSpec === undefined ? undefined : <Button
    variant="primary"
  >{actionSpec.label}</Button>;
  const actionRun = actionLeaf === undefined ? undefined : <div><>{actionLeaf}</></div>;
  const figure = <Figure src={imageUrl} alt={imageAlt} />;
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
    figure
  };
};

/** The prepared pieces one custom shape arranges. */
type CustomPieces = ReturnType<typeof customPieces>;

/**
 * `quote` - the expert's words, said by somebody.
 *
 * The quoted words fall back to the heading: a pull quote with nothing in it is a bordered blank,
 * and the heading is the only other sentence this shape was given.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const quoteBand = ({
  bodyText,
  headingText,
  attribution
}: CustomPieces) => {
  const quoted = bodyText ?? headingText;
  const attributed: Array<BandPart> = attribution === undefined ? [] : [<Text size="sm" tone="muted">{`— ${attribution}`}</Text>];
  return <Band parts={[<blockquote key="quote" className={PULL_QUOTE_CLASS_NAME}>
                        {quoted}
                    </blockquote>, ...attributed]} />;
};

/**
 * `columns` - a grid of claims, each with an optional note under it.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const columnsBand = ({
  heading,
  columns,
  actionRun
}: CustomPieces) => <Band parts={[...(heading === undefined ? [] : [heading]), <div key="columns">{columns.map(column => {
    const note = column.text;
    return claimPanel({
      claim: <Text weight="medium">{column.title}</Text>,
      note: note === undefined ? undefined : <Text size="sm" tone="muted">{note}</Text>
    });
  })}</div>, ...(actionRun === undefined ? [] : [actionRun])]} />;

/**
 * `cta` - one centred ask.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const ctaBand = ({
  heading,
  body,
  actionLeaf
}: CustomPieces) => <Band alt parts={[<div key="cta">{heading}{body}{actionLeaf}</div>]} />;

/**
 * `image-left` and `image-right` - a picture beside the prose.
 *
 * Both variants draw the same accessible picture-and-prose arrangement for now.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const figureBand = ({
  figure,
  heading,
  body,
  actionLeaf
}: CustomPieces) => <Band parts={[<div key="figure">{figure}{<div>{heading}{body}{actionLeaf}</div>}</div>]} />;

/**
 * `stack` - whatever the expert wrote, in reading order.
 *
 * This is also where an unrecognised shape lands: losing the styling still leaves something
 * readable, losing the words does not.
 *
 * @param pieces - {@link CustomPieces}
 * @returns The band.
 */
const stackBand = ({
  heading,
  imageUrl,
  figure,
  body,
  actionRun
}: CustomPieces) => <Band parts={[...(heading === undefined ? [] : [heading]), ...(imageUrl === undefined ? [] : [figure]), ...(body === undefined ? [] : [body]), ...(actionRun === undefined ? [] : [actionRun])]} />;

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
const customBand = (section: Extract<AcademySection, {
  kind: "custom";
}>) => {
  const pieces = customPieces(section.content);
  if (pieces.shape === "quote") {
    return quoteBand(pieces);
  }
  if (pieces.shape === "columns") {
    return columnsBand(pieces);
  }
  if (pieces.shape === "cta") {
    return ctaBand(pieces);
  }
  if (pieces.shape === "image-left" || pieces.shape === "image-right") {
    return figureBand(pieces);
  }
  return stackBand(pieces);
};

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
      return <Band parts={[headingPart(section.name, 1), textPart(section.tagline), <div key="hero-actions">{[buttonPart(section.tryFreeLabel, "primary", "/sign-in"), buttonPart(section.seeCoursesLabel, "outline", "#courses")]}</div>]} />;
    case "problems":
      return <Band parts={[headingPart(section.title), <div key="problems">{section.problems.map(problem => <Fragment key={problem}>{claimPanel({
            claim: <Text size="sm">{problem}</Text>
          })}</Fragment>)}</div>]} />;
    case "outcomes":
      return <Band alt parts={[headingPart(section.title), <div key="outcomes">{section.outcomes.map(outcome => <Fragment key={outcome}>{claimPanel({
            claim: <Text weight="medium">{outcome}</Text>
          })}</Fragment>)}</div>]} />;
    case "roadmap":
      return <Band alt parts={[headingPart(section.title), <div key="roadmap">{section.steps.map((step, index) => <div key={step}>{<Text size="sm" weight="semibold">{String(index + 1)}</Text>}{<Text size="sm">{step}</Text>}</div>)}</div>]} />;
    case "instructor":
      {
        const person = section.person;
        const quote = person.quote;
        return <Band alt parts={[<div key="instructor">{<Figure src={person.photoUrl} alt={person.name} ratio="3/4" />}{<div>{subjectOverCaption(<Heading level={2}>{person.name}</Heading>, person.title)}{<Text tone="muted">{person.bio}</Text>}{<div>{person.credentials.map(credential => <Text size="sm">{credential}</Text>)}</div>}{quote === undefined ? undefined : <blockquote key="quote" className={QUOTE_CLASS_NAME}>
                                            <Text size="sm" tone="muted">{quote}</Text>
                                        </blockquote>}</div>}</div>]} />;
      }
    case "stats":
      return <Band parts={[<div key="stats">{section.stats.map(stat => <Fragment key={stat.label}>{subjectOverCaption(
          // The figure is a title at outline level 2, not a hand-set size. The
          // type scale belongs to the `Heading` atom, and level 1 is spoken
          // for: the academy's own name is the page's one first-level heading.

          <Heading level={2}>{stat.value}</Heading>, stat.label)}</Fragment>)}</div>]} />;
    case "testimonials":
      return <Band alt parts={[headingPart(section.title), <div key="testimonials">{section.testimonials.map(testimonial => {
          const result = testimonial.result;
          return <Fragment key={testimonial.name}>{claimPanel({
              voice: <div>{<Avatar props={{
                  name: testimonial.name,
                  src: testimonial.avatarUrl,
                  size: "sm"
                }} />}{subjectOverCaption(<Text size="sm" weight="medium">{testimonial.name}</Text>, testimonial.role)}{<Text size="xs">{`${testimonial.stars}/${STAR_SCALE}`}</Text>}</div>,
              claim: <Text size="sm" tone="muted">{testimonial.quote}</Text>,
              proof: result === undefined ? undefined : <Badge>{result}</Badge>
            })}</Fragment>;
        })}</div>]} />;
    case "gallery":
      return <Band parts={[headingPart(section.title), <div key="gallery">{section.gallery.map(item => <Fragment key={item.caption}>{subjectOverCaption(<Figure src={item.url} alt={item.caption} />, item.caption)}</Fragment>)}</div>]} />;
    case "courses":
      {
        // An empty catalog still stands on the same ground a full one does, and that ground is
        // the surface branch's rather than the entry's - a band that swapped a card for a bare
        // centred column would read as a section that failed to load rather than one with
        // nothing in it yet.
        const emptyNotice = <SurfaceCard><div>{<div>{<Text size="sm" weight="medium">{section.emptyTitle}</Text>}{<Text size="xs">{section.emptyBody}</Text>}</div>}</div></SurfaceCard>;

        // A course is a claim with an optional note and an optional proof, using the same card
        // composition as the other catalog entries.
        const catalog = <div>{section.courses.map(course => claimPanel({
            claim: <Text weight="medium">{course.title}</Text>,
            note: course.summary === null ? undefined : <Text size="sm" tone="muted">{course.summary ?? ""}</Text>,
            proof: course.priceText === null ? undefined : <Badge>{course.priceText ?? ""}</Badge>
          }))}</div>;
        return <Band parts={[headingPart(section.title), section.courses.length === 0 ? emptyNotice : catalog]} />;
      }
    case "community":
      return <Band alt parts={[headingPart(section.title), textPart(section.body)]} />;
    case "offer":
      return <Band parts={[headingPart(section.title), textPart(section.body)]} />;
    case "faq":
      return <Band alt parts={[headingPart(section.title), <div key="faq">{section.faq.map(entry => <div key={entry.q}>{<Text size="sm" weight="medium">{entry.q}</Text>}{<Text size="sm" tone="muted">{entry.a}</Text>}</div>)}</div>]} />;
    case "magnet":
      return <Band alt parts={[headingPart(section.magnet.title), textPart(section.magnet.description), <div key="magnet-actions">{[buttonPart(section.magnet.cta, "primary")]}</div>]} />;
    case "lead":
      return <LeadBand section={section} onSubmit={onSubmitLead} />;
    case "custom":
      return customBand(section);
  }
};

/** Props for {@link AcademySectionsBase}. */
export interface AcademySectionsProps {
  /** Every visible section, already resolved, in the expert's own order. */
  readonly sections: ReadonlyArray<AcademySection>;
  /** Hand the reader's details to whoever owns the request. */
  readonly onSubmitLead: LeadSubmit;
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
export const AcademySectionsBase = (props: AcademySectionsProps) => <>
        {/* A keyed Fragment keeps React's list identity without adding an unnecessary wrapper. */}
        {props.sections.map(section => <Fragment key={section.id}>{band(section, props.onSubmitLead)}</Fragment>)}
        </>;
