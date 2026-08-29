import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";
import data from "./template.data.json";

/**
 * A value the expert authored once, or once per locale.
 *
 * THE PRODUCT STILL NEVER TRANSLATES ANYTHING, and this does not weaken that rule -- it is what
 * lets the rule survive a bilingual academy. Machine-translating a customer's biography would be
 * this product putting words in their mouth; an expert writing their own English version is the
 * customer speaking twice. The first is forbidden, the second was simply impossible before, so a
 * Vietnamese academy selling to both markets had to pick one and lose the other.
 *
 * A BARE VALUE MEANS "THE SAME IN EVERY LANGUAGE", which is the honest default for a proper noun.
 * "Học viện Mộc" is a name, not a sentence, and forcing it into `{ vi, en }` would invite somebody
 * to invent an English one.
 *
 * vn-ok: the quoted words are an example academy NAME, which is the very thing this paragraph says
 * must not be translated. Rewriting them in English to satisfy the rule would demonstrate the
 * mistake the comment exists to warn against.
 */
export type Localized<T> = T | Partial<Record<Locale, T>>;

/**
 * Whether a value is a per-locale map rather than the thing itself.
 *
 * Decided by the KEYS, because the alternative -- a marker field -- would have to be added to every
 * authored value including the ones that never vary. It is unambiguous here: no type in this file
 * has a field named `en` or `vi`, so an object whose keys are all locales cannot be anything else.
 *
 * @param value - The authored value.
 * @returns Whether to index it by locale.
 */
const isLocaleMap = <T,>(value: Localized<T>): value is Partial<Record<Locale, T>> => typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length > 0 && Object.keys(value).every(key => (LOCALES as ReadonlyArray<string>).includes(key));

/**
 * Reads an authored value in one locale.
 *
 * FALLS BACK RATHER THAN BLANKS. A template with only Vietnamese must still render for an English
 * reader -- the alternative is an empty section that looks like a bug and hides content the expert
 * did write. So: the asked-for locale, then the default, then whichever the expert did author.
 *
 * @param value - The authored value, bare or per-locale.
 * @param locale - The reader's locale.
 * @returns The value in the best available language, or undefined when there is nothing.
 */
export const inLocale = <T,>(value: Localized<T> | undefined, locale: Locale): T | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (!isLocaleMap(value)) {
    return value;
  }
  return value[locale] ?? value[DEFAULT_LOCALE] ?? Object.values(value)[0];
};

/**
 * THE MOUNTED TEMPLATE - this academy's entire appearance, as one file.
 *
 * WHY A FILE AND NOT A FETCH. Every academy runs as its own provisioned instance, so this app is
 * never serving two tenants at once. Provisioning writes this file into the image; the app reads it
 * at build time and renders. There is no tenant lookup, no per-request brand query, and no moment
 * where the page is up but unstyled - the three failure modes a runtime fetch would introduce for
 * no benefit an instance-per-academy deployment can use.
 *
 * WHAT REPLACES IT. `TenantBrandEntity` on the backend holds exactly these fields. Provisioning
 * serialises that row into the shape below. Until an academy is provisioned, the default at the
 * bottom of this file stands in, which is what lets the app run locally without a backend.
 *
 * THE CONTENT IS THE EXPERT'S; THE SHAPE IS THE TEMPLATE'S. A template sets colours, which sections
 * appear, in what order, and what shape an expert-authored section is drawn in. It never sets the
 * words. That division is the settled rule, and it is why re-applying a template cannot destroy
 * anything somebody wrote.
 */

/**
 * One colour scheme's worth of HeroUI variable overrides, keyed by the variable's OWN name.
 *
 * THE KEYS ARE THE VENDOR'S, DELIBERATELY. HeroUI documents theming as a `:root` / `.dark` block of
 * its own custom properties, and this app is built on HeroUI -- so a template overrides those names
 * directly instead of a vocabulary of ours mapped onto them. An indirection would have bought
 * vendor-independence this app has not chosen, and charged for it twice: every knob HeroUI exposes
 * and our map forgot would be unreachable, and every knob it adds later would need a code change
 * before a template could use it. `--muted` was already the first casualty of exactly that.
 *
 * So the full surface is available -- `--danger`, `--success`, `--focus`, the `--field-*` family,
 * `--overlay`, `--segment`, `--separator`, `--scrollbar`, `--radius`, `--field-radius`,
 * `--font-sans` -- with no list here to keep in step with the vendor's docs.
 *
 * OPEN MAP, CLOSED SHAPE. Any `--name` may be set, and that is safe because of what the shape
 * cannot say rather than what the list allows: a custom-property declaration is not a selector, so
 * nothing here can restructure the page. {@link isSafeThemeValue} enforces the rest -- no `;`, no
 * braces, no `url(`, nothing that could close the declaration and start a rule. That is the line
 * between this and {@link AcademyTemplate.customCss}, which CAN write selectors and is only safe
 * because the backend sanitised it.
 *
 * EVERY ENTRY IS OPTIONAL. Whatever a template omits keeps the value from HeroUI's own stylesheet,
 * which is what makes an unprovisioned instance render as the vendor intends.
 */
export type ThemeVariables = Record<string, string>;

/** A template's overrides for both colour schemes. `dark` may be omitted entirely. */
export interface AcademyTheme {
  light?: ThemeVariables;
  dark?: ThemeVariables;
}

/**
 * Rejects anything that could escape a custom-property declaration.
 *
 * Mirrors the backend's `isSafeTokenValue`. The check is on the VALUE because the key is already
 * constrained to a custom-property name: a value carrying `;` or `}` could close the declaration
 * and open a rule, which is the one way a token map could become a stylesheet.
 *
 * @param value - The proposed variable value.
 * @returns Whether it is safe to emit.
 */
export const isSafeThemeValue = (value: string): boolean => typeof value === "string" && value.length > 0 && value.length <= 200 && !/[;{}<>]/.test(value) && !/url\s*\(|expression\s*\(|@import/i.test(value);

/**
 * Every section this app knows how to draw, in catalog order.
 *
 * This list must stay identical to the backend's `LANDING_SECTION_KEYS`. A key the backend sends
 * that is missing here is skipped rather than rendered, which is how an older build survives a
 * newer catalog; the cost is a section the expert configured and cannot see, so the two lists
 * drifting is a real defect and not a tolerance.
 */
export const SYSTEM_SECTION_KEYS = ["hero", "problems", "outcomes", "roadmap", "instructor", "stats", "testimonials", "gallery", "courses", "community", "offer", "faq", "magnet", "lead"] as const;

/** One of the fixed sections. */
export type SystemSectionKey = typeof SYSTEM_SECTION_KEYS[number];

/** What marks a section the expert wrote rather than one the product ships. */
export const CUSTOM_SECTION_PREFIX = "custom:";

/**
 * The shape an expert-authored section is drawn in. A CLOSED set, like the colour slots.
 *
 * Closed because a free-form shape is free-form layout, which is code - the thing ruled out when
 * expert-authored sections were settled as static content.
 *
 * There is deliberately no full-bleed banner. It is the easiest shape in which to build something
 * that reads as a system notice, which is the deception BR-B07 exists to prevent, reached through
 * layout instead of through an input field.
 */
export type CustomVariant = "stack" | "image-left" | "image-right" | "quote" | "columns" | "cta";

/** The single onward link an expert-authored section may carry. Never a field. */
export interface CustomAction {
  label: string;
  href: string;
}

/** One item inside the `columns` shape. */
export interface CustomColumn {
  title: string;
  text?: string;
}

/**
 * What an expert-authored section says. Static; it names no data source.
 *
 * Static on purpose: a section bound to nothing cannot break when a course is deleted, and needs no
 * closed set of permitted sources to be designed first.
 */
export interface CustomContent {
  /** Set by the template, not by the expert. */
  variant?: CustomVariant;
  heading?: string;
  /** Plain text. No markup is interpreted. */
  body?: string;
  /** A link the expert pasted. Nothing is uploaded to nivo. */
  imageUrl?: string;
  action?: CustomAction;
  /** Used by the `columns` shape only. */
  columns?: Array<CustomColumn>;
  /** Used by the `quote` shape only. */
  attribution?: string;
}

/** One row of the stored layout. Position in the array IS render order. */
export interface LayoutSection {
  /** A catalog key, or `custom:<id>` for one the expert wrote. */
  key: string;
  visible: boolean;
  /** Present on expert-authored sections only; a system section owns its own content. */
  content?: CustomContent;
}

/** Who is teaching. */
export interface Instructor {
  name: string;
  /** Portrait, as a pasted link. */
  photoUrl?: string;
  title: string;
  bio: string;
  credentials: Array<string>;
  quote?: string;
}

/** One testimonial. A measurable result carries further than praise. */
export interface Testimonial {
  name: string;
  avatarUrl?: string;
  role: string;
  stars: number;
  quote: string;
  result?: string;
}

/** One figure on the statistics strip. */
export interface Stat {
  value: string;
  label: string;
}

/** One gallery photo: the expert's link, plus a caption. */
export interface GalleryItem {
  url?: string;
  caption: string;
}

/** One frequently asked question. */
export interface Faq {
  q: string;
  a: string;
}

/** Something free offered in exchange for contact. It collects nothing; its button leads to `lead`. */
export interface Magnet {
  title: string;
  description: string;
  cta: string;
}

/** Everything provisioning writes into this instance. */
export interface AcademyIdentity {
  /** The academy's own name, shown in the header and the document title. */
  name: Localized<string>;
  tagline: Localized<string>;
}

/**
 * What the expert wrote, as opposed to how it is arranged or painted.
 *
 * EVERY FIELD IS LOCALIZED AS A WHOLE, not leaf by leaf. An expert writing their English version
 * writes it in one sitting, and the two versions need not match shape -- four Vietnamese questions
 * and three English ones is a normal thing for a real academy, and a per-leaf `{ vi, en }` would
 * have forbidden it while making every value harder to read and to diff.
 */
export interface AcademyContent {
  instructor?: Localized<Instructor>;
  testimonials: Localized<Array<Testimonial>>;
  stats: Localized<Array<Stat>>;
  gallery: Localized<Array<GalleryItem>>;
  problems: Localized<Array<string>>;
  roadmap: Localized<Array<string>>;
  faq: Localized<Array<Faq>>;
  magnet?: Localized<Magnet>;
}

/** Which sections render, and in what order. */
export interface AcademyLayout {
  /** The full ordered section list, exactly as `TenantBrandEntity.layoutConfig` stores it. */
  sections: Array<LayoutSection>;
}

/**
 * Everything provisioning writes into this instance, in four parts that do not mix.
 *
 * WHY FOUR AND NOT TWO. The obvious split is `layout` and `css`, and it is one short of what the
 * problem has. `theme` and `customCss` are both "how it looks" and they are NOT interchangeable:
 * the first can only ever produce custom-property declarations, so it cannot restructure a page
 * however it is filled in; the second is arbitrary text with real selectors in it, safe only
 * because something cleaned it first. The backend keeps them
 * in separate columns behind separate sanitisers, and `theme-sanitizer.ts` records what happened
 * the one time they were folded together -- every real selector an expert wrote was silently
 * stripped, because the stricter of the two rules won. A single `css` key invites that back by
 * making the shape stop saying which half is which.
 *
 * `identity` and `content` are the other two, and they are neither layout nor paint. Forcing a
 * name, a biography and a testimonial into one of two buckets is what makes a two-key object read
 * wrong the first time somebody looks for them.
 *
 * NO COURSES ANYWHERE. A course is a row the expert owns in their own database; `layoutConfig` on
 * the backend says the same thing about the `courses` section, which "carries no content here
 * because it already knows its own". That absence is what makes re-applying a template safe.
 */
export interface AcademyTemplate {
  identity: AcademyIdentity;
  /** HeroUI variable overrides, per colour scheme. Emitted as the vendor's own theming block. */
  theme: AcademyTheme;
  /**
   * Hand-written CSS, already sanitised by the backend's `sanitizeTenantCss`.
   *
   * Real selectors survive here -- this is the escape hatch an admin is meant to write
   * `.my-class { … }` in -- while `@import`, `url()`, `expression()` and friends do not. It is
   * inlined rather than served as a file so it cannot arrive after the page has painted.
   *
   * Separate from `theme` on purpose: this is the half that is only safe because something
   * cleaned it.
   */
  customCss?: string;
  layout: AcademyLayout;
  content: AcademyContent;
}

/**
 * This instance's mounted template, as DATA rather than as source.
 *
 * WHY A JSON FILE AND NOT A LITERAL HERE. Provisioning writes one academy's appearance into the
 * image, and a value it has to write is a value it has to be able to overwrite. A TypeScript
 * literal makes that a code edit -- a generator emitting source, and a diff nobody can read as
 * "this is what the customer configured". `template.data.json` is the same shape with nothing
 * around it, so injecting a template is replacing one file whose entire content is the answer.
 *
 * WHAT IS COMMITTED IS THE UNPROVISIONED DEFAULT, and it is deliberately sparse rather than a
 * showcase: the empty states are the ones a real academy hits on its first day, so they are the
 * ones worth having in front of us by default. An academy with no courses, no testimonials and no
 * photographs must still read as a finished page. `npm run academy:inject` replaces it with the
 * template held in `.stacks/dev/runtime/config/academy-template.json`.
 *
 * THE FILE IS STILL READ AT BUILD TIME, not fetched. `sections.tsx` is a client module and imports
 * this one, so nothing here may touch the filesystem at runtime; a static import is what keeps the
 * page renderable with no backend, no tenant lookup and no unstyled first paint.
 *
 * NO COURSES LIVE HERE, and the absence is the design: a course is a row the expert edits in their
 * own database, not a presentation choice a template makes. `AcademyTemplate` has no field for one,
 * and the `courses` SECTION draws whatever the academy has -- which is what lets re-applying a
 * template be safe.
 */
export const ACADEMY: AcademyTemplate = data as AcademyTemplate;
